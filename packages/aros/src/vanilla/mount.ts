import { formatAmount } from '../amount.js';
import { defineConfig } from '../config.js';
import type { CreateOrderInput } from '../createOrder.js';
import { runPayment } from '../runPayment.js';
import { prefetchBaseSdk } from '../sdk.js';
import type { AroConfig, AroOrder, AroReceipt } from '../types.js';
import { buildWhatsappUrl } from '../whatsapp.js';

export interface MountOptions extends CreateOrderInput {
  label?: string;
  onConfirmed?: (receipt: AroReceipt) => void;
  onExpired?: (order: AroOrder) => void;
  onError?: (message: string) => void;
}

export interface AroInstance {
  /** Remove o botao e para de acompanhar. */
  destroy: () => void;
  /** Volta para o estado inicial. */
  reset: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  style: Partial<CSSStyleDeclaration>,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  if (text !== undefined) node.textContent = text;
  return node;
}

function clock(ms: number): string {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * Mesma coisa que o AroButton do React, em JS puro.
 *
 * Uso:
 *   Aros.mount('#checkout', { recipient: '0x...', storeName: 'Loja', amount: 49.9 })
 */
export function mount(
  target: string | HTMLElement,
  config: AroConfig,
  options: MountOptions = {},
): AroInstance {
  const root = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!root) throw new Error(`Aros: elemento "${String(target)}" nao encontrado na pagina.`);

  const resolved = defineConfig(config);
  const brand = resolved.brandColor;
  let controller: AbortController | null = null;

  const container = el('div', {
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '420px',
  });

  const button = el('button', {
    appearance: 'none',
    border: 'none',
    borderRadius: '999px',
    background: brand,
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    padding: '14px 24px',
    width: '100%',
  });
  button.type = 'button';

  const note = el('p', { fontSize: '13px', lineHeight: '1.5', margin: '0', opacity: '0.75' });

  const link = el('a', {
    color: brand,
    fontSize: '14px',
    display: 'none',
  });
  link.target = '_blank';
  link.rel = 'noreferrer';

  const defaultLabel =
    options.label ??
    (options.amount !== undefined
      ? `Pagar ${formatAmount(options.amount)}`
      : typeof resolved.amount === 'number'
        ? `Pagar ${formatAmount(resolved.amount)}`
        : 'Pagar em USDC');

  function idle() {
    button.disabled = false;
    button.style.background = brand;
    button.style.cursor = 'pointer';
    button.textContent = defaultLabel;
    note.textContent = '';
    link.style.display = 'none';
  }

  function busy(text: string) {
    button.disabled = true;
    button.style.background = '#8a8a8a';
    button.style.cursor = 'progress';
    button.textContent = text;
  }

  async function start() {
    controller?.abort();
    controller = new AbortController();

    busy('Abrindo a carteira...');
    note.textContent = '';
    link.style.display = 'none';

    let order: AroOrder | null = null;

    const result = await runPayment(resolved, {
      ...(options.itemIds ? { itemIds: options.itemIds } : {}),
      ...(options.amount !== undefined ? { amount: options.amount } : {}),
      ...(options.reference ? { reference: options.reference } : {}),
      signal: controller.signal,
      onEvent: (event) => {
        if (event.type === 'order') order = event.order;
        if (event.type === 'sent') {
          busy('Aguardando confirmacao 00:00');
          note.textContent = `Pedido ${event.order.reference}. Nao feche esta aba: e aqui que a confirmacao aparece.`;
        }
        if (event.type === 'poll') {
          busy(`Aguardando confirmacao ${clock(event.elapsedMs)}`);
        }
      },
    });

    if (result.status === 'confirmed' && result.receipt) {
      button.style.display = 'none';
      note.textContent = `${resolved.successMessage} Pedido ${result.receipt.reference} - ${formatAmount(result.receipt.amount)}`;
      note.style.opacity = '1';
      link.href = result.receipt.receiptUrl ?? result.receipt.explorerUrl;
      link.textContent = 'Ver comprovante';
      link.style.display = 'block';
      options.onConfirmed?.(result.receipt);
      return;
    }

    if (result.status === 'expired' || result.status === 'failed') {
      button.disabled = false;
      button.style.background = '#555';
      button.style.cursor = 'pointer';
      button.textContent = 'Tentar de novo';
      note.textContent =
        result.status === 'expired'
          ? 'A confirmacao esta demorando. O pagamento pode ter sido feito mesmo assim: fale com a loja antes de tentar de novo.'
          : (result.error ?? 'A transacao nao passou.');

      if (resolved.supportWhatsapp && order) {
        link.href = buildWhatsappUrl(
          resolved.supportWhatsapp,
          resolved.storeName,
          order,
          result.status === 'expired' ? 'expired' : 'failed',
        );
        link.textContent = `Falar com ${resolved.storeName}`;
        link.style.display = 'block';
      }

      if (result.status === 'expired' && order) options.onExpired?.(order);
      if (result.error) options.onError?.(result.error);
      return;
    }

    idle();
    if (result.error) {
      note.textContent = result.error;
      options.onError?.(result.error);
    }
  }

  // Aquece o SDK quando o cliente encosta no botao, para o clique nao esperar o download.
  button.addEventListener('mouseenter', prefetchBaseSdk, { once: true });
  button.addEventListener('focus', prefetchBaseSdk, { once: true });
  button.addEventListener('click', () => {
    void start();
  });

  idle();
  container.append(button, note, link);
  root.appendChild(container);

  return {
    destroy: () => {
      controller?.abort();
      container.remove();
    },
    reset: () => {
      controller?.abort();
      button.style.display = 'block';
      note.style.opacity = '0.75';
      idle();
    },
  };
}
