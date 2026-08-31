import type { getPaymentStatus as GetPaymentStatus, pay as Pay } from '@base-org/account';

interface BaseSdk {
  pay: typeof Pay;
  getPaymentStatus: typeof GetPaymentStatus;
}

let pending: Promise<BaseSdk> | null = null;

/**
 * Carrega o SDK da Base sob demanda.
 *
 * O SDK pesa quase 1 MB e arrasta um wasm junto. Importar ele no topo do
 * arquivo joga esse peso na primeira carga da loja, mesmo para quem nunca
 * vai clicar em pagar. Numa loja pequena, acessada no 4G do cliente, isso
 * e a diferenca entre a pagina abrir e a pessoa desistir.
 *
 * Carregando aqui, o custo so aparece no clique -- e o bundler consegue
 * separar em outro arquivo.
 */
export function loadBaseSdk(): Promise<BaseSdk> {
  pending ??= import('@base-org/account').then((mod) => ({
    pay: mod.pay,
    getPaymentStatus: mod.getPaymentStatus,
  }));
  return pending;
}

/**
 * Comeca a baixar o SDK sem esperar o resultado.
 * Chame quando o cliente demonstrar intencao de comprar (abriu o carrinho,
 * passou o mouse no botao) para o clique ficar instantaneo.
 */
export function prefetchBaseSdk(): void {
  void loadBaseSdk().catch(() => {
    // Silencioso de proposito: e so aquecimento, o clique tenta de novo.
  });
}
