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
    <section className="receipt">
      <span className="ref">PEDIDO {link.reference}</span>
      <h1>{formatAmount(link.amount)}</h1>

      {result === null ? (
        <p className="pending">Conferindo na chain…</p>
      ) : result.valid ? (
        <div className="verdict good">
          <b>Pagamento confirmado on-chain.</b>
          <p>
            De {result.sender} para {result.recipient}
          </p>
        </div>
      ) : (
        <div className="verdict bad">
          <b>Não foi possível confirmar.</b>
          <p>{result.reason}</p>
        </div>
      )}

      <div className="links">
        <a href={explorerUrl(link.paymentId, link.testnet)} target="_blank" rel="noreferrer">
          Abrir no explorador
        </a>
        <a className="muted" href="/">
          Voltar para a loja
        </a>
      </div>
    </section>
  );
}
