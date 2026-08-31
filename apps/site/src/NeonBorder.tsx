import { useEffect, useRef, useState } from 'react';

/**
 * Neon Border, do Originkit.
 *
 * Dois arcos de luz percorrem o perimetro em lados opostos. Cada arco e um
 * conic-gradient construido a mao: a funcao buildArc anda pelo retangulo,
 * mede o angulo de cada amostra a partir do centro e monta as paradas do
 * gradiente com o desvanecimento nas pontas. E por isso que o arco acompanha
 * o formato do elemento em vez de girar como um circulo dentro dele.
 *
 * A mascara (BANDA) recorta tudo num anel: duas linears compostas com
 * exclude deixam so a moldura. Sobre ela vao tres copias borradas em
 * plus-lighter, que sao o brilho.
 *
 * O movimento nao e linear: o arco vai de canto a canto com easing, entao
 * ele acelera nas retas e freia nas quinas.
 *
 * Acrescentado ao original: pausa quando sai da tela e quando a aba vai para
 * segundo plano, e respeito a prefers-reduced-motion -- sao tres arcos com
 * blur rodando em requestAnimationFrame, caro demais para ficar vivo atras
 * de um botao que ninguem esta olhando.
 */

type Movimento = 'continuous' | 'step';

const COPIAS_BORDA = 2;
const CAMADAS_BRILHO = [
  { blur: 8, opacity: 0.5, reach: 0.3 },
  { blur: 15, opacity: 0.3, reach: 0.6 },
  { blur: 57, opacity: 0.18, reach: 1 },
];
const BLUR_MAX = Math.max(...CAMADAS_BRILHO.map((l) => l.blur));
const ALCANCE_MAX = 36;

function comAlfa(entrada: string, alfa: number) {
  const a = Math.max(0, Math.min(1, alfa));
  const hex = entrada.trim().match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let x = hex[1] as string;
    if (x.length === 3 || x.length === 4) {
      x = x
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const n = parseInt(x.slice(0, 6), 16);
    if (!Number.isFinite(n)) return `rgba(0,0,0,${a})`;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  return `rgba(0,0,0,${a})`;
}

function pontoPerimetro(u: number, w: number, h: number): [number, number] {
  const d = (((u % 1) + 1) % 1) * 2 * (w + h);
  if (d < w) return [d, 0];
  if (d < w + h) return [w, d - w];
  if (d < w * 2 + h) return [w - (d - w - h), h];
  return [0, h - (d - w * 2 - h)];
}

function voltaDoCanto(k: number, w: number, h: number) {
  const p = 2 * (w + h);
  const em = [0, w / p, (w + h) / p, (w * 2 + h) / p];
  return Math.floor(k / 4) + (em[((k % 4) + 4) % 4] as number);
}

function anguloPerimetro(u: number, w: number, h: number) {
  const [x, y] = pontoPerimetro(u, w, h);
  return (Math.atan2(x - w / 2, h / 2 - y) * 180) / Math.PI;
}

const AMOSTRAS = 24;
const ARCO_MIN = 0.015;

function montaArco(volta: number, tamanhoPct: number, w: number, h: number, cor: string) {
  const fw = w > 0 ? w : 100;
  const fh = h > 0 ? h : 100;
  const tam = Math.max(0, Math.min(100, tamanhoPct));
  const span = Math.max(ARCO_MIN, (tam / 100) * 0.5);
  const solido = tam / 100;

  const paradas: string[] = [];
  let base = 0;
  let acc = 0;
  let anterior = 0;

  for (let i = 0; i <= AMOSTRAS; i++) {
    const fr = i / AMOSTRAS;
    const ang = anguloPerimetro(volta + (fr - 0.5) * span, fw, fh);
    if (i === 0) base = ang;
    else {
      let d = ang - anterior;
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      acc += d;
    }
    anterior = ang;

    const t = Math.abs(fr - 0.5) * 2;
    const k = solido >= 1 ? 1 : t <= solido ? 1 : 1 - (t - solido) / (1 - solido);
    paradas.push(`${comAlfa(cor, k * k * (3 - 2 * k))} ${acc.toFixed(2)}deg`);
  }

  const fim = acc.toFixed(2);
  paradas.push(`${comAlfa(cor, 0)} ${fim}deg`);
  paradas.push(`${comAlfa(cor, 0)} 360deg`);
  return `conic-gradient(from ${base.toFixed(2)}deg at 50% 50%, ${paradas.join(', ')})`;
}

const CICLO_LENTO = 30;
const CICLO_RAPIDO = 4;
const PASSO_LENTO = 3;
const PASSO_RAPIDO = 0.35;

function fazEase(pts: number[]) {
  const [x1, y1, x2, y2] = pts as [number, number, number, number];
  const bez = (a: number, b: number, t: number) => {
    const u = 1 - t;
    return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
  };
  return (t: number) => {
    const x = Math.max(0, Math.min(1, t));
    let s = x;
    for (let i = 0; i < 8; i++) {
      const cx = bez(x1, x2, s) - x;
      const u = 1 - s;
      const dx = 3 * u * u * x1 + 6 * u * s * (x2 - x1) + 3 * s * s * (1 - x2);
      if (Math.abs(dx) < 1e-6) break;
      s = Math.max(0, Math.min(1, s - cx / dx));
    }
    return bez(y1, y2, s);
  };
}

const easePasso = fazEase([0.72, 0.16, 0.18, 1.05]);
const easeDeslize = fazEase([0.65, 0, 0.35, 1]);

const BANDA: React.CSSProperties = {
  WebkitMaskImage: 'linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)',
  WebkitMaskClip: 'content-box, border-box',
  WebkitMaskComposite: 'xor',
  maskImage: 'linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)',
  maskClip: 'content-box, border-box',
  maskComposite: 'exclude',
};

export interface NeonBorderProps {
  cor?: string;
  raio?: number;
  espessura?: number;
  tamanhoArco?: number;
  brilho?: number;
  movimento?: Movimento;
  velocidade?: number;
}

export function NeonBorder({
  cor = '#0E00FF',
  raio = 999,
  espessura = 2,
  tamanhoArco = 50,
  brilho = 100,
  movimento = 'continuous',
  velocidade = 16,
}: NeonBorderProps) {
  const raizRef = useRef<HTMLDivElement>(null);
  const grupoA = useRef<HTMLDivElement>(null);
  const grupoB = useRef<HTMLDivElement>(null);
  const tamRef = useRef({ w: 0, h: 0 });
  const [tam, setTam] = useState({ w: 0, h: 0 });

  const vivo = useRef({ velocidade, movimento, tamanhoArco, cor });
  vivo.current = { velocidade, movimento, tamanhoArco, cor };

  useEffect(() => {
    const el = raizRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width === tamRef.current.w && r.height === tamRef.current.h) return;
      tamRef.current = { w: r.width, h: r.height };
      setTam(tamRef.current);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = raizRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let ultimo = performance.now();
    let volta = 0;
    let canto = 0;
    let t = 0;

    const quadro = (agora: number) => {
      const dt = Math.min(0.05, Math.max(0, (agora - ultimo) / 1000));
      ultimo = agora;
      const p = vivo.current;
      const s = Math.max(0, Math.min(20, p.velocidade));

      if (s > 0) {
        const passo = p.movimento === 'step';
        const batida = passo
          ? PASSO_LENTO + ((PASSO_RAPIDO - PASSO_LENTO) * (s - 1)) / 19
          : (CICLO_LENTO + ((CICLO_RAPIDO - CICLO_LENTO) * (s - 1)) / 19) / 4;

        t += dt / batida;
        while (t >= 1) {
          t -= 1;
          canto += 1;
        }
        const suave = passo ? easePasso(Math.min(1, t * 2)) : easeDeslize(t);

        const { w, h } = tamRef.current;
        const fw = w > 0 ? w : 100;
        const fh = h > 0 ? h : 100;
        const de = voltaDoCanto(canto, fw, fh);
        const para = voltaDoCanto(canto + 1, fw, fh);
        volta = de + (para - de) * suave;

        grupoA.current?.style.setProperty('--arco', montaArco(volta, p.tamanhoArco, w, h, p.cor));
        grupoB.current?.style.setProperty(
          '--arco',
          montaArco(volta + 0.5, p.tamanhoArco, w, h, p.cor),
        );
      }
      raf = requestAnimationFrame(quadro);
    };

    const toca = () => {
      if (!raf) {
        ultimo = performance.now();
        raf = requestAnimationFrame(quadro);
      }
    };
    const para = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const naAba = () => (document.hidden ? para() : toca());
    document.addEventListener('visibilitychange', naAba);

    const naTela = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting && !document.hidden) toca();
      else para();
    });
    naTela.observe(el);

    return () => {
      document.removeEventListener('visibilitychange', naAba);
      naTela.disconnect();
      para();
    };
  }, []);

  const esp = Math.max(1, Math.min(10, espessura));
  const r = Math.min(raio, Math.min(tam.w, tam.h) / 2);
  const quanto = Math.max(0, Math.min(100, brilho)) / 100;
  const anelEm = (share: number) => esp + quanto * ALCANCE_MAX * share;
  const fora = 10 + ALCANCE_MAX + BLUR_MAX * 2;

  const banda = (rr: number, offset = 0) => (
    <div
      style={{
        position: 'absolute',
        inset: offset - rr,
        boxSizing: 'border-box',
        padding: rr,
        borderRadius: r > 0 ? r + rr : 0,
        background: 'var(--arco)',
        ...BANDA,
      }}
    />
  );

  const grupo = (inicio: number, ref: React.Ref<HTMLDivElement>) => (
    <div
      ref={ref}
      style={
        {
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
          pointerEvents: 'none',
          '--arco': montaArco(inicio, tamanhoArco, tam.w, tam.h, cor),
        } as React.CSSProperties
      }
    >
      {quanto > 0 &&
        CAMADAS_BRILHO.map((l, i) => (
          <div
            key={`b-${i}`}
            style={{
              position: 'absolute',
              inset: -fora,
              boxSizing: 'border-box',
              padding: fora,
              borderRadius: r > 0 ? r + fora : 0,
              opacity: l.opacity,
              mixBlendMode: 'plus-lighter',
              filter: `blur(${l.blur.toFixed(1)}px)`,
              ...BANDA,
            }}
          >
            {banda(anelEm(l.reach), fora)}
          </div>
        ))}
      {Array.from({ length: COPIAS_BORDA }).map((_, i) => (
        <div key={`e-${i}`} style={{ position: 'absolute', inset: 0, mixBlendMode: 'plus-lighter' }}>
          {banda(esp)}
        </div>
      ))}
    </div>
  );

  return (
    <div ref={raizRef} className="neon" aria-hidden="true">
      {grupo(0, grupoA)}
      {grupo(0.5, grupoB)}
    </div>
  );
}
