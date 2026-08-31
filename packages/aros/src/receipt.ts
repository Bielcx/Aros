import { loadBaseSdk } from './sdk.js';
import type { AroReceipt, Address } from './types.js';

/**
 * ATENCAO, ITEM A VERIFICAR COM UM PAGAMENTO REAL:
 * o id devolvido pelo pay() e um hash de userOp, nao de transacao. O
 * Basescan indexa transacoes; hash de userOp pode nao resolver la. Antes
 * de vender o kit, faca um pagamento na Sepolia e confira qual dos dois
 * links abaixo abre de verdade.
 */
export function explorerUrl(paymentId: string, testnet = false): string {
  const host = testnet ? 'https://sepolia.basescan.org' : 'https://basescan.org';
  return `${host}/tx/${paymentId}`;
}

/**
 * Onde a carteira que recebeu aparece, com as transferencias dela.
 *
 * Existe porque o explorerUrl acima e um tiro no escuro: o id que o pay()
 * devolve e hash de userOp, e o /tx/ do Basescan indexa hash de transacao.
 * Sao coisas diferentes, e o PaymentStatus do SDK nao expoe o hash da
 * transacao -- conferido nos tipos: id, sender, amount, recipient, reason,
 * message, e mais nada.
 *
 * Este link resolve sempre, porque endereco o Basescan indexa com certeza.
 * Serve de rede de seguranca ate um pagamento real dizer qual dos outros
 * dois funciona.
 */
export function addressExplorerUrl(recipient: string, testnet = false): string {
  const host = testnet ? 'https://sepolia.basescan.org' : 'https://basescan.org';
  return `${host}/address/${recipient}#tokentxns`;
}

/** Alternativa: exploradores de userOp indexam ERC-4337 por hash de userOp. */
export function userOpExplorerUrl(paymentId: string, testnet = false): string {
  const network = testnet ? 'base-sepolia' : 'base';
  return `https://jiffyscan.xyz/userOpHash/${paymentId}?network=${network}`;
}

export interface ReceiptLinkInput {
  receiptBaseUrl?: string;
  paymentId: string;
  reference: string;
  amount: string;
  recipient: string;
  testnet?: boolean;
}

/**
 * Monta a URL do recibo.
 *
 * Isto e o que resolve o furo do "sem backend": tudo que o recibo precisa
 * viaja na propria URL, e a pagina revalida on-chain ao abrir. Nada e
 * guardado em lugar nenhum, e o link continua verificavel meses depois.
 */
export function buildReceiptUrl(input: ReceiptLinkInput): string | undefined {
  if (!input.receiptBaseUrl) return undefined;

  const url = new URL(input.receiptBaseUrl);
  url.searchParams.set('id', input.paymentId);
  url.searchParams.set('ref', input.reference);
  url.searchParams.set('amt', input.amount);
  url.searchParams.set('to', input.recipient);
  if (input.testnet) url.searchParams.set('net', 'sepolia');
  return url.toString();
}

export interface ParsedReceiptLink {
  paymentId: string;
  reference: string;
  amount: string;
  recipient: Address;
  testnet: boolean;
}

/** Le de volta os dados de um link de recibo. */
export function parseReceiptUrl(search: string): ParsedReceiptLink | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const paymentId = params.get('id');
  const amount = params.get('amt');
  const recipient = params.get('to');
  if (!paymentId || !amount || !recipient) return null;

  return {
    paymentId,
    reference: params.get('ref') ?? '',
    amount,
    recipient: recipient as Address,
    testnet: params.get('net') === 'sepolia',
  };
}

export interface VerifiedReceipt {
  valid: boolean;
  /** Por que nao vale, quando nao vale. */
  reason?: string;
  sender?: string;
  amount?: string;
  recipient?: string;
}

/**
 * Reconfere um recibo direto na chain. Qualquer pessoa pode chamar isto,
 * inclusive o lojista, e nao depende de nenhum servidor do Aros.
 */
export async function verifyReceipt(link: ParsedReceiptLink): Promise<VerifiedReceipt> {
  try {
    const { getPaymentStatus } = await loadBaseSdk();
    const status = await getPaymentStatus({
      id: link.paymentId,
      expectedPayment: { amount: link.amount, recipient: link.recipient },
      testnet: link.testnet,
    });

    if (status.status !== 'completed') {
      return { valid: false, reason: status.message || `Status: ${status.status}` };
    }
    return {
      valid: true,
      ...(status.sender ? { sender: status.sender } : {}),
      ...(status.amount ? { amount: status.amount } : {}),
      ...(status.recipient ? { recipient: status.recipient } : {}),
    };
  } catch (error) {
    return {
      valid: false,
      reason: error instanceof Error ? error.message : 'Nao foi possivel verificar.',
    };
  }
}

export interface BuildReceiptInput {
  paymentId: string;
  reference: string;
  amount: string;
  recipient: string;
  storeName: string;
  testnet: boolean;
  sender?: string;
  receiptBaseUrl?: string;
}

export function buildReceipt(input: BuildReceiptInput): AroReceipt {
  const receiptUrl = buildReceiptUrl({
    ...(input.receiptBaseUrl ? { receiptBaseUrl: input.receiptBaseUrl } : {}),
    paymentId: input.paymentId,
    reference: input.reference,
    amount: input.amount,
    recipient: input.recipient,
    testnet: input.testnet,
  });

  return {
    paymentId: input.paymentId,
    reference: input.reference,
    amount: input.amount,
    recipient: input.recipient,
    ...(input.sender ? { sender: input.sender } : {}),
    storeName: input.storeName,
    testnet: input.testnet,
    confirmedAt: Date.now(),
    explorerUrl: explorerUrl(input.paymentId, input.testnet),
    ...(receiptUrl ? { receiptUrl } : {}),
  };
}
