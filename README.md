# Aros

Botão de checkout em USDC na rede Base, para loja pequena.

Um botão que o lojista cola no site e passa a aceitar pagamento em cripto:
liquidação em segundos, taxa abaixo de um centavo, sem chargeback e sem
operadora de cartão no meio.

**Zero backend, zero banco de dados.** Isso é decisão de produto, não
limitação técnica: depois de instalado, o kit não tem custo de manutenção
nem servidor para cair.

## Estrutura

```
packages/aros      a biblioteca (é isso que se vende)
examples/demo      loja de exemplo em Base Sepolia, para testar
```

## Como funciona

1. O lojista preenche um `config`: carteira, nome da loja, itens, WhatsApp, cor.
2. O `AroButton` monta o pedido e chama `pay()` do SDK da Base.
3. O `pay()` devolve o hash do userOp. Esse hash **é** a referência do pedido.
4. O `watchPayment` pergunta o status desse hash até confirmar, falhar ou
   expirar (~15 min), com backoff.
5. Confirmado, a tela troca sozinha e mostra um link de comprovante.

### O que mudou em relação ao plano original

O plano previa varrer a chain procurando uma transferência que batesse com
valor + memo. Não é preciso: um `transfer` de ERC-20 não carrega memo, mas o
`getPaymentStatus({ id, expectedPayment })` do SDK já confere o valor e o
destinatário contra a transferência que realmente aconteceu. O `watchPayment`
virou um poller fino em cima disso, e a referência legível (`ARO-7K2M9QX4`)
viaja no `dataSuffix` só para o humano citar no WhatsApp.

## Peças

| Peça | Onde | O que faz |
| --- | --- | --- |
| `AroConfig` | `src/types.ts` | tudo que o lojista configura |
| `defineConfig` | `src/config.ts` | valida e aplica defaults, falha cedo |
| `createOrder` | `src/createOrder.ts` | monta o pedido, puro, sem rede |
| `runPayment` | `src/runPayment.ts` | o fluxo inteiro, sem framework |
| `watchPayment` | `src/watchPayment.ts` | acompanha até confirmar/expirar |
| atribuição | `src/attribution.ts` | Builder Code + referência no ERC-8021 |
| `useAroPayment` | `src/react/` | o mesmo fluxo como estado de React |
| `AroButton` | `src/react/` + `src/vanilla/` | botão pronto, React e JS puro |
| recibo | `src/receipt.ts` | link verificável sem servidor |

## O recibo, e o furo que ele tapa

Sem backend, a tela de sucesso só existe enquanto a aba estiver aberta — e ela
é uma afirmação do navegador de quem paga, não uma prova para o lojista.

Por isso o comprovante é uma **URL auto-contida**: id do pagamento, valor,
destinatário e rede vão nos parâmetros, e a página reconfere on-chain toda vez
que é aberta. Nada é guardado em lugar nenhum, o link continua válido meses
depois, e o lojista pode abrir o mesmo link para conferir.

## Rodando

```bash
npm install
npm run build      # compila a lib
npm test           # 11 testes do nucleo, sem dependencia externa
npm run dev        # sobe a demo em http://localhost:5173
```

A demo roda em **Base Sepolia** (`testnet: true`), sem dinheiro de verdade.

Estado atual: typecheck limpo, build nos tres formatos, 11 testes passando,
demo compilando.

## Builder Code (atribuição da Base)

O `dataSuffix` de um pagamento não é campo livre: é onde a Base lê **qual app
originou a transação**, no formato ERC-8021. O primeiro rascunho deste kit
gravava a referência do pedido ali, o que funcionava mas jogava fora a
atribuição inteira.

A solução não é escolher entre os dois. O schema 2 do ERC-8021 carrega o código
do app **e** metadados livres no mesmo sufixo:

```ts
// src/attribution.ts
Attribution.toDataSuffix({
  appCode: 'aros',
  metadata: { ref: 'ARO-7K2M9QX4' },
});
```

Pegue o código de graça em [base.dev](https://base.dev) → Settings → Builder
Code e coloque em `builderCode` no config. Com ele, a Base atribui as transações
ao Aros: analytics, leaderboard e elegibilidade a recompensas.

**Detalhe que não está na documentação:** o `ox` só usa o schema 2 quando existe
um `appCode`. Com metadados sozinhos ele cai no schema 0 e **descarta a
referência em silêncio**, gravando um sufixo vazio que só queima gas. Por isso
`buildAttributionSuffix` devolve `undefined` sem Builder Code, e o pagamento sai
sem sufixo nenhum.

Custo com código: ~47 bytes a 16 de gas por byte. Fração de centavo na Base.

## Peso da pagina

O SDK da Base pesa cerca de 1 MB e traz um wasm junto. Numa loja pequena,
acessada do celular do cliente, isso decide se a pagina abre.

Por isso o SDK e carregado **sob demanda** (`src/sdk.ts`), e o botao comeca a
baixar quando o cliente encosta o mouse nele. O que sobra para a primeira
carga:

| | primeira carga | sob demanda |
| --- | --- | --- |
| demo React completa | 212 KB (67 KB gzip) | 1,1 MB + wasm + 23 KB de atribuição |
| kit em HTML puro | 12 KB (4,6 KB gzip) | 1 MB |

O encoder ERC-8021 segue a mesma regra do SDK: mora em `src/attribution.ts` e é
importado dinamicamente. Deixá-lo estático custava 5 KB gzip na primeira carga —
e ele só faz falta no clique.

Antes do carregamento sob demanda, a demo custava 285 KB gzip de cara --
mais de 4x o que custa agora.

## Uso em React

```tsx
import { AroButton } from 'aros/react';

const config = {
  recipient: '0xSuaCarteira',
  storeName: 'Minha Loja',
  amount: 49.9,
  supportWhatsapp: '5511999998888',
};

<AroButton config={config} />;
```

## Uso em HTML puro

Copie a pasta `dist/browser/` para o site e use um script de modulo. E ESM de
proposito: e o que permite o SDK ficar num arquivo separado.

```html
<div id="checkout"></div>
<script type="module">
  import { mount } from './aros/aros.js';

  mount('#checkout', {
    recipient: '0xSuaCarteira',
    storeName: 'Minha Loja',
    amount: 49.9,
  });
</script>
```

## Pendências conhecidas

Estão aqui de propósito, em vez de escondidas no código:

- **Basename não resolve.** O config só aceita endereço `0x`. Resolver exige
  consultar o resolver L2 da Base; o ponto de extensão está em
  `src/resolveRecipient.ts`.
- **Link do explorador não foi verificado.** O `id` é hash de userOp, não de
  transação, e o Basescan indexa transações. Fazer um pagamento real na Sepolia
  e conferir se resolve lá ou se o link certo é o de um explorador de userOp
  (`userOpExplorerUrl`).
- **Erro de RPC e valor divergente caem no mesmo `catch`.** O SDK lança nos dois
  casos sem separá-los, então o `watchPayment` tenta 5 vezes antes de desistir.
  Um pagamento com valor errado leva ~12s para ser reportado.
- **Nunca rodou um pagamento de verdade.** Tudo que está verificado é
  typecheck, build e teste de unidade. O fluxo ponta a ponta com carteira em
  Base Sepolia é o próximo passo, e é o que valida de fato o kit.
- **A tela de sucesso não cobre o cliente que fecha a aba.** O pagamento
  confirma na chain de qualquer jeito, mas ninguém vê. O link de comprovante
  existe justamente para esse caso — falta decidir como entregá-lo antes da
  confirmação.
