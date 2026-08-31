import { AroError } from './errors.js';
import type { Address } from './types.js';

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function isAddress(value: string): value is Address {
  return ADDRESS_RE.test(value);
}

export function looksLikeName(value: string): boolean {
  return value.includes('.') && !value.startsWith('0x');
}

/**
 * Converte o `recipient` do config em um endereco 0x.
 *
 * LIMITACAO CONHECIDA: Basename ainda nao e resolvido. Resolver exige
 * consultar o resolver L2 da Base via viem, o que ainda nao foi feito e
 * validado aqui. Ate la, o config aceita apenas endereco 0x.
 */
export function resolveRecipient(recipient: string): Address {
  if (isAddress(recipient)) return recipient;

  if (looksLikeName(recipient)) {
    throw new AroError(
      'basename_not_supported',
      `Basename ("${recipient}") ainda nao e resolvido pelo Aros. Use o endereco 0x da carteira por enquanto.`,
    );
  }

  throw new AroError(
    'invalid_recipient',
    `"${recipient}" nao e um endereco Ethereum valido.`,
  );
}
