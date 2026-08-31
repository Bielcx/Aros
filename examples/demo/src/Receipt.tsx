import { useEffect, useState } from 'react';
import { explorerUrl, formatAmount, verifyReceipt } from 'aros';
import type { ParsedReceiptLink, VerifiedReceipt } from 'aros';

/**
 * A pagina de recibo. Nao le banco de dados nenhum: tudo que precisa esta
 * na URL, e a validade e reconferida na chain a cada abertura.
 */
export function Receipt({ link }: { link: ParsedReceiptLink }) {
  const [result, setResult] = useState<VerifiedReceipt | null>(null);

  useEffect(() => {
    let alive = true;
    void verifyReceipt(link).then((verified) => {
      if (alive) setResult(verified);
    });
    return () => {
      alive = false;
    };
  }, [link]);

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h1 style={{ fontSize: 22, margin: 0 }}>Comprovante {link.reference}</h1>
      <p style={{ margin: 0, opacity: 0.7 }}>{formatAmount(link.amount)}</p>

      {result === null ? (
        <p style={{ margin: 0 }}>Conferindo na chain...</p>
      ) : result.valid ? (
        <div style={{ background: '#0f2a1a', border: '1px solid #1f7a4d', borderRadius: 12, padding: 16 }}>
          <strong style={{ color: '#4ade80' }}>Pagamento confirmado on-chain.</strong>
          <p style={{ fontSize: 13, margin: '8px 0 0', opacity: 0.8, wordBreak: 'break-all' }}>
            De {result.sender} para {result.recipient}
          </p>
        </div>
      ) : (
        <div style={{ background: '#2a0f14', border: '1px solid #7a1f2f', borderRadius: 12, padding: 16 }}>
          <strong style={{ color: '#f87171' }}>Nao foi possivel confirmar.</strong>
          <p style={{ fontSize: 13, margin: '8px 0 0', opacity: 0.8 }}>{result.reason}</p>
        </div>
      )}

      <a
        href={explorerUrl(link.paymentId, link.testnet)}
        target="_blank"
        rel="noreferrer"
        style={{ color: '#0052FF', fontSize: 14 }}
      >
        Abrir no explorador
      </a>
      <a href="/" style={{ color: '#8b93a7', fontSize: 14 }}>
        Voltar para a loja
      </a>
    </section>
  );
}
