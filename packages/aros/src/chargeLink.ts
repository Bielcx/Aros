import { validateConfig } from './config.js';
import type { AroConfig } from './types.js';

/**
 * Cobranca que cabe numa URL.
 *
 * Quem fatura por projeto -- agencia, freelancer, estudio -- nao tem pagina
 * de checkout: manda cobranca por e-mail e WhatsApp. Este modulo le uma
 * cobranca inteira dos parametros de uma URL, para o link ser o produto.
 *
 * Espelha o parseReceiptUrl: entra query string, sai objeto ou os problemas.
 * A diferenca e que aqui tudo veio da barra de enderecos de quem paga, entao
 * nada sai daqui sem passar pelo validateConfig -- e quem chama recebe os
 * problemas em portugues, para mostrar na tela em vez de engolir.
 */

export interface ChargeLinkInput {
  /** Carteira que recebe. Parametro "to". */
  to: string;
  /** Valor em USDC. Parametro "amount". Aceita virgula ou ponto. */
  amount: string;
  /** Numero da nota ou fatura de quem cobra. Parametro "ref". */
  reference: string;
  /** Nome de quem esta cobrando. Parametro "name". */
  name: string;
  /** Descricao livre do que esta sendo cobrado. Parametro "note". */
  note: string;
  /** Mainnet so com "net=main". O default seguro e testnet. */
  testnet: boolean;
}

export interface ParsedChargeLink {
  input: ChargeLinkInput;
  /** Valor ja normalizado. So confiavel quando problems esta vazio. */
  amount: number;
  /** Config pronto para o botao. So confiavel quando problems esta vazio. */
  config: AroConfig;
  /** Vazio significa que da para cobrar. */
  problems: string[];
}

/**
 * Le uma cobranca de uma query string.
 *
 * Nunca lanca: devolve os problemas em problems, porque a tela precisa
 * mostrar todos de uma vez em vez de morrer no primeiro.
 */
export function parseChargeLink(search: string, receiptBaseUrl?: string): ParsedChargeLink {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const get = (k: string) => q.get(k)?.trim() ?? '';

  const input: ChargeLinkInput = {
    to: get('to'),
    amount: get('amount'),
    reference: get('ref'),
    name: get('name'),
    note: get('note'),
    /* Testnet e o default de proposito: um link malformado que caisse em
       mainnet por descuido gastaria dinheiro de verdade. Quem quer valer
       precisa pedir. */
    testnet: q.get('net') !== 'main',
  };

  const problems: string[] = [];
  const amount = Number(input.amount.replace(',', '.'));

  if (!input.amount) {
    problems.push('Falta o valor da cobranca no link (parametro "amount").');
  } else if (!Number.isFinite(amount) || amount <= 0) {
    problems.push(`"${input.amount}" nao e um valor de cobranca valido.`);
  }

  const config: AroConfig = {
    recipient: input.to,
    storeName: input.name || 'Cobranca',
    testnet: input.testnet,
    /* Um valor de faz de conta so para o validateConfig nao reclamar duas
       vezes do mesmo problema: quando o amount e invalido, quem manda a
       mensagem e o bloco acima, que sabe o que a pessoa digitou. */
    amount: Number.isFinite(amount) && amount > 0 ? amount : 1,
    ...(receiptBaseUrl ? { receiptBaseUrl } : {}),
  };

  problems.push(...validateConfig(config));

  return { input, amount, config, problems };
}
