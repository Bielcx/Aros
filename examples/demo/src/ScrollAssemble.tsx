import { useEffect, useRef } from 'react';

/**
 * Titulo que se monta conforme a pagina rola.
 *
 * Portado do Skiper31: cada caractere comeca deslocado na horizontal e
 * girado, proporcionalmente a distancia dele do centro da frase, e converge
 * para o lugar conforme o bloco sobe na tela. As pontas viajam muito, o
 * miolo quase nao se mexe -- e isso que da a sensacao de a frase se fechar.
 *
 * O original usa framer-motion para o useScroll e lenis para a rolagem
 * suave. Aqui nao: sao duas dependencias somando dezenas de KB para uma
 * conta de tres linhas. O progresso sai de getBoundingClientRect e as
 * transformacoes vao direto no style de cada span.
 *
 * Tambem nao usa a secao de 210vh do original. Ela existe la para dar
 * espaco de rolagem ao efeito; aqui o efeito se resolve no trecho em que o
 * titulo sobe pela tela, sem esticar a pagina.
 */

/** Distancia horizontal, em px, que o caractere mais externo percorre. */
const ESPALHAMENTO = 34;
/** Giro, em graus, na mesma proporcao. */
const GIRO = 42;

export interface ScrollAssembleProps {
  texto: string;
  className?: string;
}

export function ScrollAssemble({ texto, className }: ScrollAssembleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const chars = [...texto];
  const centro = (chars.length - 1) / 2;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const spans = Array.from(el.querySelectorAll<HTMLElement>('[data-ch]'));
    let raf = 0;
    let ligado = false;

    const aplica = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const alvo = window.innerHeight * 0.62;
      /* 0 quando o titulo entra por baixo, 1 quando chega na altura de
         leitura. Antes disso fica em 0, depois trava em 1 -- rolar de volta
         desmonta a frase, que e o que o original faz. */
      const bruto = (window.innerHeight - r.top) / (window.innerHeight - alvo + r.height);
      const p = Math.max(0, Math.min(1, bruto));
      const resta = 1 - p;

      for (const s of spans) {
        const d = Number(s.dataset['ch']) - centro;
        const norm = centro === 0 ? 0 : d / centro;
        s.style.transform = `translateX(${norm * ESPALHAMENTO * resta}px) rotateY(${norm * GIRO * resta}deg)`;
        s.style.opacity = String(0.35 + 0.65 * p);
      }
    };

    const agenda = () => {
      if (!raf) raf = requestAnimationFrame(aplica);
    };

    /* So escuta rolagem enquanto o titulo esta por perto. Um listener de
       scroll por titulo, vivo a pagina inteira, e desperdicio. */
    const io = new IntersectionObserver(
      ([e]) => {
        const dentro = !!e?.isIntersecting;
        if (dentro === ligado) return;
        ligado = dentro;
        if (dentro) {
          window.addEventListener('scroll', agenda, { passive: true });
          agenda();
        } else {
          window.removeEventListener('scroll', agenda);
        }
      },
      { rootMargin: '20% 0px' },
    );
    io.observe(el);
    aplica();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', agenda);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [texto, centro]);

  return (
    <span ref={ref} className={className ? `assemble ${className}` : 'assemble'}>
      {chars.map((c, i) => (
        <span
          key={`${c}-${i}`}
          data-ch={i}
          aria-hidden="true"
          className={c === ' ' ? 'assemble-ch assemble-sp' : 'assemble-ch'}
        >
          {c === ' ' ? ' ' : c}
        </span>
      ))}
      {/* O texto so para leitor de tela: a versao visivel esta picada em
          spans, que viraria uma letra por vez na leitura. */}
      <span className="sr">{texto}</span>
    </span>
  );
}
