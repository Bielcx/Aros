import { formatAmount, parseChargeLink, parseReceiptUrl } from 'aros';
import { AroButton } from 'aros/react';
import { Receipt } from './Receipt.js';

/**
 * Cobranca por link: /c?to=0x...&amount=1200&ref=INV-042
 *
 * Para quem fatura por projeto, botao embutido numa loja e o formato errado:
 * agencia e freelancer mandam cobranca por e-mail e WhatsApp, nao tem pagina
 * de checkout. Aqui a cobranca inteira cabe na URL.
 *
 * O fluxo de pagamento continua sendo o mesmo runPayment de sempre, e e de
 * proposito: a confirmacao automatica e o recibo verificavel dependem do id
 * que o pay() devolve. Entregar a requisicao para outro app -- via prolink,
 * por exemplo -- ganharia QR e deeplink e perderia as duas coisas.
 *
 * A leitura dos parametros mora no parseChargeLink, dentro do pacote, porque
 * e logica de dinheiro vinda da barra de enderecos e por isso precisa de
 * teste. Aqui so fica a tela.
 */
export function Charge() {
  const receiptLink = parseReceiptUrl(window.location.search);
  if (receiptLink) {
    return (
      <Shell>
        <Receipt link={receiptLink} />
      </Shell>
    );
  }

  const { input, amount, config, problems } = parseChargeLink(
    window.location.search,
    new URL('/c', window.location.origin).toString(),
  );

  if (problems.length > 0) {
    return (
      <Shell>
        <div className="charge-bad">
          <h1>Este link de cobrança não está completo</h1>
          <ul>
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="charge-hint">
            Peça a quem enviou para gerar o link de novo. O formato é{' '}
            <code>/c?to=0xCarteira&amp;amount=1200&amp;ref=INV-042</code>.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="charge">
        {input.name ? <p className="charge-from">{input.name} está cobrando</p> : null}
        <p className="charge-amount">{formatAmount(amount)}</p>
        {input.note ? <p className="charge-note">{input.note}</p> : null}

        <dl className="charge-meta">
          {input.reference ? (
            <div>
              <dt>Referência</dt>
              <dd>{input.reference}</dd>
            </div>
          ) : null}
          <div>
            <dt>Vai para a carteira</dt>
            <dd className="addr">{input.to}</dd>
          </div>
          <div>
            <dt>Rede</dt>
            <dd>{input.testnet ? 'Base Sepolia (teste)' : 'Base'}</dd>
          </div>
        </dl>

        <AroButton
          config={config}
          label={`Pagar ${formatAmount(amount)}`}
          {...(input.reference ? { reference: input.reference } : {})}
        />

        <p className="charge-warn">
          Confira o endereço acima antes de pagar. O Aros só monta o link — quem o enviou
          escolheu o destino, e pagamento em blockchain não tem estorno.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shop">
      <div className="charge-in">
        {children}
        <p className="made">
          Cobrança por <b>Aros</b> — <a href="/">ver o produto</a>
        </p>
      </div>
    </div>
  );
}
