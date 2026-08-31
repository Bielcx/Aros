import { useState } from 'react';
import { AroButton } from 'aros/react';
import { config } from './aros.config.js';
import { ClosingPlasma } from './ClosingPlasma.js';
import { NeonBorder } from './NeonBorder.js';
import { ScrollAssemble } from './ScrollAssemble.js';
import { TiltCard } from './TiltCard.js';

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

type Tab = 'react' | 'qualquer';

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
  qualquer: {
    label: 'Qualquer outro site',
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
      {/* Fundo da página inteira. Fica fixo atrás de tudo; o scrim escuro que
          o CSS põe por cima é o que mantém o texto legível. */}
      <ClosingPlasma
        className="page-bg"
        speed={0.45}
        turbulence={0.8}
        grain={0.4}
        sparkle={0.45}
        vignette={1.1}
        opacity={1}
      />

      <nav className="nav">
        <div className="wrap nav-in">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true" />
            Aros
          </a>

          <a className="gh" href={REPO} target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap hero-in">
          <div>
            <span className="pill">
              <span className="dot" aria-hidden="true" />
              Construindo em público · código aberto desde o primeiro commit
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
              <a className="btn btn-beam neon-wrap" href="#conta">
                Ver a conta
                <NeonBorder cor="#2f74ff" espessura={2} tamanhoArco={45} velocidade={14} />
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

              <div className="aro-slot">
                <AroButton config={heroConfig} />
              </div>

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
          <h2 className="h2">
            <ScrollAssemble texto="Isso não é sobre cripto." />{' '}
            <ScrollAssemble texto="É sobre quanto sobra." />
          </h2>
          <div style={{ height: 26 }} />

          <div className="versus">
            <TiltCard brilho={0.3}>
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
            </TiltCard>

            <TiltCard brilho={0.45}>
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
            </TiltCard>
          </div>

          <p className="why-block">
            O IOF de 0,38% é a alíquota de recebimento do exterior; na exportação de
            serviços a operação costuma ficar zerada. Isso vale para a conversão do valor
            recebido em reais, feita por um parceiro licenciado — não para a transferência
            em si, que acontece direto entre carteiras. Alíquota é assunto do seu contador,
            não nosso: os números estão aqui para você conferir, não para acreditar.
          </p>

        </div>
      </section>

      <section id="porque">
        <div className="wrap">
          <span className="eyebrow">A tese</span>
          <h2 className="h2">Por que exportação, e não a loja da esquina</h2>
          <p className="lede" style={{ marginBottom: 28 }}>
            O alvo mudou por leitura de regra, não por preferência de mercado.
          </p>

          <div className="grid-3">
            <div className="feat">
              <div className="feat-icon" aria-hidden="true">
                ⚖️
              </div>
              <h3>Converter é licença, não engenharia</h3>
              <p>
                As Resoluções BCB 519, 520 e 521 exigem VASP autorizado para trocar
                stablecoin por real. Ninguém constrói essa peça — integra com quem tem a
                licença.
              </p>
            </div>
            <div className="feat">
              <div className="feat-icon" aria-hidden="true">
                🚪
              </div>
              <h3>A 561 fechou a porta doméstica</h3>
              <p>
                Desde outubro de 2026, liquidar pagamento em ativo virtual dentro do país
                saiu da zona cinzenta. Quem montar aceitação para venda doméstica está
                construindo sobre isso.
              </p>
            </div>
            <div className="feat">
              <div className="feat-icon" aria-hidden="true">
                📐
              </div>
              <h3>O IOF depende da direção</h3>
              <p>
                Transferência a terceiros paga 3,5%. Recebimento do exterior, 0,38% — e
                exportação de serviços costuma zerar. A mesma tecnologia é cara de um lado
                e barata do outro.
              </p>
            </div>
          </div>

          <p className="why-block">
            Quem fatura de fora tem economia real, caminho legal batido e nenhum produto
            pensado para ele. Nada disto é orientação jurídica.
          </p>
        </div>
      </section>

      <section id="integrar">
        <div className="wrap">
          <span className="eyebrow">Integração</span>
          <h2 className="h2">Três linhas, no site que você já tem</h2>
          <p className="lede" style={{ marginBottom: 26 }}>
            Não é iframe nem redirecionamento: o botão é desenhado dentro do seu site.
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

          {tab === 'qualquer' ? (
            <p className="snippet-note">
              Tem bundler? <code>npm i aros</code> e importe de <code>'aros'</code> — mesma
              chamada, sem a URL.
            </p>
          ) : null}

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

          <div className="aside" style={{ borderLeftColor: 'var(--blue)' }}>
            <h3 style={{ color: 'var(--blue-lift)' }}>Não tem site? Manda um link.</h3>
            <p>
              Quem fatura por projeto não tem página de checkout — tem invoice. A cobrança
              inteira cabe numa URL, para colar num e-mail ou no WhatsApp:{' '}
              <code className="inline">/c?to=0xCarteira&amp;amount=1200&amp;ref=INV-042</code>.
              Mesmo fluxo, mesma confirmação automática, mesmo recibo.{' '}
              <a href="/c?to=0xFe21034794A5a574B94fE4fDfD16e005F1C96e51&amount=1200&ref=INV-042&name=Estúdio%20Cria&note=Identidade%20visual%20—%20parcela%202%20de%203">
                Ver uma cobrança de exemplo
              </a>
              .
            </p>
          </div>
        </div>
      </section>


      <section id="estado">
        <div className="wrap">
          <span className="eyebrow">Sem enfeite</span>
          <h2 className="h2">Onde isso está de verdade</h2>
          <p className="lede" style={{ marginBottom: 28 }}>
            Em 31 de agosto de 2026. Produto novo raramente admite esta parte.
          </p>

          <div className="honest">
            <div className="honest-col">
              <h3>Funciona e está testado</h3>
              <ul className="honest-list">
                <li>
                  <span className="m ok">✓</span>
                  <span>Fluxo de pagamento completo, da cobrança à confirmação on-chain</span>
                </li>
                <li>
                  <span className="m ok">✓</span>
                  <span>Botão em React e em HTML puro</span>
                </li>
                <li>
                  <span className="m ok">✓</span>
                  <span>Recibo que se reconfere on-chain a cada abertura</span>
                </li>
                <li>
                  <span className="m ok">✓</span>
                  <span>Cobrança por link, para quem não tem checkout</span>
                </li>
                <li>
                  <span className="m ok">✓</span>
                  <span>Atribuição ERC-8021 reconhecida pela Base</span>
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
                    <small>
                      os testes provam a lógica, não a carteira do mundo real.
                      <b> Próximo: primeira transação em mainnet.</b>
                    </small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Ninguém usa em produção
                    <small>
                      você seria o primeiro, e isso tem os riscos que tem.
                      <b> Próximo: três cobranças reais com quem já fatura em dólar.</b>
                    </small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Sem parceiro de conversão fechado
                    <small>
                      a camada 2 não tem contrato nem integração ainda.
                      <b> Próximo: conversa com VASP autorizado sob a Resolução 520.</b>
                    </small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Nada disso é orientação jurídica
                    <small>
                      as alíquotas vieram de fonte secundária, não do texto do BCB.
                      <b> Próximo: validar com advogado antes de cobrar alguém.</b>
                    </small>
                  </span>
                </li>
                <li>
                  <span className="m no">✕</span>
                  <span>
                    Sem painel de cobranças
                    <small>
                      a confirmação vive na tela e no link do recibo.
                      <b> Depois das três acima — não antes.</b>
                    </small>
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

      <section>
        <div className="wrap narrow">
          <span className="eyebrow">Dúvidas</span>
          <h2 className="h2">As quatro que aparecem primeiro</h2>

          <div className="faq" style={{ marginTop: 26 }}>
            <details className="q">
              <summary>Como eu transformo isso em reais na minha conta?</summary>
              <p>
                Hoje, por sua conta: o USDC chega na sua carteira e a conversão é um passo
                manual. Converter exige autorização do Banco Central, então essa camada só
                existe via parceiro licenciado — e o Aros ainda não fechou nenhum. É a maior
                pendência do produto.
              </p>
            </details>
            <details className="q">
              <summary>Isso é legal? E quanto de imposto eu pago?</summary>
              <p>
                Receber do exterior e converter por parceiro autorizado é caminho
                estabelecido: IOF de entrada de 0,38%, costumando zerar em exportação de
                serviços. Nada disso é orientação jurídica — leve ao seu contador antes de
                cobrar o primeiro cliente.
              </p>
            </details>
            <details className="q">
              <summary>E se eu vender para cliente aqui do Brasil?</summary>
              <p>
                O botão funciona igual e o kit é aberto. Mas aí a operação é doméstica
                liquidada em ativo virtual — o terreno que a Resolução BCB 561 restringiu
                desde outubro de 2026 — e o caminho de volta para reais fica bem menos
                claro. Converse com um contador antes.
              </p>
            </details>
            <details className="q">
              <summary>Vocês ficam com alguma porcentagem?</summary>
              <p>
                Não. O pagamento vai direto da carteira do cliente para a sua. Não existe
                servidor do Aros no caminho, então não haveria onde cobrar nem como segurar
                o dinheiro — e se o projeto for abandonado amanhã, você continua recebendo.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section id="quem">
        <div className="wrap">
          <span className="eyebrow">Quem está construindo</span>
          <h2 className="h2">Uma pessoa, em público, com prazo</h2>

          <div className="cols" style={{ marginTop: 22 }}>
            <div className="panel">
              <h3>O que já foi decidido aqui</h3>
              <ul className="items">
                <li>
                  <span className="mark ok">✓</span>
                  <span className="body">
                    Confirmação sem varrer a chain
                    <span>
                      <code>transfer</code> de ERC-20 não carrega memo, então o hash do
                      userOp virou a referência
                    </span>
                  </span>
                </li>
                <li>
                  <span className="mark ok">✓</span>
                  <span className="body">
                    285 KB → 67 KB de primeira carga
                    <span>o SDK de 1 MB só desce no clique, não em toda visita</span>
                  </span>
                </li>
                <li>
                  <span className="mark ok">✓</span>
                  <span className="body">
                    O alvo mudou por leitura de regra
                    <span>e a leitura veio antes do código</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="panel">
              <h3>Como falar comigo</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginBottom: 16 }}>
                Se você fatura de fora e topa testar uma cobrança real, é com você que eu
                preciso falar. E também com quem acha que isso não resolve nada.
              </p>
              <ul className="items">
                <li>
                  <span className="mark ok">→</span>
                  <span className="body">
                    <a href={REPO}>github.com/Bielcx/Aros</a>
                    <span>issues abertas, e o histórico de decisões nos commits</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="cta">
            <div className="cta-inner">
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
