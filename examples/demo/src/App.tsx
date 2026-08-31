import { useMemo, useState } from 'react';
import { formatAmount, parseReceiptUrl, sumPrices } from 'aros';
import { AroButton } from 'aros/react';
import { config } from './aros.config.js';
import { Landing } from './Landing.js';
import { Receipt } from './Receipt.js';

/** So a vitrine e enfeitada: o kit nao pede imagem nenhuma. */
const THUMBS: Record<string, string> = {
  shape: '🛹',
  truck: '🔩',
  roda: '⚪',
  rolamento: '⚙️',
};

/**
 * Duas paginas, sem router: "/" e o site do produto, "/loja" e a loja de
 * demonstracao. Uma dependencia a menos para duas rotas que nunca mudam.
 */
export function App() {
  const receiptLink = useMemo(() => parseReceiptUrl(window.location.search), []);
  const isShop = window.location.pathname.startsWith('/loja') || receiptLink !== null;

  return isShop ? <Shop receiptLink={receiptLink} /> : <Landing />;
}

function Shop({ receiptLink }: { receiptLink: ReturnType<typeof parseReceiptUrl> }) {
  const [selected, setSelected] = useState<string[]>(['shape']);

  const items = config.items ?? [];
  const chosen = items.filter((item) => selected.includes(item.id));
  const total = sumPrices(chosen.map((item) => item.price));

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="shop">
      <div className="shop-in">
        <header className="bar">
          <div className="bar-logo" aria-hidden="true">
            🛹
          </div>
          <div className="bar-id">
            <div className="bar-name">{config.storeName}</div>
            <div className="bar-tag">São Paulo, Brasil · enviamos para o mundo</div>
          </div>
          {config.testnet ? <div className="bar-net">Base Sepolia · teste</div> : null}
        </header>

        {receiptLink ? (
          <Receipt link={receiptLink} />
        ) : (
          <>
            <div className="shop-hero">
              <h1>Monte seu setup</h1>
              <p className="sub">
                Preços em dólar, pagamento em USDC. Sem conversão, sem cartão internacional,
                sem taxa escondida no câmbio.
              </p>
            </div>

            <ul className="catalog">
              {items.map((item) => {
                const on = selected.includes(item.id);
                return (
                  <li key={item.id}>
                    <label className={on ? 'card on' : 'card'}>
                      <input type="checkbox" checked={on} onChange={() => toggle(item.id)} />
                      <span className="thumb" aria-hidden="true">
                        {THUMBS[item.id] ?? '📦'}
                      </span>
                      <span className="card-text">
                        <span className="card-name">{item.name}</span>
                        {item.description ? (
                          <small className="card-desc">{item.description}</small>
                        ) : null}
                      </span>
                      <span className="card-price">{formatAmount(item.price)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>

            <div className="checkout">
              <h2 className="checkout-title">Seu pedido</h2>

              {chosen.length > 0 ? (
                <>
                  {chosen.map((item) => (
                    <p className="line" key={item.id}>
                      <span>{item.name}</span>
                      <b>{formatAmount(item.price)}</b>
                    </p>
                  ))}
                  <p className="line">
                    <span>Envio internacional</span>
                    <b className="free">grátis</b>
                  </p>

                  <p className="line total">
                    <span>Total</span>
                    <b>{formatAmount(total)}</b>
                  </p>

                  <AroButton
                    config={config}
                    itemIds={selected}
                    onConfirmed={(receipt) => {
                      console.info('[demo] confirmado', receipt);
                    }}
                  />

                  <ul className="trust">
                    <li>Vai direto para a carteira da loja</li>
                    <li>Sem cadastro e sem dados de cartão</li>
                    <li>Comprovante que se verifica sozinho</li>
                  </ul>
                </>
              ) : (
                <p className="empty">Escolha ao menos uma peça para continuar.</p>
              )}
            </div>
          </>
        )}

        <p className="made">
          Checkout por <b>Aros</b> — <a href="/">ver o produto</a>
        </p>
      </div>
    </div>
  );
}
