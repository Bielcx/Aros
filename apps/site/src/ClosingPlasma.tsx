import { useEffect, useMemo, useRef } from 'react';

/**
 * Plasma em WebGL para o bloco de fechamento.
 *
 * Adaptado de componentry.dev/docs/components/closing-plasma. O shader esta
 * intacto; o que mudou e a embalagem, porque o original assume Next, Tailwind
 * e um helper `cn` que nao existem aqui.
 *
 * Duas coisas foram acrescentadas, e nao sao enfeite:
 *
 * - Pausa quando sai da tela. O componente vive no rodape; sem isso ele
 *   ficaria rodando requestAnimationFrame com shader de cinco oitavas de FBM
 *   o tempo inteiro em que a pessoa le o topo da pagina, queimando bateria de
 *   celular para desenhar algo que ninguem esta vendo.
 * - Respeita prefers-reduced-motion: desenha um quadro parado e para. Quem
 *   pediu menos movimento nao quer plasma ondulando atras do texto.
 */

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_isDark;
uniform float u_speed;
uniform float u_turbulence;
uniform float u_mouseInfluence;
uniform float u_grain;
uniform float u_sparkle;
uniform float u_vignette;
uniform float u_opacity;

uniform vec3 u_darkA;
uniform vec3 u_darkB;
uniform vec3 u_darkC;
uniform vec3 u_lightA;
uniform vec3 u_lightB;
uniform vec3 u_lightC;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p, float turbulence) {
  float total = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  mat2 rot = mat2(cos(0.45), sin(0.45), -sin(0.45), cos(0.45));
  for (int i = 0; i < 5; i++) {
    total += snoise(p * freq) * amp;
    p = rot * p;
    freq *= mix(1.85, 2.35, clamp(turbulence, 0.0, 2.0) * 0.5);
    amp *= 0.5;
  }
  return total;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = u_time * (0.15 * u_speed);

  vec2 mouse = (u_mouse - 0.5) * vec2(aspect, 1.0);
  float dMouse = length(p - mouse);
  p += (mouse - p) * 0.02 * u_mouseInfluence * smoothstep(0.45, 0.0, dMouse);

  vec2 flow = vec2(
    fbm(p + vec2(t * 0.2, t * 0.1), u_turbulence),
    fbm(p + vec2(-t * 0.1, t * 0.3), u_turbulence)
  );

  float n = fbm(p * 2.0 + flow * 1.45, u_turbulence);
  float ridges = 1.0 - abs(snoise(p * 4.0 + n) * 2.0);
  ridges = pow(ridges, 3.0);

  vec3 colorA = mix(u_lightA, u_darkA, u_isDark);
  vec3 colorB = mix(u_lightB, u_darkB, u_isDark);
  vec3 colorC = mix(u_lightC, u_darkC, u_isDark);

  vec3 col = mix(colorA, colorB, smoothstep(-0.5, 0.5, n));
  col = mix(col, colorC, smoothstep(0.25, 1.0, n * 0.52 + ridges * 0.48));

  float sparkle = pow(max(0.0, snoise(gl_FragCoord.xy * 0.2 + t * 2.0)), 18.0) * 0.5 * u_sparkle;
  vec3 sparkleColor = mix(vec3(0.56, 0.58, 0.72), vec3(0.8, 0.9, 1.0), u_isDark);
  col += sparkleColor * sparkle;

  float vigDark = 1.0 - smoothstep(0.5, mix(1.8, 1.55, u_isDark), length(p));
  col = mix(col, col * vigDark, u_isDark * u_vignette);
  float vigLight = 1.0 - smoothstep(0.4, 1.45, length(p));
  col = mix(mix(vec3(1.0), col, vigLight), col, u_isDark);

  float grain = (fract(sin(dot(gl_FragCoord.xy + t * 50.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * (0.06 * u_grain);
  col += grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), u_opacity);
}
`;

const HEX_COLOR_REGEX = /^#?[0-9a-fA-F]{6}$/;

function sanitizeHexColor(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!HEX_COLOR_REGEX.test(trimmed)) return fallback;
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function hexToRgb01(hex: string, fallback: string): [number, number, number] {
  const normalized = sanitizeHexColor(hex, fallback).replace('#', '');
  return [
    parseInt(normalized.slice(0, 2), 16) / 255,
    parseInt(normalized.slice(2, 4), 16) / 255,
    parseInt(normalized.slice(4, 6), 16) / 255,
  ];
}

/* Paleta do Aros no lugar do azul-ardosia original: o fundo da pagina, um
   azul profundo no meio e o azul da Base no realce. */
const DARK_A = '#08090c';
const DARK_B = '#0d1b3d';
const DARK_C = '#2f74ff';
const LIGHT_A = '#f0f2f7';
const LIGHT_B = '#d7dceb';
const LIGHT_C = '#bcc5e0';

export interface ClosingPlasmaProps {
  themeMode?: 'auto' | 'light' | 'dark';
  speed?: number;
  turbulence?: number;
  mouseInfluence?: number;
  grain?: number;
  sparkle?: number;
  vignette?: number;
  opacity?: number;
  interactive?: boolean;
  darkColorA?: string;
  darkColorB?: string;
  darkColorC?: string;
  lightColorA?: string;
  lightColorB?: string;
  lightColorC?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ClosingPlasma({
  themeMode = 'dark',
  speed = 1,
  turbulence = 1,
  mouseInfluence = 1,
  grain = 1,
  sparkle = 1,
  vignette = 1,
  opacity = 1,
  interactive = true,
  darkColorA = DARK_A,
  darkColorB = DARK_B,
  darkColorC = DARK_C,
  lightColorA = LIGHT_A,
  lightColorB = LIGHT_B,
  lightColorC = LIGHT_C,
  className,
  children,
}: ClosingPlasmaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const isDarkRef = useRef(themeMode === 'light' ? 0 : 1);

  const settings = useMemo(
    () => ({
      speed,
      turbulence,
      mouseInfluence,
      grain,
      sparkle,
      vignette,
      opacity,
      interactive,
      darkColorA,
      darkColorB,
      darkColorC,
      lightColorA,
      lightColorB,
      lightColorC,
    }),
    [
      speed,
      turbulence,
      mouseInfluence,
      grain,
      sparkle,
      vignette,
      opacity,
      interactive,
      darkColorA,
      darkColorB,
      darkColorC,
      lightColorA,
      lightColorB,
      lightColorC,
    ],
  );

  useEffect(() => {
    /* O site inteiro e escuro; o modo "auto" so existe para quem reaproveitar
       este arquivo num tema claro. */
    isDarkRef.current =
      themeMode === 'light'
        ? 0
        : themeMode === 'dark'
          ? 1
          : document.documentElement.classList.contains('dark')
            ? 1
            : 0;
  }, [themeMode]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    /* Ouve no window, nao no proprio elemento. Como fundo de pagina ele fica
       atras de tudo e com pointer-events: none, entao nunca receberia evento
       proprio -- e as coordenadas continuam sendo calculadas em relacao ao
       retangulo dele, o que funciona igual nos dois usos. */
    const handlePointerMove = (event: PointerEvent) => {
      if (!settings.interactive) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetMouseRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: 1 - (event.clientY - rect.top) / rect.height,
      };
    };
    const handlePointerLeave = () => {
      targetMouseRef.current = { x: 0.5, y: 0.5 };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);

    const teardownListeners = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
    };

    const gl = canvas.getContext('webgl', { antialias: false, alpha: true });
    if (!gl) return teardownListeners;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return teardownListeners;

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return teardownListeners;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return teardownListeners;
    }

    gl.useProgram(program);

    const position = gl.getAttribLocation(program, 'position');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u('u_res');
    const uTime = u('u_time');
    const uMouse = u('u_mouse');
    const uIsDark = u('u_isDark');
    const uSpeed = u('u_speed');
    const uTurbulence = u('u_turbulence');
    const uMouseInfluence = u('u_mouseInfluence');
    const uGrain = u('u_grain');
    const uSparkle = u('u_sparkle');
    const uVignette = u('u_vignette');
    const uOpacity = u('u_opacity');

    const dispose = () => {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };

    const setColor = (name: string, hex: string, fallback: string) => {
      const loc = u(name);
      const [r, g, b] = hexToRgb01(hex, fallback);
      gl.uniform3f(loc, r, g, b);
    };
    setColor('u_darkA', settings.darkColorA, DARK_A);
    setColor('u_darkB', settings.darkColorB, DARK_B);
    setColor('u_darkC', settings.darkColorC, DARK_C);
    setColor('u_lightA', settings.lightColorA, LIGHT_A);
    setColor('u_lightB', settings.lightColorB, LIGHT_B);
    setColor('u_lightC', settings.lightColorC, LIGHT_C);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const { width, height } = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const start = performance.now();
    let rafId = 0;

    const draw = (elapsed: number) => {
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uIsDark, isDarkRef.current);
      gl.uniform1f(uSpeed, settings.speed);
      gl.uniform1f(uTurbulence, settings.turbulence);
      gl.uniform1f(uMouseInfluence, settings.mouseInfluence);
      gl.uniform1f(uGrain, settings.grain);
      gl.uniform1f(uSparkle, settings.sparkle);
      gl.uniform1f(uVignette, settings.vignette);
      gl.uniform1f(uOpacity, settings.opacity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      // Um quadro e pronto: a textura fica, o movimento nao.
      draw(0);
      return () => {
        teardownListeners();
        resizeObserver.disconnect();
        dispose();
      };
    }

    const render = (now: number) => {
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;
      draw((now - start) / 1000);
      rafId = requestAnimationFrame(render);
    };

    const play = () => {
      if (!rafId) rafId = requestAnimationFrame(render);
    };
    const pause = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    /* Duas razoes para parar de desenhar, e as duas importam mais agora que
       ele cobre a viewport inteira em vez de um bloco no rodape:

       - fora da tela (so acontece no uso em bloco);
       - aba em segundo plano. Sem isto o shader continua rodando enquanto a
         pessoa trabalha em outra aba. O navegador ja estrangula o rAF em
         aba oculta, mas nao garante parar -- e um fundo de pagina fica vivo
         a sessao inteira, nao alguns segundos. */
    const onVisibility = () => {
      if (document.hidden) pause();
      else play();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !document.hidden) play();
        else pause();
      },
      { rootMargin: '120px' },
    );
    visibility.observe(container);

    return () => {
      teardownListeners();
      document.removeEventListener('visibilitychange', onVisibility);
      pause();
      visibility.disconnect();
      resizeObserver.disconnect();
      dispose();
    };
  }, [settings]);

  return (
    <div ref={containerRef} className={className ? `plasma ${className}` : 'plasma'}>
      <canvas ref={canvasRef} aria-hidden="true" className="plasma-canvas" />
      {children ? <div className="plasma-content">{children}</div> : null}
    </div>
  );
}

export default ClosingPlasma;
