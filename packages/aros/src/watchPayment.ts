import type { getPaymentStatus, PaymentStatus } from '@base-org/account';
import { DEFAULTS } from './config.js';
import { AroError, toMessage } from './errors.js';
import { loadBaseSdk } from './sdk.js';
import type { Address } from './types.js';

export type WatchOutcome = 'confirmed' | 'failed' | 'expired' | 'aborted';

export interface WatchPaymentOptions {
  /** Hash do userOp devolvido pelo pay(). */
  id: string;
  /**
   * Valor e destinatario esperados. O SDK confere isso contra a
   * transferencia de USDC que realmente aconteceu on-chain, entao um
   * pagamento com valor errado nao passa como confirmado.
   */
  expected: { amount: string; recipient: Address };
  testnet?: boolean;
  timeoutMs?: number;
  pollIntervalMs?: number;
  maxPollIntervalMs?: number;
  /** Bundler proprio, para escapar do rate limit do endpoint publico. */
  bundlerUrl?: string;
  signal?: AbortSignal;
  /** Chamado a cada consulta, para a UI mostrar progresso. */
  onPoll?: (status: PaymentStatus | null, elapsedMs: number) => void;
  /** Injecao de dependencia, usada nos testes. */
  checkStatus?: typeof getPaymentStatus;
}

export interface WatchPaymentResult {
  outcome: WatchOutcome;
  status: PaymentStatus | null;
  elapsedMs: number;
}

/** Quantas falhas seguidas de RPC antes de desistir. */
const MAX_CONSECUTIVE_ERRORS = 5;

function sleep(ms: number, signal?: AbortSignal): Promise<'ok' | 'aborted'> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve('aborted');
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const onAbort = () => {
      clearTimeout(timer);
      resolve('aborted');
    };
    timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve('ok');
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Acompanha um pagamento ate ele confirmar, falhar ou expirar.
 *
 * Nao varre a chain: pergunta o status pelo hash do userOp, com backoff.
 * Roda inteiro no navegador do cliente, sem backend.
 *
 * Cuidado com o modelo de confianca: isto roda no navegador de quem paga.
 * Serve para a loja mudar de tela quando o dinheiro chega, nao como prova
 * para o lojista. A prova e a transacao on-chain (ver receipt.ts).
 */
export async function watchPayment(options: WatchPaymentOptions): Promise<WatchPaymentResult> {
  const {
    id,
    expected,
    testnet = DEFAULTS.testnet,
    timeoutMs = DEFAULTS.timeoutMs,
    pollIntervalMs = DEFAULTS.pollIntervalMs,
    maxPollIntervalMs = DEFAULTS.maxPollIntervalMs,
    bundlerUrl,
    signal,
    onPoll,
    checkStatus,
  } = options;

  const askStatus: typeof getPaymentStatus =
    checkStatus ?? (async (opts) => (await loadBaseSdk()).getPaymentStatus(opts));

  const startedAt = Date.now();
  const deadline = startedAt + timeoutMs;

  let interval = pollIntervalMs;
  let consecutiveErrors = 0;
  let lastError: unknown = null;

  while (Date.now() < deadline) {
    if (signal?.aborted) {
      return { outcome: 'aborted', status: null, elapsedMs: Date.now() - startedAt };
    }

    let status: PaymentStatus | null = null;
    try {
      status = await askStatus({
        id,
        expectedPayment: { amount: expected.amount, recipient: expected.recipient },
        testnet,
        ...(bundlerUrl ? { bundlerUrl } : {}),
      });
      consecutiveErrors = 0;
    } catch (error) {
      // Duas coisas caem aqui: RPC instavel (transitorio) e pagamento que
      // nao bate com o esperado (permanente). O SDK nao separa os dois,
      // entao repetimos algumas vezes e desistimos guardando a ultima causa.
      lastError = error;
      consecutiveErrors += 1;
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        throw new AroError(
          'status_unavailable',
          `Nao foi possivel confirmar o pagamento apos ${MAX_CONSECUTIVE_ERRORS} tentativas: ${toMessage(lastError)}`,
          lastError,
        );
      }
    }

    const elapsedMs = Date.now() - startedAt;
    onPoll?.(status, elapsedMs);

    if (status?.status === 'completed') {
      return { outcome: 'confirmed', status, elapsedMs };
    }
    if (status?.status === 'failed') {
      return { outcome: 'failed', status, elapsedMs };
    }
    // 'pending' e 'not_found' seguem esperando: logo apos o pay() o bundler
    // ainda nao indexou o userOp, e 'not_found' e o estado normal disso.

    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    const wait = Math.min(interval, remaining);
    if ((await sleep(wait, signal)) === 'aborted') {
      return { outcome: 'aborted', status, elapsedMs: Date.now() - startedAt };
    }
    interval = Math.min(Math.round(interval * 1.35), maxPollIntervalMs);
  }

  return { outcome: 'expired', status: null, elapsedMs: Date.now() - startedAt };
}
