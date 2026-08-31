import { useState } from 'react';
import { AroButton } from 'aros/react';
import { config } from './aros.config.js';

const REPO = 'https://github.com/Bielcx/Aros';

/**
 * Site do produto.
 *
 * Duas regras que valem para a pagina inteira.
 *
 * 1. Nada aqui e inventado. Sem logo de cliente, sem depoimento, sem numero
 *    de volume. O Aros nao tem lojista nem pagamento real ainda, e uma landing
 *    que finja o contrario e mentira que qualquer avaliador confere em um
 *    clique. No lugar da prova social falsa entram a prova que existe --
 *    codigo aberto, numeros medidos -- e a secao "Onde isso esta de verdade".
 *
 * 2. A tese e dita no presente, o estagio e dito sem enfeite. "Estamos
 *    construindo a camada de aceitacao" e uma afirmacao honesta sobre para
 *    onde isso vai; "lojas usam o Aros" seria mentira. A pagina separa as
 *    duas coisas de proposito, porque e essa separacao que a torna crivel.
 */

/** O botao do hero cobra um item so, para nao depender do catalogo. */
const heroConfig = { ...config, items: undefined, amount: 29 };

type Tab = 'react' | 'bundler' | 'html';

const SNIPPETS: Record<Tab, { label: string; code: React.ReactNode }> = {
  react: {
    label: 'React',
    code: (
      <>
        <span className="tok-key">import</span> {'{ AroButton }'}{' '}
        <span className="tok-key">from</span> <span className="tok-str">'aros/react'</span>;{'\n\n'}
        {'<'}
        <span className="tok-fn">AroButton</span>{'\n  config={{'}
        {'\n    recipient: '}
        <span className="tok-str">'0xSuaCarteira'</span>
        {',\n    storeName: '}
        <span className="tok-str">'Minha Loja'</span>
        {',\n    amount: '}
        <span className="tok-str">49.9</span>
        {',\n  }}'}
        {'\n/>'}
      </>
    ),
  },
  bundler: {
    label: 'Vue, Svelte, Astro…',
    code: (
      <>
        <span className="tok-key">import</span> {'{ mount }'} <span className="tok-key">from</span>{' '}
        <span className="tok-str">'aros'</span>;{'\n\n'}
        <span className="tok-fn">mount</span>
        {'('}
        <span className="tok-str">'#checkout'</span>
        {', {'}
        {'\n  recipient: '}
        <span className="tok-str">'0xSuaCarteira'</span>
        {',\n  storeName: '}
        <span className="tok-str">'Minha Loja'</span>
        {',\n  amount: '}
        <span className="tok-str">49.9</span>
        {',\n});'}
      </>
    ),
  },
  html: {
    label: 'HTML puro',
    code: (
      <>
        <span className="tok-com">{'<!-- sem npm, sem build, sem passo de deploy -->'}</span>
        {'\n'}
        {'<div id="checkout"></div>'}
        {'\n'}
        {'<script type="module">'}
        {'\n  '}
        <span className="tok-key">import</span> {'{ mount }'} <span className="tok-key">from</span>{' '}
        <span className="tok-str">'https://cdn.jsdelivr.net/npm/aros/dist/browser/aros.js'</span>;
        {'\n  '}
        <span className="tok-fn">mount</span>
        {'('}
        <span className="tok-str">'#checkout'</span>
        {', { recipient: '}
        <span className="tok-str">'0x…'</span>
        {', storeName: '}
        <span className="tok-str">'Minha Loja'</span>
        {', amount: '}
        <span className="tok-str">49.9</span>
        {' });'}
        {'\n'}
        {'</script>'}
      </>
    ),
  },
};

export function Landing() {
  const [tab, setTab] = useState<Tab>('react');

  return (
    <>
      <nav className="nav">
        <div className="wrap nav-in">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true" />
            Aros
          </a>
          <div className="nav-links">
            <a href="#conta">A conta</a>
            <a href="#integrar">Integração</a>
            <a href="#tese">Para onde vai</a>
            <a href="#estado">Onde está</a>
            <a href={REPO}>GitHub</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap hero-in">
          <div>
            <span className="pill">
              <span className="dot" aria-hidden="true" />
              Construindo em público · Base Sepolia
            </span>

            <h1>
              Receba à vista.
              <br />
              <em>Sem maquininha, sem 30 dias.</em>
            </h1>

            <p className="lede">
              O varejo pequeno entrega 3% a 5% de cada venda no crédito e espera um mês
              pelo dinheiro. O Aros é a camada de aceitação que tira as duas coisas do
              caminho: o cliente paga em dólar digital na rede Base e o valor chega na sua
              carteira em segundos, por centavos de taxa.
            </p>

            <div className="hero-cta">
              <a className="btn btn-primary" href="#conta">
                Ver a conta
              </a>
              <a className="btn btn-ghost" href="/loja">
                Testar sem gastar nada
              </a>
            </div>

            <p className="hero-fine">
              Código aberto, MIT. Nenhum servidor nosso no caminho do seu dinheiro.
            </p>
          </div>

          <div className="demo-card">
            <div className="demo-chrome">
              <i /> <i /> <i />
              <span>loja-do-cliente.com.br</span>
            </div>
            <div className="demo-body">
              <div className="demo-item">
                <div className="demo-thumb" aria-hidden="true">
                  👕
                </div>
                <div>
                  <div className="demo-item-name">Camiseta Aros</div>
                  <div className="demo-item-sub">Tamanho M · algodão</div>
                </div>
                <div className="demo-price">$29,00</div>
              </div>

              <AroButton config={heroConfig} />

              <p className="demo-note">
                Este botão é o produto de verdade, rodando aqui. Em testnet — não gasta
                dinheiro.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section id="conta">
        <div className="wrap">
          <span className="eyebrow">A conta</span>
          <h2 className="h2">Isso não é sobre cripto. É sobre quanto sobra.</h2>
          <p className="lede" style={{ marginBottom: 32 }}>
            Nenhum lojista acorda querendo usar blockchain. Ele acorda querendo o dinheiro
            da venda de ontem.
          </p>

          <div className="versus">
            <div className="vs-card bad">
              <h3>Maquininha, crédito</h3>
              <div className="vs-row">
                <span>Taxa por venda</span>
                <b>3% a 5%</b>
              </div>
              <div className="vs-row">
                <span>Dinheiro na conta</span>
                <b>até 30 dias</b>
              </div>
              <div className="vs-row">
                <span>Receber antes</span>
                <b>custa mais</b>
              </div>
              <div className="vs-row">
                <span>Chargeback</span>
                <b>risco seu</b>
              </div>
            </div>

            <div className="vs-card good">
              <h3>Aros · USDC na Base</h3>
              <div className="vs-row">
                <span>Taxa por venda</span>
                <b>centavos de rede</b>
              </div>
              <div className="vs-row">
                <span>Dinheiro na conta</span>
                <b>segundos</b>
              </div>
              <div className="vs-row">
                <span>Receber antes</span>
                <b>não existe fila</b>
              </div>
              <div className="vs-row">
                <span>Chargeback</span>
                <b>não há estorno</b>
              </div>
            </div>
          </div>

          <p className="lede" style={{ marginTop: 24, fontSize: 14.5 }}>
            A contrapartida, dita sem rodeio: sem estorno significa que o comprador também
            não tem para onde recorrer, e o valor chega em dólar digital — converter para
            reais é hoje um passo por sua conta. É a peça que falta, e ela está descrita
            logo abaixo em vez de escondida.
          </p>
        </div>
      </section>

      <section id="integrar">
        <div className="wrap">
          <span className="eyebrow">Integração</span>
          <h2 className="h2">Três linhas, no site que você já tem</h2>
          <p className="lede" style={{ marginBottom: 28 }}>
            Não é iframe nem redirecionamento para outra página. O botão é desenhado dentro
            da sua loja, no lugar onde você mandar.
          </p>

          <div className="tabs" role="tablist">
            {(Object.keys(SNIPPETS) as Tab[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                className="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
              >
                {SNIPPETS[key].label}
              </button>
            ))}
          </div>

          <pre>
            <code>{SNIPPETS[tab].code}</code>
          </pre>

          <div className="grid-3" style={{ marginTop: 28 }}>
            <div className="feat">
              <div className="feat-icon" aria-hidden="true">
                ⚡
              </div>
              <h3>O peso só chega no clique</h3>
              <p>
                A loja carrega 4,7 KB em HTML puro, ou 67 KB num app React. O SDK da
                carteira, que pesa cerca de 1 MB, só é baixado quando o cliente encosta no
                botão.
              </p>
            </div>
            <div className="feat">
              <div className="feat-icon" aria-hidden="true">
                🧾
              </div>
              <h3>O comprovante é um link</h3>
              <p>
                Sem banco de dados, o recibo carrega os dados na própria URL e reconfere na
                blockchain toda vez que é aberto. Não depende da aba ficar aberta.
              </p>
            </div>
            <div className="feat">
              <div className="feat-icon" aria-hidden="true">
                🔌
              </div>
              <h3>Nada para manter no ar</h3>
              <p>
                Não existe servidor do Aros no caminho do seu pagamento. Se sumíssemos
                amanhã, sua loja continuaria vendendo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="tese">
        <div className="wrap">
          <span className="eyebrow">Para onde vai</span>
          <h2 className="h2">O botão é a porta de entrada, não o produto final</h2>
          <p className="lede" style={{ marginBottom: 32 }}>
            Aceitar pagamento é o primeiro passo de uma coisa maior: dar ao varejo pequeno
            uma alternativa inteira à adquirência tradicional, montada em cima de stablecoin.
            Estas são as três camadas, na ordem em que estão sendo construídas.
          </p>

          <div className="grid-3">
            <div className="feat">
              <div className="feat-icon" aria-hidden="true">
                1️⃣
              </div>
              <h3>Aceitar — existe hoje</h3>
              <p>
                O botão, a confirmação on-chain e o recibo verificável. Aberto e gratuito
                para sempre: é a distribuição, não a receita.
              </p>
            </div>
            <div className="feat">
              <div className="feat-icon" aria-hidden="true">
                2️⃣
              </div>
              <h3>Converter — a próxima peça</h3>
              <p>
                Do USDC recebido para reais na conta do lojista, sem ele precisar entender
                carteira, corretora ou câmbio. É o que separa um kit de uma adquirente.
              </p>
            </div>
            <div className="feat">
              <div className="feat-icon" aria-hidden="true">
                3️⃣
              </div>
              <h3>Administrar — depois</h3>
              <p>
                Histórico de pedidos, conciliação para a contabilidade, webhook para o
                sistema da loja. A parte que roda em servidor e por isso é a parte paga.
              </p>
            </div>
          </div>

          <p className="why-block">
            Por que nessa ordem: aceitar é o único passo que dá para entregar sem servidor,
            sem licença e sem pedir confiança a ninguém — então ele vai na frente e vai de
            graça. Converter só faz sentido com lojista de verdade recebendo. Administrar só
            faz sentido com volume para administrar.
          </p>
        </div>
      </section>

      <section id="estado">
        <div className="wrap">
          <span className="eyebrow">Sem enfeite</span>
          <h2 className="h2">Onde isso está de verdade</h2>
          <p className="lede" style={{ marginBottom: 32 }}>
            A seção acima descreve para onde o Aros vai. Esta descreve onde ele está hoje,
            em 31 de agosto de 2026. As duas coisas não são a mesma, e nenhum produto novo
            costuma admitir isso.
          </p>

          <div className="honest">
            <div className="honest-col">
              <h3>Funciona e está testado</h3>
              <ul className="honest-list">
                <li>
                  <span className="m ok">✓</span>
                  <span>
                    Fluxo de pagamento completo
                    <small>montar pedido, abrir carteira, confirmar na chain</small>
                  </span>
                </li>
                <li>
                  <span className="m ok">✓</span>
                  <span>
                    Botão em React e em HTML puro
                    <small>mesma lógica, duas embalagens</small>
                  </span>
                </li>
                <li>
                  <span className="m ok">✓</span>
                  <span>
                    Recibo que se verifica sozinho
                    <small>reconfere on-chain a cada abertura</small>
                  </span>
                </li>
                <li>
                  <span className="m ok">✓</span>
                  <span>
                    Config que falha no deploy, não na venda
                    <small>endereço errado quebra antes de ir ao ar</small>
                  </span>
                </li>
                <li>
                  <span className="m ok">✓</span>
                  <span>
                    Atribuição ERC-8021
                    <small>a transação é reconhecida pela Base</small>
                  </span>
                </li>
              </ul>
            </div>

            <div className="honest-col">
              <h3>Ainda não</h3>
              <ul className="honest-list">
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Nenhum pagamento real foi feito
                    <small>os testes provam a lógica, não a carteira do mundo real</small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Nenhuma loja usa em produção
                    <small>você seria o primeiro, e isso tem os riscos que tem</small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Não converte USDC em reais
                    <small>a camada 2 acima ainda não existe — é a maior pendência</small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Não aceita Basename
                    <small>só endereço 0x por enquanto</small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Sem painel de pedidos
                    <small>a confirmação vive na tela e no link do recibo</small>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <dl className="stats" style={{ marginTop: 28 }}>
            <div className="stat">
              <dt>Primeira carga</dt>
              <dd>
                4,7 <small>KB gzip · HTML puro</small>
              </dd>
            </div>
            <div className="stat">
              <dt>Testes passando</dt>
              <dd>14 / 14</dd>
            </div>
            <div className="stat">
              <dt>Formatos de build</dt>
              <dd>
                3 <small>ESM · CJS · browser</small>
              </dd>
            </div>
            <div className="stat">
              <dt>Servidores no caminho</dt>
              <dd>0</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="precos">
        <div className="wrap">
          <span className="eyebrow">Preços</span>
          <h2 className="h2">A camada de aceitação é grátis. Sempre.</h2>
          <p className="lede" style={{ marginBottom: 32 }}>
            Ela roda no navegador do seu cliente e o código é aberto — cobrar por ela seria
            fingir um cadeado que não existe. O que se cobra é o que precisa de servidor, e
            isso ainda está sendo construído.
          </p>

          <div className="plans">
            <div className="plan lead">
              <span className="plan-badge">Disponível</span>
              <h3>Aceitar</h3>
              <div className="price">
                R$ 0<small> /para sempre</small>
              </div>
              <p className="desc">Tudo que você precisa para receber. Licença MIT.</p>
              <ul>
                <li>
                  <span className="m">✓</span> Botão de checkout em USDC
                </li>
                <li>
                  <span className="m">✓</span> Confirmação automática on-chain
                </li>
                <li>
                  <span className="m">✓</span> Recibo verificável por link
                </li>
                <li>
                  <span className="m">✓</span> Contato de suporte por WhatsApp
                </li>
                <li>
                  <span className="m">✓</span> Sem limite de vendas ou de valor
                </li>
              </ul>
              <a className="btn btn-primary" href={REPO}>
                Pegar no GitHub
              </a>
            </div>

            <div className="plan">
              <span className="plan-badge">Em construção</span>
              <h3>Converter e administrar</h3>
              <div className="price">
                — <small>preço a definir</small>
              </div>
              <p className="desc">
                As camadas 2 e 3. Nada disso existe hoje — está aqui para você saber para
                onde vai, não para comprar.
              </p>
              <ul>
                <li>
                  <span className="m">·</span> Conversão de USDC para reais
                </li>
                <li>
                  <span className="m">·</span> Painel com histórico de pedidos
                </li>
                <li>
                  <span className="m">·</span> Webhook para o sistema da loja
                </li>
                <li>
                  <span className="m">·</span> Recibo por e-mail e WhatsApp
                </li>
                <li>
                  <span className="m">·</span> Conciliação para a contabilidade
                </li>
              </ul>
              <span className="btn btn-ghost" aria-disabled="true">
                Ainda não disponível
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap narrow">
          <span className="eyebrow">Dúvidas</span>
          <h2 className="h2">Perguntas que todo lojista faz</h2>

          <div className="faq" style={{ marginTop: 26 }}>
            <details className="q">
              <summary>Como eu transformo isso em reais na minha conta?</summary>
              <p>
                Hoje, por sua conta: o USDC chega na carteira que você configurou e a
                conversão é um passo manual, numa corretora ou serviço de câmbio. Essa é a
                camada 2 do produto e a maior pendência que existe. Está sendo dito aqui em
                vez de omitido porque é a primeira pergunta que qualquer lojista faz — e
                merece resposta honesta antes de você instalar qualquer coisa.
              </p>
            </details>
            <details className="q">
              <summary>Preciso entender de cripto para usar?</summary>
              <p>
                Para instalar, não: você troca um endereço de carteira e o nome da loja num
                arquivo de configuração. Para usar o dinheiro depois, hoje ainda sim — pela
                pergunta acima.
              </p>
            </details>
            <details className="q">
              <summary>E se o cliente fechar a aba no meio do pagamento?</summary>
              <p>
                O pagamento confirma na blockchain de qualquer forma — ele não depende da
                aba estar aberta. O que se perde é a tela de confirmação. O link do recibo
                continua válido e pode ser reaberto a qualquer momento.
              </p>
            </details>
            <details className="q">
              <summary>Vocês ficam com alguma porcentagem?</summary>
              <p>
                Não. O pagamento vai direto da carteira do cliente para a sua, sem passar
                por nós. Não existe servidor do Aros no caminho, então não haveria onde
                cobrar nem como segurar o dinheiro.
              </p>
            </details>
            <details className="q">
              <summary>O que acontece se o projeto for abandonado?</summary>
              <p>
                Sua loja continua vendendo. O código é MIT e roda inteiro no navegador do
                comprador, conversando direto com a rede Base. Não há licença para expirar
                nem serviço para desligar.
              </p>
            </details>
            <details className="q">
              <summary>Funciona no Shopify, Wix ou WordPress?</summary>
              <p>
                Onde der para colar HTML com um bloco de script, funciona — é o caso dos
                três. Não existe plugin oficial de nenhuma dessas plataformas ainda, então
                hoje é colar o código na mão.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="cta">
            <h2 className="h2" style={{ margin: 0 }}>
              Teste com dinheiro de mentira agora
            </h2>
            <p className="lede">
              A loja de demonstração roda em Base Sepolia. Dá para completar uma compra
              inteira, receber o comprovante e conferir na blockchain sem gastar nada.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="/loja">
                Abrir a loja de demonstração
              </a>
              <a className="btn btn-ghost" href={REPO}>
                Ler o código
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="site">
        <div className="wrap row">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true" />
            Aros
          </span>
          <span>Aceitação de stablecoin para o varejo pequeno</span>
          <span className="sep">
            <a href={REPO}>GitHub</a>
          </span>
          <a href="/loja">Demonstração</a>
        </div>
      </footer>
    </>
  );
}
