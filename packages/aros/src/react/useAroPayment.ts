import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defineConfig } from '../config.js';
import type { CreateOrderInput } from '../createOrder.js';
import { runPayment } from '../runPayment.js';
import type { AroConfig, AroOrder, AroReceipt, AroStatus } from '../types.js';
import { buildWhatsappUrl } from '../whatsapp.js';

export interface UseAroPaymentOptions {
  onConfirmed?: (receipt: AroReceipt) => void;
  onExpired?: (order: AroOrder) => void;
  onError?: (message: string) => void;
}

export interface UseAroPayment {
  status: AroStatus;
  order: AroOrder | null;
  receipt: AroReceipt | null;
  error: string | null;
  /** Ha quanto tempo o pagamento esta sendo aguardado. */
  elapsedMs: number;
  /** true enquanto a carteira esta aberta ou o pagamento esta sendo aguardado. */
  isBusy: boolean;
  /** Link de contato com o lojista. Null se o config nao tem WhatsApp. */
  whatsappUrl: string | null;
  start: (input?: CreateOrderInput) => Promise<void>;
  /** Para de acompanhar sem cancelar o pagamento: o dinheiro ja saiu. */
  cancel: () => void;
  reset: () => void;
}

interface State {
  status: AroStatus;
  order: AroOrder | null;
  receipt: AroReceipt | null;
  error: string | null;
  elapsedMs: number;
}

const INITIAL: State = {
  status: 'idle',
  order: null,
  receipt: null,
  error: null,
  elapsedMs: 0,
};

/**
 * Estado de um pagamento Aros dentro de um componente React.
 *
 * Roda inteiro no navegador. Se a aba fechar durante a espera, este estado
 * se perde -- mas o pagamento nao: ele ja esta na chain, e o recibo continua
 * verificavel pelo link (ver receipt.ts).
 */
export function useAroPayment(
  config: AroConfig,
  options: UseAroPaymentOptions = {},
): UseAroPayment {
  const [state, setState] = useState<State>(INITIAL);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  // Falha cedo se o config estiver errado, em vez de na hora da venda.
  const resolved = useMemo(() => defineConfig(config), [config]);

  const start = useCallback(
    async (input: CreateOrderInput = {}) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ ...INITIAL, status: 'starting' });

      const result = await runPayment(resolved, {
        ...input,
        signal: controller.signal,
        onEvent: (event) => {
          if (!mountedRef.current) return;
          switch (event.type) {
            case 'order':
              setState((prev) => ({ ...prev, order: event.order }));
              break;
            case 'sent':
              setState((prev) => ({ ...prev, status: 'awaiting' }));
              break;
            case 'poll':
              setState((prev) => ({ ...prev, elapsedMs: event.elapsedMs }));
              break;
            default:
              break;
          }
        },
      });

      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        status: result.status,
        order: result.order,
        receipt: result.receipt,
        error: result.error,
      }));

      if (result.status === 'confirmed' && result.receipt) {
        optionsRef.current.onConfirmed?.(result.receipt);
      } else if (result.status === 'expired' && result.order) {
        optionsRef.current.onExpired?.(result.order);
      } else if (result.error) {
        optionsRef.current.onError?.(result.error);
      }
    },
    [resolved],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL);
  }, []);

  const whatsappUrl = useMemo(() => {
    if (!resolved.supportWhatsapp || !state.order) return null;
    const reason =
      state.status === 'expired' ? 'expired' : state.status === 'failed' ? 'failed' : 'help';
    return buildWhatsappUrl(
      resolved.supportWhatsapp,
      resolved.storeName,
      state.order,
      reason,
    );
  }, [resolved.supportWhatsapp, resolved.storeName, state.order, state.status]);

  return {
    ...state,
    isBusy: state.status === 'starting' || state.status === 'awaiting',
    whatsappUrl,
    start,
    cancel,
    reset,
  };
}
