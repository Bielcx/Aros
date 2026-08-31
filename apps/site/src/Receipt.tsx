import { useEffect, useState } from 'react';
import { addressExplorerUrl, explorerUrl, formatAmount, verifyReceipt } from 'aros';
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

      {/* Dois links de propósito. O de cima usa o id do pagamento, que é
          hash de userOp — e não está confirmado que o Basescan resolve isso
          no /tx/. O de baixo abre a carteira que recebeu, que o Basescan
          indexa com certeza, e serve de rede até um pagamento real dizer
          qual dos dois é o certo. */}
      <div className="links">
        <a href={explorerUrl(link.paymentId, link.testnet)} target="_blank" rel="noreferrer">
          Ver a transação
        </a>
        <a
          href={addressExplorerUrl(link.recipient, link.testnet)}
          target="_blank"
          rel="noreferrer"
        >
          Ver a carteira que recebeu
        </a>
        <a className="muted" href="/">
          Voltar para a loja
        </a>
      </div>
    </section>
  );
}
