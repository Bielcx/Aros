// Nucleo do Aros. Sem React, sem DOM: da para usar em qualquer lugar.

export { formatAmount, normalizeAmount, sumPrices, USDC_DECIMALS } from './amount.js';
export { BASE_BLUE, DEFAULTS, defineConfig, validateConfig } from './config.js';
export type { ResolvedAroConfig } from './config.js';
export { parseChargeLink } from './chargeLink.js';
export type { ChargeLinkInput, ParsedChargeLink } from './chargeLink.js';
export { createOrder } from './createOrder.js';
export type { CreateOrderInput } from './createOrder.js';
export { AroError, toMessage } from './errors.js';
export type { AroErrorCode } from './errors.js';
export { buildAttributionSuffix, readAttribution } from './attribution.js';
export type { AttributionInput, DecodedAttribution } from './attribution.js';
export { createReference } from './reference.js';
export {
  buildReceipt,
  buildReceiptUrl,
  addressExplorerUrl,
  explorerUrl,
  parseReceiptUrl,
  userOpExplorerUrl,
  verifyReceipt,
} from './receipt.js';
export type { ParsedReceiptLink, VerifiedReceipt } from './receipt.js';
export { isAddress, resolveRecipient } from './resolveRecipient.js';
export { runPayment } from './runPayment.js';
export { loadBaseSdk, prefetchBaseSdk } from './sdk.js';
export type { AroEvent, RunPaymentOptions, RunPaymentResult } from './runPayment.js';
export type { Address, AroConfig, AroItem, AroOrder, AroReceipt, AroStatus } from './types.js';
export { buildWhatsappUrl } from './whatsapp.js';
export type { WhatsappReason } from './whatsapp.js';
export { watchPayment } from './watchPayment.js';
export type { WatchOutcome, WatchPaymentOptions, WatchPaymentResult } from './watchPayment.js';
