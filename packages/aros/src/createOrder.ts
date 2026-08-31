import { normalizeAmount, sumPrices } from './amount.js';
import { AroError } from './errors.js';
import { createReference } from './reference.js';
import { resolveRecipient } from './resolveRecipient.js';
import type { AroConfig, AroItem, AroOrder } from './types.js';

export interface CreateOrderInput {
  /** Ids dos itens escolhidos. So faz sentido se o config tem catalogo. */
  itemIds?: string[];
  /** Valor avulso, quando a loja nao usa catalogo nem preco fixo. */
  amount?: number | string;
  /** Referencia propria, se o lojista ja tem numeracao de pedido. */
  reference?: string;
}

/** Monta o pedido a ser pago. Puro: nao toca na rede nem na carteira. */
export function createOrder(config: AroConfig, input: CreateOrderInput = {}): AroOrder {
  const recipient = resolveRecipient(config.recipient);

  let items: AroItem[] | undefined;
  let amount: string;

  if (input.amount !== undefined) {
    amount = normalizeAmount(input.amount);
  } else if (input.itemIds && input.itemIds.length > 0) {
    const catalog = config.items ?? [];
    items = input.itemIds.map((id) => {
      const found = catalog.find((item) => item.id === id);
      if (!found) {
        throw new AroError('invalid_config', `Item "${id}" nao existe no catalogo.`);
      }
      return found;
    });
    amount = normalizeAmount(sumPrices(items.map((item) => item.price)));
  } else if (typeof config.amount === 'number') {
    amount = normalizeAmount(config.amount);
  } else {
    throw new AroError(
      'invalid_amount',
      'Nada para cobrar: passe itemIds, um amount, ou defina amount no config.',
    );
  }

  return {
    reference: input.reference ?? createReference(),
    amount,
    recipient,
    ...(items ? { items } : {}),
    createdAt: Date.now(),
  };
}
