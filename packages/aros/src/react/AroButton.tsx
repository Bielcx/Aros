import type { CSSProperties, ReactNode } from 'react';
import { formatAmount } from '../amount.js';
import { defineConfig } from '../config.js';
import { prefetchBaseSdk } from '../sdk.js';
import type { AroConfig, AroReceipt } from '../types.js';
import { useState } from 'react';
import { useAroPayment } from './useAroPayment.js';

export interface AroButtonProps {
  config: AroConfig;
  /** Itens do catalogo a cobrar. Omita para usar o amount do config. */
  itemIds?: string[];
  /** Valor avulso, quando o preco nao vem do config. */
  amount?: number | string;
  /**
   * Referencia do pedido. Omita para gerar uma (ARO-XXXXXXXX).
   * Use quando o pedido ja tem numero do lado de quem cobra -- uma nota, uma
   * fatura -- para o recibo casar com o sistema dele.
   */
  reference?: string;
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

/**
 * O brilho e a sombra sao neutros de proposito.
 *
 * O brandColor do lojista pode ser qualquer valor CSS -- um nome, uma
 * funcao, uma variavel -- entao nao da para calcular um tom mais escuro dele
 * com seguranca. A solucao e separar: backgroundColor recebe a cor da marca,
 * sempre valida, e backgroundImage poe por cima um degrade de branco e preto
 * translucidos. Funciona com qualquer cor e, se o degrade falhar, sobra a
 * cor chapada em vez de um botao invisivel.
 */
const buttonBase: CSSProperties = {
  appearance: 'none',
  border: 'none',
  borderRadius: 999,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
  padding: '15px 24px',
  position: 'relative',
  transition: 'transform .12s ease, box-shadow .18s ease, filter .18s ease',
  width: '100%',
};

const SHEEN = 'linear-gradient(180deg, rgba(255,255,255,.16), rgba(0,0,0,.12))';
const SHEEN_HOVER = 'linear-gradient(180deg, rgba(255,255,255,.26), rgba(0,0,0,.06))';

const sombra = (forte: boolean): string =>
  [
    'inset 0 1px 0 rgba(255,255,255,.22)',
    'inset 0 -1px 0 rgba(0,0,0,.14)',
    forte ? '0 10px 26px -10px rgba(0,0,0,.75)' : '0 6px 18px -10px rgba(0,0,0,.7)',
  ].join(', ');

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
  reference,
  label,
  onConfirmed,
  className,
  style,
}: AroButtonProps) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
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
        <button
          type="button"
          onClick={payment.reset}
          style={{
            ...buttonBase,
            backgroundColor: '#3a3f4b',
            backgroundImage: SHEEN,
            boxShadow: sombra(false),
          }}
        >
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
        onMouseEnter={() => {
          setHover(true);
          prefetchBaseSdk();
        }}
        onMouseLeave={() => {
          setHover(false);
          setPress(false);
        }}
        onPointerDown={() => setPress(true)}
        onPointerUp={() => setPress(false)}
        onFocus={() => {
          setHover(true);
          prefetchBaseSdk();
        }}
        onBlur={() => setHover(false)}
        onClick={() => {
          void payment.start({
            ...(itemIds ? { itemIds } : {}),
            ...(amount !== undefined ? { amount } : {}),
            ...(reference ? { reference } : {}),
          });
        }}
        style={{
          ...buttonBase,
          backgroundColor: brand,
          backgroundImage: hover && !payment.isBusy ? SHEEN_HOVER : SHEEN,
          boxShadow: sombra(hover && !payment.isBusy),
          cursor: payment.isBusy ? 'progress' : 'pointer',
          /* Ocupado nao vira cinza: perder a cor da marca no meio do
             pagamento parece que algo quebrou. Dessatura e mantem. */
          filter: payment.isBusy ? 'saturate(.55) brightness(.85)' : 'none',
          transform: press && !payment.isBusy ? 'translateY(1px)' : 'none',
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
