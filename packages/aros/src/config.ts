import { AroError } from './errors.js';
import { normalizeAmount } from './amount.js';
import { isAddress, looksLikeName } from './resolveRecipient.js';
import type { AroConfig } from './types.js';

export const BASE_BLUE = '#0052FF';

export const DEFAULTS = {
  brandColor: BASE_BLUE,
  successMessage: 'Pagamento confirmado. Obrigado!',
  testnet: false,
  /** 15 minutos. Nao e a chain que demora, e o cliente que some. */
  timeoutMs: 15 * 60 * 1000,
  pollIntervalMs: 2500,
  maxPollIntervalMs: 10000,
} as const;

/** Config com os defaults ja aplicados. E o que o resto do kit consome. */
export interface ResolvedAroConfig extends AroConfig {
  brandColor: string;
  successMessage: string;
  testnet: boolean;
  timeoutMs: number;
  pollIntervalMs: number;
}

/**
 * Lista os problemas do config em portugues simples.
 * Vazio significa que da para rodar.
 */
export function validateConfig(config: AroConfig): string[] {
  const problems: string[] = [];

  if (!config.recipient) {
    problems.push('Falta "recipient": a carteira que recebe o pagamento.');
  } else if (!isAddress(config.recipient)) {
    problems.push(
      looksLikeName(config.recipient)
        ? `"${config.recipient}" parece um Basename. O Aros ainda so aceita endereco 0x.`
        : `"${config.recipient}" nao e um endereco Ethereum valido.`,
    );
  }

  if (!config.storeName?.trim()) {
    problems.push('Falta "storeName": o nome da loja.');
  }

  const hasItems = Array.isArray(config.items) && config.items.length > 0;
  const hasAmount = typeof config.amount === 'number';

  if (!hasItems && !hasAmount) {
    problems.push('Defina "items" (catalogo) ou "amount" (preco unico).');
  }
  if (hasItems && hasAmount) {
    problems.push('Use "items" ou "amount", nao os dois.');
  }

  if (hasItems) {
    const ids = new Set<string>();
    for (const item of config.items ?? []) {
      if (!item.id) problems.push('Todo item precisa de um "id".');
      else if (ids.has(item.id)) problems.push(`Item com id repetido: "${item.id}".`);
      else ids.add(item.id);

      if (!(item.price > 0)) {
        problems.push(`O item "${item.name || item.id}" precisa de um preco maior que zero.`);
      }
    }
  }

  if (hasAmount) {
    try {
      normalizeAmount(config.amount as number);
    } catch {
      problems.push('O "amount" precisa ser um numero maior que zero.');
    }
  }

  if (config.builderCode !== undefined && !/^[a-zA-Z0-9_-]{1,32}$/.test(config.builderCode)) {
    problems.push('O "builderCode" deve ser o codigo curto pego em base.dev (letras, numeros, - e _).');
  }

  if (config.supportWhatsapp && !/^\d{10,15}$/.test(config.supportWhatsapp)) {
    problems.push(
      'O "supportWhatsapp" deve ter so digitos, com pais e DDD. Ex: "5511999998888".',
    );
  }

  return problems;
}

/**
 * Valida o config do lojista e aplica os defaults.
 * Falha alto e cedo: e melhor quebrar no deploy que na hora da venda.
 */
export function defineConfig(config: AroConfig): ResolvedAroConfig {
  const problems = validateConfig(config);
  if (problems.length > 0) {
    throw new AroError(
      'invalid_config',
      `Config do Aros invalido:\n- ${problems.join('\n- ')}`,
    );
  }

  return {
    ...config,
    brandColor: config.brandColor ?? DEFAULTS.brandColor,
    successMessage: config.successMessage ?? DEFAULTS.successMessage,
    testnet: config.testnet ?? DEFAULTS.testnet,
    timeoutMs: config.timeoutMs ?? DEFAULTS.timeoutMs,
    pollIntervalMs: config.pollIntervalMs ?? DEFAULTS.pollIntervalMs,
  };
}
