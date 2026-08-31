import { AroError } from './errors.js';

/** USDC tem 6 casas decimais. Nada abaixo disso existe on-chain. */
export const USDC_DECIMALS = 6;

/**
 * Normaliza um valor para o formato que o pay() espera: string decimal
 * com no maximo 6 casas. Sem notacao cientifica, sem separador de milhar.
 */
export function normalizeAmount(value: number | string): string {
  const numeric = typeof value === 'string' ? Number(value.replace(',', '.')) : value;

  if (!Number.isFinite(numeric)) {
    throw new AroError('invalid_amount', `Valor invalido: ${String(value)}`);
  }
  if (numeric <= 0) {
    throw new AroError('invalid_amount', 'O valor precisa ser maior que zero.');
  }

  const fixed = numeric.toFixed(USDC_DECIMALS);
  // Remove zeros a direita, mas mantem ao menos duas casas por legibilidade.
  const trimmed = fixed.replace(/(\.\d{2}\d*?)0+$/, '$1');
  return trimmed;
}

/** Soma uma lista de precos sem acumular erro de ponto flutuante. */
export function sumPrices(prices: number[]): number {
  const factor = 10 ** USDC_DECIMALS;
  const total = prices.reduce((acc, price) => acc + Math.round(price * factor), 0);
  return total / factor;
}

/** Formata para exibicao. Nao use o retorno disto no pay(). */
export function formatAmount(amount: string | number, locale = 'pt-BR'): string {
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  return `${numeric.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDC`;
}
