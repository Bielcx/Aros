import type { AroConfig } from 'aros';

/**
 * Isto e o unico arquivo que um lojista precisa editar.
 * Troque a carteira, o nome e os itens e a loja esta no ar.
 *
 * A loja de exemplo e uma marca brasileira que vende para fora, e nao um
 * comercio de bairro: e esse o caso que o Aros atende com respaldo legal
 * claro. Ver a secao "A conta" da landing.
 */
export const config: AroConfig = {
  // Endereco de exemplo. Troque pelo seu antes de testar de verdade.
  recipient: '0xFe21034794A5a574B94fE4fDfD16e005F1C96e51',
  storeName: 'Cria Skateboards',
  brandColor: '#0052FF',
  // Pegue o seu de graca em base.dev > Settings > Builder Code.
  // Sem ele o pagamento funciona igual, mas some das metricas da Base --
  // e a referencia do pedido nao vai on-chain (ver src/attribution.ts).
  // builderCode: 'aros',
  successMessage: 'Pagamento confirmado. Seu pedido entra na fila de envio!',
  supportWhatsapp: '5511999998888',
  // Sempre comece em testnet. Base Sepolia nao usa dinheiro de verdade.
  testnet: true,
  // O recibo volta para a loja, seja em localhost ou em producao.
  receiptBaseUrl: new URL('/loja', window.location.origin).toString(),
  items: [
    {
      id: 'shape',
      name: 'Shape 8.0"',
      price: 34.9,
      description: 'Maple sete lâminas, prensado em São Paulo',
    },
    { id: 'truck', name: 'Par de trucks', price: 42.5, description: 'Alumínio fundido, 139mm' },
    { id: 'roda', name: 'Jogo de rodas 53mm', price: 28, description: 'Poliuretano 99A' },
    { id: 'rolamento', name: 'Rolamentos ABEC 7', price: 12.9, description: 'Oito unidades' },
  ],
};
