import type { AroConfig } from 'aros';

/**
 * Isto e o unico arquivo que um lojista precisa editar.
 * Troque a carteira, o nome e os itens e a loja esta no ar.
 */
export const config: AroConfig = {
  // Endereco de exemplo. Troque pelo seu antes de testar de verdade.
  recipient: '0xFe21034794A5a574B94fE4fDfD16e005F1C96e51',
  storeName: 'Skate Shop Exemplo',
  brandColor: '#0052FF',
  // Pegue o seu de graca em base.dev > Settings > Builder Code.
  // Sem ele o pagamento funciona igual, mas some das metricas da Base --
  // e a referencia do pedido nao vai on-chain (ver src/attribution.ts).
  // builderCode: 'aros',
  successMessage: 'Pagamento confirmado. Passa aqui pra retirar!',
  supportWhatsapp: '5511999998888',
  // Sempre comece em testnet. Base Sepolia nao usa dinheiro de verdade.
  testnet: true,
  // O recibo volta para a loja, seja em localhost ou em producao.
  receiptBaseUrl: new URL('/loja', window.location.origin).toString(),
  items: [
    { id: 'shape', name: 'Shape 8.0"', price: 34.9, description: 'Maple sete laminas' },
    { id: 'truck', name: 'Par de trucks', price: 42.5 },
    { id: 'roda', name: 'Jogo de rodas 53mm', price: 28 },
    { id: 'rolamento', name: 'Rolamentos ABEC 7', price: 12.9 },
  ],
};
