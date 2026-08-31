import { useEffect, useRef, useState } from 'react';

/**
 * Card com inclinacao 3D e reflexo seguindo o cursor.
 *
 * Portado do card da secao "Escolha como quer usar" do Sizr. A inclinacao nao
 * segue o mouse direto: um sistema massa-mola persegue a posicao do ponteiro,
 * o que da o balanco de volta ao centro quando o cursor sai, em vez do card
 * voltar seco.
 *
 * Duas coisas que valem entender antes de mexer:
 *
 * - O rAF morre sozinho. Quando o alvo e o centro e tanto posicao quanto
 *   velocidade estao abaixo de REPOUSO, o loop simplesmente nao se reagenda.
 *   Sem isso, dois cards ficariam animando a pagina inteira em repouso.
 * - prefers-reduced-motion sai antes de registrar qualquer listener. Card
 *   girando sob o cursor e exatamente o tipo de movimento que essa
 *   preferencia existe para desligar.
 */

const RIGIDEZ = 100;
const AMORTECIMENTO = 10;
const MASSA = 1;
const REPOUSO = 4e-4;
/** Passo maximo por quadro: sem isso, voltar de outra aba daria um salto. */
const DT_MAX = 0.032;

export interface TiltCardProps {
  /** Graus de inclinacao no maximo do deslocamento. */
  rotacao?: number;
  /** Pixels de deslocamento lateral no maximo. */
  deslocamento?: number;
  /** Intensidade do reflexo, de 0 a 1. */
  brilho?: number;
  className?: string;
  children?: React.ReactNode;
}

export function TiltCard({
  rotacao = 17.5,
  deslocamento = 20,
  brilho = 0.4,
  className,
  children,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const alvo = useRef({ x: 0, y: 0 });
  const [sobre, setSobre] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let ultimo = performance.now();
    let raf = 0;

    function quadro(agora: number) {
      const dt = Math.min((agora - ultimo) / 1000, DT_MAX);
      ultimo = agora;

      for (const eixo of ['x', 'y'] as const) {
        const forca =
          (-RIGIDEZ * (pos[eixo] - alvo.current[eixo]) - AMORTECIMENTO * vel[eixo]) / MASSA;
        vel[eixo] += forca * dt;
        pos[eixo] += vel[eixo] * dt;
      }

      const s = el!.style;
      s.setProperty('--rx', `${-pos.y * rotacao * 2}deg`);
      s.setProperty('--ry', `${pos.x * rotacao * -2}deg`);
      s.setProperty('--tx', `${pos.x * deslocamento * 2}px`);
      s.setProperty('--ty', `${-pos.y * deslocamento * 2}px`);
      s.setProperty('--gx', `${50 + pos.x * 100}%`);
      s.setProperty('--gy', `${50 + pos.y * 100}%`);

      const parado =
        alvo.current.x === 0 &&
        alvo.current.y === 0 &&
        Math.abs(pos.x) < REPOUSO &&
        Math.abs(pos.y) < REPOUSO &&
        Math.abs(vel.x) < REPOUSO &&
        Math.abs(vel.y) < REPOUSO;

      if (parado) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(quadro);
    }

    const acorda = () => {
      if (!raf) {
        ultimo = performance.now();
        raf = requestAnimationFrame(quadro);
      }
    };

    const mover = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      alvo.current = {
        x: (ev.clientX - r.left) / r.width - 0.5,
        y: (ev.clientY - r.top) / r.height - 0.5,
      };
      acorda();
    };
    const sair = () => {
      alvo.current = { x: 0, y: 0 };
      acorda();
    };

    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerleave', sair);
    return () => {
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerleave', sair);
      cancelAnimationFrame(raf);
    };
  }, [rotacao, deslocamento]);

  return (
    <div className={className ? `tilt ${className}` : 'tilt'} style={{ zIndex: sobre ? 10 : 0 }}>
      <div
        ref={ref}
        className="tilt-in"
        onPointerEnter={() => setSobre(true)}
        onPointerLeave={() => setSobre(false)}
        style={{
          transform: `rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateX(var(--tx, 0px)) translateY(var(--ty, 0px)) translateZ(${sobre ? 40 : 0}px) scale(${sobre ? 1.03 : 1})`,
        }}
      >
        {children}
        <div className="tilt-shine" aria-hidden="true" style={{ opacity: brilho }} />
      </div>
    </div>
  );
}
