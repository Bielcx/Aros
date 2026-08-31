/** Endereco Ethereum em formato 0x. */
export type Address = `0x${string}`;

/** Um item vendavel da loja. Preco sempre em USDC. */
export interface AroItem {
  /** Identificador estavel do item. Aparece na referencia do pedido. */
  id: string;
  name: string;
  /** Preco em USDC. Ex: 49.9 */
  price: number;
  description?: string;
  imageUrl?: string;
}

/**
 * Configuracao de um lojista. E o unico arquivo que o lojista precisa
 * editar para colocar o Aros no ar.
 */
export interface AroConfig {
  /**
   * Carteira que recebe o pagamento.
   * Por enquanto apenas endereco 0x. Basename ainda nao e resolvido
   * (ver resolveRecipient.ts).
   */
  recipient: Address | string;

  /** Nome da loja, mostrado na tela de pagamento e no recibo. */
  storeName: string;

  /** Catalogo. Use isto OU amount, nao os dois. */
  items?: AroItem[];

  /** Preco unico, quando a loja vende so uma coisa. Em USDC. */
  amount?: number;

  /** Mensagem da tela de sucesso. */
  successMessage?: string;

  /**
   * WhatsApp de suporte em formato internacional sem simbolos.
   * Ex: "5511999998888". Usado como plano B quando o pagamento expira.
   */
  supportWhatsapp?: string;

  /** Cor da marca (qualquer valor CSS valido). Default: azul da Base. */
  brandColor?: string;

  /**
   * Builder Code do app, pego de graca em base.dev (Settings > Builder Code).
   * Vai junto de cada pagamento no formato ERC-8021 e e o que faz a Base
   * atribuir a transacao ao app: analytics, leaderboard e recompensas.
   * Sem ele o pagamento funciona igual, so nao e contabilizado.
   */
  builderCode?: string;

  /** Roda em Base Sepolia em vez da mainnet. Default: false. */
  testnet?: boolean;

  /** Quanto tempo esperar a confirmacao antes de expirar. Default: 15 min. */
  timeoutMs?: number;

  /** Intervalo inicial entre consultas de status. Default: 2500ms. */
  pollIntervalMs?: number;

  /**
   * URL da pagina que revalida um recibo (ver receipt.ts).
   * Ex: "https://minhaloja.com/recibo". Se ausente, o recibo aponta
   * direto para o explorador.
   */
  receiptBaseUrl?: string;

  /**
   * Bundler proprio para consultar status, para escapar do rate limit
   * do endpoint publico. Opcional.
   */
  bundlerUrl?: string;
}

/** Um pedido montado no navegador, antes do pagamento sair. */
export interface AroOrder {
  /** Referencia curta e legivel. Ex: "ARO-7K2M9QX4". */
  reference: string;
  /** Valor em USDC, ja normalizado como string. Ex: "49.90". */
  amount: string;
  recipient: Address;
  /** Itens escolhidos, quando o pedido veio de um catalogo. */
  items?: AroItem[];
  createdAt: number;
}

/** Estados possiveis de um pagamento no Aros. */
export type AroStatus =
  /** Nada aconteceu ainda. */
  | 'idle'
  /** Carteira aberta, esperando o cliente assinar. */
  | 'starting'
  /** Pagamento enviado, aguardando confirmacao on-chain. */
  | 'awaiting'
  /** Confirmado, com valor e destinatario conferidos. */
  | 'confirmed'
  /** A transacao entrou na chain mas falhou. */
  | 'failed'
  /** Estourou o timeout sem confirmar. */
  | 'expired'
  /** Erro antes ou durante o envio (cliente cancelou, RPC caiu, etc). */
  | 'error';

/** Resultado de um pagamento confirmado. */
export interface AroReceipt {
  /** Hash do userOp devolvido pelo pay(). E a referencia canonica. */
  paymentId: string;
  reference: string;
  amount: string;
  recipient: string;
  /** Carteira que pagou, quando o SDK devolve. */
  sender?: string;
  storeName: string;
  testnet: boolean;
  confirmedAt: number;
  /** Link para conferir a transacao fora do site da loja. */
  explorerUrl: string;
  /** Link que revalida o pagamento on-chain ao ser aberto. */
  receiptUrl?: string;
}
