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
        <div className="bar">
          <div className="bar-logo" aria-hidden="true">
            🛹
          </div>
          <div className="bar-name">{config.storeName}</div>
          {config.testnet ? <div className="bar-net">Base Sepolia · dinheiro de teste</div> : null}
        </div>

        {receiptLink ? (
          <Receipt link={receiptLink} />
        ) : (
          <>
            <h1>Monte seu setup</h1>
            <p className="sub">
              Escolha as peças e pague em USDC. A confirmação aparece aqui mesmo.
            </p>

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
              {chosen.map((item) => (
                <p className="line" key={item.id}>
                  <span>{item.name}</span>
                  <b>{formatAmount(item.price)}</b>
                </p>
              ))}

              <p className="line total">
                <span>Total</span>
                <b>{formatAmount(total)}</b>
              </p>

              {chosen.length > 0 ? (
                <AroButton
                  config={config}
                  itemIds={selected}
                  onConfirmed={(receipt) => {
                    console.info('[demo] confirmado', receipt);
                  }}
                />
              ) : (
                <p className="empty">Escolha ao menos uma peça.</p>
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
