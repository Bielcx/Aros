import { useState } from 'react';
import { AroButton } from 'aros/react';
import { config } from './aros.config.js';

const REPO = 'https://github.com/Bielcx/Aros';

/**
 * Site do produto.
 *
 * Tres regras que valem para a pagina inteira.
 *
 * 1. Nada aqui e inventado. Sem logo de cliente, sem depoimento, sem numero
 *    de volume. O Aros nao tem usuario nem pagamento real ainda, e uma landing
 *    que finja o contrario e mentira que se confere em um clique. No lugar da
 *    prova social falsa entram a prova que existe -- codigo aberto, numeros
 *    medidos -- e a secao "Onde isso esta de verdade".
 *
 * 2. A tese e dita no presente, o estagio e dito sem enfeite. As duas coisas
 *    ficam em secoes separadas de proposito: e essa separacao que torna a
 *    primeira crivel em vez de marketing.
 *
 * 3. O alvo principal e quem recebe de fora, nao a loja de bairro. Nao e
 *    preferencia de mercado, e consequencia da regra: no recebimento do
 *    exterior o IOF e 0,38%, e na exportacao de servicos costuma ser zero,
 *    enquanto liquidar venda domestica em ativo virtual caiu na zona que a
 *    Resolucao BCB 561 fechou. O varejo local continua na pagina como caso
 *    secundario, e com a ressalva dita na cara.
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
        <span className="tok-str">'Meu Estúdio'</span>
        {',\n    amount: '}
        <span className="tok-str">1200</span>
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
        <span className="tok-str">'Meu Estúdio'</span>
        {',\n  amount: '}
        <span className="tok-str">1200</span>
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
        <span className="tok-str">'Meu Estúdio'</span>
        {', amount: '}
        <span className="tok-str">1200</span>
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
              Cobre do exterior
              <br />
              <em>sem perder na travessia.</em>
            </h1>

            <p className="lede">
              Quem fatura em dólar pelo Brasil entrega uma fatia do valor ao intermediário,
              outra ao spread de câmbio, e ainda espera dias. O Aros é a camada de aceitação
              que corta a fila: o cliente paga em dólar digital na rede Base e o valor chega
              na sua carteira em segundos, por centavos de taxa de rede.
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
              Para agências, freelancers, SaaS e lojas que vendem para fora. Código aberto,
              MIT.
            </p>
          </div>

          <div className="demo-card">
            <div className="demo-chrome">
              <i /> <i /> <i />
              <span>meu-estudio.com.br</span>
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
            Ninguém acorda querendo usar blockchain. Acorda querendo o dinheiro do trabalho
            que entregou semana passada.
          </p>

          <div className="versus">
            <div className="vs-card bad">
              <h3>Receber do exterior, do jeito de hoje</h3>
              <div className="vs-row">
                <span>Taxa do intermediário</span>
                <b>alguns porcento</b>
              </div>
              <div className="vs-row">
                <span>Spread de câmbio</span>
                <b>embutido, opaco</b>
              </div>
              <div className="vs-row">
                <span>Dinheiro na conta</span>
                <b>dias úteis</b>
              </div>
              <div className="vs-row">
                <span>Conta retida ou bloqueada</span>
                <b>acontece</b>
              </div>
            </div>

            <div className="vs-card good">
              <h3>Aros · USDC na Base</h3>
              <div className="vs-row">
                <span>Taxa do intermediário</span>
                <b>não há intermediário</b>
              </div>
              <div className="vs-row">
                <span>Custo da transação</span>
                <b>centavos de rede</b>
              </div>
              <div className="vs-row">
                <span>Dinheiro na carteira</span>
                <b>segundos</b>
              </div>
              <div className="vs-row">
                <span>IOF na entrada</span>
                <b>0,38% ou isento</b>
              </div>
            </div>
          </div>

          <p className="why-block">
            O IOF de 0,38% é a alíquota de recebimento do exterior; na exportação de
            serviços a operação costuma ficar zerada. Isso vale para a conversão do valor
            recebido em reais, feita por um parceiro licenciado — não para a transferência
            em si, que acontece direto entre carteiras. Alíquota é assunto do seu contador,
            não nosso: os números estão aqui para você conferir, não para acreditar.
          </p>

          <div className="aside">
            <h3>E para quem vende aqui dentro?</h3>
            <p>
              O botão funciona igual, e alguns lojistas vão querer usá-lo com clientes
              brasileiros. Só que aí a operação é doméstica liquidada em ativo virtual, e é
              justamente o terreno que a Resolução BCB 561 fechou para intermediários
              regulados a partir de outubro de 2026. O kit é aberto e não impede ninguém —
              mas se o seu caso é esse, converse com um contador antes, porque o caminho de
              volta para reais é bem menos claro que no recebimento de fora.
            </p>
          </div>
        </div>
      </section>

      <section id="integrar">
        <div className="wrap">
          <span className="eyebrow">Integração</span>
          <h2 className="h2">Três linhas, no site que você já tem</h2>
          <p className="lede" style={{ marginBottom: 28 }}>
            Não é iframe nem redirecionamento para outra página. O botão é desenhado dentro
            do seu site, no lugar onde você mandar.
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
                A página carrega 4,7 KB em HTML puro, ou 67 KB num app React. O SDK da
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
                Não existe servidor do Aros no caminho do seu dinheiro. Se sumíssemos
                amanhã, seu site continuaria cobrando.
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
            Aceitar é o primeiro passo de uma coisa maior: dar a quem fatura de fora uma
            alternativa inteira aos intermediários de sempre. Três camadas, na ordem em que
            estão sendo construídas.
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
              <h3>Converter — via parceiro</h3>
              <p>
                Do USDC recebido para reais na conta, sem você abrir corretora. Converter
                exige autorização do Banco Central, então isso é integração com um VASP
                licenciado — não algo que o Aros faz sozinho, e não vamos fingir que é.
              </p>
            </div>
            <div className="feat">
              <div className="feat-icon" aria-hidden="true">
                3️⃣
              </div>
              <h3>Administrar — depois</h3>
              <p>
                Histórico de cobranças, conciliação para a contabilidade, webhook para o seu
                sistema. A parte que roda em servidor e por isso é a parte paga.
              </p>
            </div>
          </div>

          <p className="why-block">
            Por que nessa ordem: aceitar é o único passo que dá para entregar sem servidor,
            sem licença e sem pedir confiança a ninguém — então vai na frente e vai de
            graça. Converter depende de parceria regulada, e parceria só se fecha com fluxo
            para mostrar. Administrar só faz sentido com volume para administrar.
          </p>
        </div>
      </section>

      <section id="estado">
        <div className="wrap">
          <span className="eyebrow">Sem enfeite</span>
          <h2 className="h2">Onde isso está de verdade</h2>
          <p className="lede" style={{ marginBottom: 32 }}>
            A seção acima diz para onde o Aros vai. Esta diz onde ele está hoje, em 31 de
            agosto de 2026. Não são a mesma coisa, e produto novo raramente admite isso.
          </p>

          <div className="honest">
            <div className="honest-col">
              <h3>Funciona e está testado</h3>
              <ul className="honest-list">
                <li>
                  <span className="m ok">✓</span>
                  <span>
                    Fluxo de pagamento completo
                    <small>montar cobrança, abrir carteira, confirmar na chain</small>
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
                    Ninguém usa em produção
                    <small>você seria o primeiro, e isso tem os riscos que tem</small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Sem parceiro de conversão fechado
                    <small>a camada 2 não tem contrato nem integração ainda</small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Nada disso é orientação jurídica
                    <small>as alíquotas citadas precisam do seu contador, não da nossa palavra</small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Sem painel de cobranças
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
            Ela roda no navegador de quem paga e o código é aberto — cobrar por ela seria
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
                  <span className="m">✓</span> Botão de cobrança em USDC
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
                  <span className="m">✓</span> Sem limite de valor ou de volume
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
                  <span className="m">·</span> Conversão para reais via parceiro licenciado
                </li>
                <li>
                  <span className="m">·</span> Painel com histórico de cobranças
                </li>
                <li>
                  <span className="m">·</span> Webhook para o seu sistema
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
          <h2 className="h2">As perguntas que aparecem primeiro</h2>

          <div className="faq" style={{ marginTop: 26 }}>
            <details className="q">
              <summary>Como eu transformo isso em reais na minha conta?</summary>
              <p>
                Hoje, por sua conta: o USDC chega na carteira que você configurou e a
                conversão é um passo manual, numa corretora ou serviço de câmbio. Converter
                stablecoin em real exige autorização do Banco Central, então essa camada só
                existe via parceiro licenciado — e o Aros ainda não fechou nenhum. É a maior
                pendência do produto, e está dita aqui em vez de omitida porque é a primeira
                pergunta que qualquer um faz.
              </p>
            </details>
            <details className="q">
              <summary>Isso é legal? E quanto de imposto eu pago?</summary>
              <p>
                Receber do exterior e converter por um parceiro autorizado é caminho
                estabelecido, e o IOF de entrada é de 0,38% — costumando ficar zerado quando
                a operação é exportação de serviços. Já liquidar venda doméstica em ativo
                virtual é terreno que a Resolução BCB 561 restringiu a partir de outubro de
                2026. Nada disso é orientação jurídica: são pontos para você levar ao seu
                contador antes de cobrar o primeiro cliente.
              </p>
            </details>
            <details className="q">
              <summary>Meu cliente precisa entender de cripto?</summary>
              <p>
                Ele precisa ter uma carteira e USDC. Para quem já paga fornecedor em
                stablecoin isso é rotina; para quem nunca usou, é uma barreira real e vale
                oferecer também um meio tradicional. O Aros não substitui seus outros meios
                de cobrança — ele adiciona um que não cobra pedágio.
              </p>
            </details>
            <details className="q">
              <summary>E se o cliente fechar a aba no meio do pagamento?</summary>
              <p>
                O pagamento confirma na blockchain de qualquer forma — não depende da aba
                estar aberta. O que se perde é a tela de confirmação. O link do recibo
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
                Você continua recebendo. O código é MIT e roda inteiro no navegador de quem
                paga, conversando direto com a rede Base. Não há licença para expirar nem
                serviço para desligar.
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
              A loja de demonstração roda em Base Sepolia. Dá para completar uma cobrança
              inteira, receber o comprovante e conferir na blockchain sem gastar nada.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="/loja">
                Abrir a demonstração
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
          <span>Aceitação de stablecoin para quem fatura de fora</span>
          <span className="sep">
            <a href={REPO}>GitHub</a>
          </span>
          <a href="/loja">Demonstração</a>
        </div>
      </footer>
    </>
  );
}
