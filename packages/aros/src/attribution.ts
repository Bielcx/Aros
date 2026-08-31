import { Attribution } from 'ox/erc8021';
import type { Address } from './types.js';

/**
 * Atribuicao ERC-8021 (Builder Codes da Base).
 *
 * O dataSuffix do pagamento e o mesmo campo que a Base usa para saber qual app
 * originou a transacao. Em vez de disputar o campo com a nossa referencia,
 * usamos o schema 2, que carrega o codigo do app e metadados livres juntos.
 *
 * Este modulo importa o ox, que traz um encoder CBOR junto. Ele e carregado
 * sob demanda no runPayment, para nao pesar na primeira carga da loja.
 */

export interface AttributionInput {
  /** Referencia do pedido. */
  reference: string;
  /**
   * Builder Code do app, obtido de graca em base.dev.
   * Sem ele o pagamento funciona igual, mas a Base nao consegue atribuir a
   * transacao ao Aros -- some das metricas, do leaderboard e das recompensas.
   */
  builderCode?: string;
}

/**
 * Monta o dataSuffix do pagamento no formato ERC-8021.
 *
 * Devolve undefined quando nao ha Builder Code -- e nao e detalhe: o ox so
 * usa o schema 2 (o unico com metadados livres) quando existe um appCode.
 * Sem codigo, ele cai no schema 0 e descarta a referencia em silencio,
 * gravando um sufixo vazio que so queima gas. Melhor nao mandar nada.
 *
 * Com codigo, o custo e de cerca de 47 bytes a 16 de gas por byte: fracao de
 * centavo na Base. Contratos ignoram o sufixo; quem le e o indexador, depois.
 */
export function buildAttributionSuffix(input: AttributionInput): Address | undefined {
  if (!input.builderCode) return undefined;

  return Attribution.toDataSuffix({
    appCode: input.builderCode,
    metadata: { ref: input.reference },
  }) as Address;
}

export interface DecodedAttribution {
  reference?: string;
  builderCode?: string;
}

/** Le de volta o que foi codificado. Devolve null se nao for ERC-8021. */
export function readAttribution(dataSuffix: string): DecodedAttribution | null {
  const decoded = Attribution.fromData(dataSuffix as `0x${string}`);
  if (!decoded) return null;

  const reference = decoded.metadata?.['ref'];
  return {
    ...(typeof reference === 'string' ? { reference } : {}),
    ...(decoded.appCode ? { builderCode: decoded.appCode } : {}),
  };
}
