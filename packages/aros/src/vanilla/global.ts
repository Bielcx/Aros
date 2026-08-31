/**
 * Entrada do build para uso direto no navegador, sem bundler.
 *
 * E ESM de proposito: so assim o SDK da Base fica num arquivo separado,
 * carregado no clique. Em IIFE tudo vira um arquivo so de mais de 1 MB,
 * que a loja pagaria em toda visita.
 *
 * Uso:
 *   <script type="module">
 *     import { mount } from './aros/aros.js';
 *     mount('#checkout', { recipient: '0x...', storeName: 'Loja', amount: 49.9 });
 *   </script>
 *
 * Tambem expoe window.Aros, para quem preferir script solto:
 *   <script type="module" src="./aros/aros.js"></script>
 *   <script type="module">
 *     Aros.mount('#checkout', { ... });
 *   </script>
 */
import { formatAmount } from '../amount.js';
import { defineConfig, validateConfig } from '../config.js';
import { addressExplorerUrl, explorerUrl, parseReceiptUrl, verifyReceipt } from '../receipt.js';
import { runPayment } from '../runPayment.js';
import { prefetchBaseSdk } from '../sdk.js';
import { mount } from './mount.js';

const Aros = {
  mount,
  defineConfig,
  validateConfig,
  formatAmount,
  parseReceiptUrl,
  verifyReceipt,
  addressExplorerUrl,
  explorerUrl,
  runPayment,
  prefetchBaseSdk,
};

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).Aros = Aros;
}

export {
  mount,
  defineConfig,
  validateConfig,
  formatAmount,
  parseReceiptUrl,
  verifyReceipt,
  addressExplorerUrl,
  explorerUrl,
  runPayment,
  prefetchBaseSdk,
};
export default Aros;
