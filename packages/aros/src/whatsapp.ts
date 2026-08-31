import { formatAmount } from './amount.js';
import type { AroOrder } from './types.js';

export type WhatsappReason = 'expired' | 'failed' | 'help';

/**
 * Link de contato direto com o lojista. Rede de seguranca, nao fluxo padrao:
 * so aparece quando o pagamento nao confirmou sozinho.
 */
export function buildWhatsappUrl(
  phone: string,
  storeName: string,
  order: AroOrder,
  reason: WhatsappReason = 'help',
): string {
  const intro =
    reason === 'expired'
      ? 'fiz um pagamento em USDC mas a confirmacao demorou'
      : reason === 'failed'
        ? 'tentei pagar em USDC e a transacao falhou'
        : 'estou com uma duvida sobre um pagamento em USDC';

  const message = [
    `Oi, ${storeName}!`,
    `Ola, ${intro}.`,
    `Pedido: ${order.reference}`,
    `Valor: ${formatAmount(order.amount)}`,
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
