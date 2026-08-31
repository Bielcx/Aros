// Testa o pacote publicado (dist/), nao o codigo-fonte. Rode depois do build.
// node --test  (sem dependencia nenhuma)
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildAttributionSuffix,
  createOrder,
  createReference,
  defineConfig,
  normalizeAmount,
  parseReceiptUrl,
  readAttribution,
  sumPrices,
  validateConfig,
  watchPayment,
} from '../dist/index.js';

const WALLET = '0xFe21034794A5a574B94fE4fDfD16e005F1C96e51';

const baseConfig = {
  recipient: WALLET,
  storeName: 'Loja Teste',
  items: [
    { id: 'a', name: 'Item A', price: 34.9 },
    { id: 'b', name: 'Item B', price: 12.1 },
  ],
};

test('normalizeAmount respeita as 6 casas do USDC', () => {
  assert.equal(normalizeAmount(49.9), '49.90');
  assert.equal(normalizeAmount('49,90'), '49.90');
  assert.equal(normalizeAmount(0.000001), '0.000001');
  assert.throws(() => normalizeAmount(0), /maior que zero/);
  assert.throws(() => normalizeAmount('abc'), /invalido/);
});

test('sumPrices nao acumula erro de ponto flutuante', () => {
  assert.equal(sumPrices([0.1, 0.2]), 0.3);
  assert.equal(normalizeAmount(sumPrices([34.9, 12.1])), '47.00');
});

test('a referencia vai e volta pelo dataSuffix ERC-8021', () => {
  const reference = createReference();
  assert.match(reference, /^ARO-[0-9A-HJ-NP-TV-Z]{8}$/);

  const suffix = buildAttributionSuffix({ reference, builderCode: 'aros' });
  assert.match(suffix, /^0x[0-9a-f]+$/);
  // Todo sufixo ERC-8021 termina com o marcador de 16 bytes.
  assert.ok(suffix.endsWith('80218021802180218021802180218021'));

  const decoded = readAttribution(suffix);
  assert.equal(decoded?.reference, reference);
  assert.equal(decoded?.builderCode, 'aros');
});

test('sem builder code nao manda sufixo nenhum', () => {
  // O ox so usa o schema 2 (com metadados) quando ha appCode. Sem codigo, a
  // referencia seria descartada em silencio, entao nao gravamos nada.
  assert.equal(buildAttributionSuffix({ reference: createReference() }), undefined);
});

test('readAttribution ignora calldata que nao e ERC-8021', () => {
  assert.equal(readAttribution('0xdeadbeef'), null);
});

test('o builder code do config chega no pagamento', () => {
  const resolved = defineConfig({ ...baseConfig, builderCode: 'aros' });
  assert.equal(resolved.builderCode, 'aros');
});

test('validateConfig aponta os problemas em vez de estourar', () => {
  assert.deepEqual(validateConfig(baseConfig), []);
  const problems = validateConfig({ recipient: 'meu.base.eth', storeName: '' });
  assert.ok(problems.some((p) => p.includes('Basename')));
  assert.ok(problems.some((p) => p.includes('storeName')));
  assert.ok(problems.some((p) => p.includes('items')));
});

test('defineConfig aplica os defaults', () => {
  const resolved = defineConfig(baseConfig);
  assert.equal(resolved.brandColor, '#0052FF');
  assert.equal(resolved.testnet, false);
  assert.equal(resolved.timeoutMs, 15 * 60 * 1000);
});

test('createOrder soma os itens escolhidos', () => {
  const order = createOrder(baseConfig, { itemIds: ['a', 'b'] });
  assert.equal(order.amount, '47.00');
  assert.equal(order.recipient, WALLET);
  assert.equal(order.items?.length, 2);
  assert.throws(() => createOrder(baseConfig, { itemIds: ['z'] }), /nao existe/);
});

test('watchPayment confirma quando o status vira completed', async () => {
  const respostas = ['not_found', 'pending', 'completed'];
  let chamadas = 0;

  const result = await watchPayment({
    id: '0xabc',
    expected: { amount: '47.00', recipient: WALLET },
    pollIntervalMs: 5,
    timeoutMs: 2000,
    checkStatus: async () => {
      const status = respostas[Math.min(chamadas, respostas.length - 1)];
      chamadas += 1;
      return { status, id: '0xabc', message: '', sender: '0x1' };
    },
  });

  assert.equal(result.outcome, 'confirmed');
  assert.equal(chamadas, 3);
});

test('watchPayment expira sem confirmar', async () => {
  const result = await watchPayment({
    id: '0xabc',
    expected: { amount: '47.00', recipient: WALLET },
    pollIntervalMs: 5,
    timeoutMs: 60,
    checkStatus: async () => ({ status: 'pending', id: '0xabc', message: '' }),
  });
  assert.equal(result.outcome, 'expired');
});

test('watchPayment desiste depois de 5 erros seguidos de RPC', async () => {
  await assert.rejects(
    watchPayment({
      id: '0xabc',
      expected: { amount: '47.00', recipient: WALLET },
      pollIntervalMs: 1,
      timeoutMs: 5000,
      checkStatus: async () => {
        throw new Error('RPC fora do ar');
      },
    }),
    /5 tentativas/,
  );
});

test('watchPayment para quando recebe abort', async () => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 20);
  const result = await watchPayment({
    id: '0xabc',
    expected: { amount: '47.00', recipient: WALLET },
    pollIntervalMs: 10,
    timeoutMs: 5000,
    signal: controller.signal,
    checkStatus: async () => ({ status: 'pending', id: '0xabc', message: '' }),
  });
  assert.equal(result.outcome, 'aborted');
});

test('o recibo sobrevive so na URL', () => {
  const parsed = parseReceiptUrl('?id=0xabc&ref=ARO-1234ABCD&amt=47.00&to=' + WALLET + '&net=sepolia');
  assert.equal(parsed?.paymentId, '0xabc');
  assert.equal(parsed?.amount, '47.00');
  assert.equal(parsed?.testnet, true);
  assert.equal(parseReceiptUrl('?nada=1'), null);
});
