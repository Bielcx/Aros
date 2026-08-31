import { useMemo, useState } from 'react';
import { formatAmount, parseReceiptUrl, sumPrices } from 'aros';
import { AroButton } from 'aros/react';
import { config } from './aros.config.js';
import { Receipt } from './Receipt.js';

const page = {
  margin: '0 auto',
  maxWidth: 560,
  padding: '48px 20px 96px',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
} as const;

export function App() {
  const receiptLink = useMemo(() => parseReceiptUrl(window.location.search), []);
  const [selected, setSelected] = useState<string[]>(['shape']);

  if (receiptLink) {
    return (
      <main style={page}>
        <Receipt link={receiptLink} />
      </main>
    );
  }

  const items = config.items ?? [];
  const total = sumPrices(
    items.filter((item) => selected.includes(item.id)).map((item) => item.price),
  );

  return (
    <main style={page}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>{config.storeName}</h1>
        <p style={{ margin: 0, opacity: 0.6, fontSize: 14 }}>
          Pagamento em USDC na Base {config.testnet ? '(Sepolia - dinheiro de teste)' : ''}
        </p>
      </header>

      <ul style={{ display: 'grid', gap: 8, listStyle: 'none', margin: '0 0 24px', padding: 0 }}>
        {items.map((item) => {
          const active = selected.includes(item.id);
          return (
            <li key={item.id}>
              <label
                style={{
                  alignItems: 'center',
                  background: active ? '#141a26' : '#10141c',
                  border: `1px solid ${active ? '#0052FF' : '#222937'}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 12,
                  padding: '14px 16px',
                }}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => {
                    setSelected((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id],
                    );
                  }}
                />
                <span style={{ flex: 1 }}>
                  {item.name}
                  {item.description ? (
                    <small style={{ display: 'block', opacity: 0.55 }}>{item.description}</small>
                  ) : null}
                </span>
                <strong>{formatAmount(item.price)}</strong>
              </label>
            </li>
          );
        })}
      </ul>

      <div style={{ borderTop: '1px solid #222937', paddingTop: 20 }}>
        <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 16px' }}>
          <span style={{ opacity: 0.6 }}>Total</span>
          <strong>{formatAmount(total)}</strong>
        </p>

        {selected.length > 0 ? (
          <AroButton
            config={config}
            itemIds={selected}
            onConfirmed={(receipt) => {
              console.info('[demo] confirmado', receipt);
            }}
          />
        ) : (
          <p style={{ opacity: 0.5, fontSize: 14 }}>Escolha ao menos um item.</p>
        )}
      </div>
    </main>
  );
}
