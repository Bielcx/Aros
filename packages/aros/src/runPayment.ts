import type { PaymentStatus } from '@base-org/account';
import { defineConfig } from './config.js';
import type { ResolvedAroConfig } from './config.js';
import { createOrder } from './createOrder.js';
import type { CreateOrderInput } from './createOrder.js';
import { toMessage } from './errors.js';
import { loadBaseSdk } from './sdk.js';
import { buildReceipt } from './receipt.js';
import type { AroConfig, AroOrder, AroReceipt, AroStatus } from './types.js';
import { watchPayment } from './watchPayment.js';

export type AroEvent =
  | { type: 'order'; order: AroOrder }
  | { type: 'sent'; order: AroOrder; paymentId: string }
  | { type: 'poll'; order: AroOrder; status: PaymentStatus | null; elapsedMs: number }
  | { type: 'confirmed'; order: AroOrder; receipt: AroReceipt }
  | { type: 'failed'; order: AroOrder; reason: string }
  | { type: 'expired'; order: AroOrder }
  | { type: 'error'; order: AroOrder | null; message: string; error: unknown };

export interface RunPaymentOptions extends CreateOrderInput {
  signal?: AbortSignal;
  onEvent?: (event: AroEvent) => void;
}

export interface RunPaymentResult {
  status: AroStatus;
  order: AroOrder | null;
  receipt: AroReceipt | null;
  error: string | null;
}

/**
 * O fluxo inteiro de um pagamento, sem depender de framework:
 * monta o pedido, abre a carteira, acompanha ate confirmar.
 *
 * O React e o JS puro compartilham isto; a diferenca entre os dois e so
 * como desenham a tela.
 */
export async function runPayment(
  config: AroConfig | ResolvedAroConfig,
  options: RunPaymentOptions = {},
): Promise<RunPaymentResult> {
  const { signal, onEvent, ...orderInput } = options;
  const resolved = defineConfig(config);

  let order: AroOrder | null = null;

  try {
    order = createOrder(resolved, orderInput);
    onEvent?.({ type: 'order', order });

    const { buildAttributionSuffix } = await import('./attribution.js');
    const dataSuffix = buildAttributionSuffix({
      reference: order.reference,
      ...(resolved.builderCode ? { builderCode: resolved.builderCode } : {}),
    });

    const { pay } = await loadBaseSdk();
    const payment = await pay({
      amount: order.amount,
      to: order.recipient,
      ...(dataSuffix ? { dataSuffix } : {}),
      testnet: resolved.testnet,
    });

    onEvent?.({ type: 'sent', order, paymentId: payment.id });

    const watched = await watchPayment({
      id: payment.id,
      expected: { amount: order.amount, recipient: order.recipient },
      testnet: resolved.testnet,
      timeoutMs: resolved.timeoutMs,
      pollIntervalMs: resolved.pollIntervalMs,
      ...(resolved.bundlerUrl ? { bundlerUrl: resolved.bundlerUrl } : {}),
      ...(signal ? { signal } : {}),
      onPoll: (status, elapsedMs) => {
        onEvent?.({ type: 'poll', order: order as AroOrder, status, elapsedMs });
      },
    });

    if (watched.outcome === 'confirmed') {
      const receipt = buildReceipt({
        paymentId: payment.id,
        reference: order.reference,
        amount: order.amount,
        recipient: order.recipient,
        storeName: resolved.storeName,
        testnet: resolved.testnet,
        ...(watched.status?.sender ? { sender: watched.status.sender } : {}),
        ...(resolved.receiptBaseUrl ? { receiptBaseUrl: resolved.receiptBaseUrl } : {}),
      });
      onEvent?.({ type: 'confirmed', order, receipt });
      return { status: 'confirmed', order, receipt, error: null };
    }

    if (watched.outcome === 'failed') {
      const reason = watched.status?.reason ?? watched.status?.message ?? 'A transacao falhou.';
      onEvent?.({ type: 'failed', order, reason });
      return { status: 'failed', order, receipt: null, error: reason };
    }

    if (watched.outcome === 'aborted') {
      return { status: 'idle', order, receipt: null, error: null };
    }

    onEvent?.({ type: 'expired', order });
    return { status: 'expired', order, receipt: null, error: null };
  } catch (error) {
    const message = toMessage(error);
    onEvent?.({ type: 'error', order, message, error });
    return { status: 'error', order, receipt: null, error: message };
  }
}
