import type { CSSProperties, ReactNode } from 'react';
import { formatAmount } from '../amount.js';
import { defineConfig } from '../config.js';
import { prefetchBaseSdk } from '../sdk.js';
import type { AroConfig, AroReceipt } from '../types.js';
import { useAroPayment } from './useAroPayment.js';

export interface AroButtonProps {
  config: AroConfig;
  /** Itens do catalogo a cobrar. Omita para usar o amount do config. */
  itemIds?: string[];
  /** Valor avulso, quando o preco nao vem do config. */
  amount?: number | string;
  /** Texto do botao. Default: "Pagar <valor> em USDC". */
  label?: ReactNode;
  onConfirmed?: (receipt: AroReceipt) => void;
  className?: string;
  style?: CSSProperties;
}

const box: CSSProperties = {
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  maxWidth: 420,
};

const buttonBase: CSSProperties = {
  appearance: 'none',
  border: 'none',
  borderRadius: 999,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 600,
  padding: '14px 24px',
  width: '100%',
};

const noteStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  margin: 0,
  opacity: 0.75,
};

function minutes(ms: number): string {
  const total = Math.floor(ms / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Botao de pagamento pronto para colar no site do lojista.
 *
 * Cobre o fluxo inteiro: cobranca, espera, sucesso, falha e expiracao.
 * Quem quiser desenhar a propria tela usa o useAroPayment direto.
 */
export function AroButton({
  config,
  itemIds,
  amount,
  label,
  onConfirmed,
  className,
  style,
}: AroButtonProps) {
  const resolved = defineConfig(config);
  const payment = useAroPayment(config, {
    ...(onConfirmed ? { onConfirmed } : {}),
  });

  const brand = resolved.brandColor;

  const displayAmount =
    amount !== undefined
      ? formatAmount(amount)
      : typeof resolved.amount === 'number'
        ? formatAmount(resolved.amount)
        : null;

  if (payment.status === 'confirmed' && payment.receipt) {
    const { receipt } = payment;
    return (
      <div className={className} style={{ ...box, ...style }}>
        <strong style={{ color: brand, fontSize: 18 }}>{resolved.successMessage}</strong>
        <p style={noteStyle}>
          Pedido {receipt.reference} &middot; {formatAmount(receipt.amount)}
        </p>
        <a
          href={receipt.receiptUrl ?? receipt.explorerUrl}
          target="_blank"
          rel="noreferrer"
          style={{ color: brand, fontSize: 14 }}
        >
          Ver comprovante
        </a>
      </div>
    );
  }

  if (payment.status === 'expired' || payment.status === 'failed') {
    const expired = payment.status === 'expired';
    return (
      <div className={className} style={{ ...box, ...style }}>
        <strong style={{ fontSize: 16 }}>
          {expired ? 'A confirmacao esta demorando' : 'A transacao nao passou'}
        </strong>
        <p style={noteStyle}>
          {expired
            ? 'O pagamento pode ter sido feito mesmo assim. Fale com a loja antes de tentar de novo.'
            : payment.error}
        </p>
        {payment.whatsappUrl ? (
          <a
            href={payment.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{ ...buttonBase, background: brand, textAlign: 'center', textDecoration: 'none' }}
          >
            Falar com {resolved.storeName}
          </a>
        ) : null}
        <button type="button" onClick={payment.reset} style={{ ...buttonBase, background: '#555' }}>
          Tentar de novo
        </button>
      </div>
    );
  }

  return (
    <div className={className} style={{ ...box, ...style }}>
      <button
        type="button"
        disabled={payment.isBusy}
        onMouseEnter={prefetchBaseSdk}
        onFocus={prefetchBaseSdk}
        onClick={() => {
          void payment.start({
            ...(itemIds ? { itemIds } : {}),
            ...(amount !== undefined ? { amount } : {}),
          });
        }}
        style={{
          ...buttonBase,
          background: payment.isBusy ? '#8a8a8a' : brand,
          cursor: payment.isBusy ? 'progress' : 'pointer',
        }}
      >
        {payment.status === 'starting'
          ? 'Abrindo a carteira...'
          : payment.status === 'awaiting'
            ? `Aguardando confirmacao ${minutes(payment.elapsedMs)}`
            : (label ?? `Pagar ${displayAmount ?? 'em USDC'}`)}
      </button>

      {payment.status === 'awaiting' ? (
        <p style={noteStyle}>
          Pedido {payment.order?.reference}. Nao feche esta aba: e aqui que a confirmacao
          aparece.
        </p>
      ) : null}

      {payment.status === 'error' ? <p style={noteStyle}>{payment.error}</p> : null}
    </div>
  );
}
