export type AroErrorCode =
  | 'invalid_config'
  | 'invalid_amount'
  | 'invalid_recipient'
  | 'basename_not_supported'
  | 'payment_rejected'
  | 'status_unavailable'
  | 'amount_mismatch';

/** Erro do Aros com codigo estavel, para o lojista tratar sem parsear string. */
export class AroError extends Error {
  readonly code: AroErrorCode;
  readonly cause?: unknown;

  constructor(code: AroErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AroError';
    this.code = code;
    this.cause = cause;
  }
}

/** Extrai uma mensagem legivel de qualquer coisa que tenha sido lancada. */
export function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido';
}
