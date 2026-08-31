/**
 * Referencia de pedido.
 *
 * O identificador canonico de um pagamento e o hash do userOp devolvido pelo
 * pay(). A referencia daqui e um rotulo curto e pronunciavel, para o cliente
 * citar no WhatsApp e o lojista achar o pedido sem abrir explorador.
 *
 * A codificacao ERC-8021 dela mora em attribution.ts, de proposito: aquele
 * modulo puxa o ox e so faz falta na hora de pagar.
 */

// Base32 de Crockford: sem I, L, O e U, para nao confundir na leitura.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Gera uma referencia como "ARO-7K2M9QX4". */
export function createReference(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let out = '';
  for (const byte of bytes) {
    out += ALPHABET[byte % ALPHABET.length];
  }
  return `ARO-${out}`;
}
