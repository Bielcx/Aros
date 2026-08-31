import type { Plugin } from 'esbuild';
import { defineConfig } from 'tsup';

/**
 * O @coinbase/cdp-sdk, que vem junto com o SDK da Base, importa @x402/*
 * em caminhos de assinatura que so rodam no servidor. Esses pacotes nao
 * sao instalados e o navegador nunca chega neles, mas o bundler tenta
 * resolver mesmo assim. Trocamos por um modulo CommonJS vazio: como CJS
 * tem exports dinamicos, os imports nomeados nao viram erro de build.
 */
const stubServerOnlyDeps: Plugin = {
  name: 'aros-stub-x402',
  setup(build) {
    build.onResolve({ filter: /^@x402(\/|$)/ }, (args) => ({
      path: args.path,
      namespace: 'aros-stub',
    }));
    build.onLoad({ filter: /.*/, namespace: 'aros-stub' }, () => ({
      contents: 'module.exports = {};',
      loader: 'js',
    }));
  },
};

export default defineConfig([
  // Pacote para bundlers (React e JS moderno).
  {
    entry: { index: 'src/index.ts', react: 'src/react/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  // Build para uso direto no navegador, sem bundler.
  // ESM com splitting: o SDK da Base fica num arquivo a parte e so e
  // baixado no clique. Em IIFE isso seria impossivel e o lojista pagaria
  // mais de 1 MB em toda visita.
  {
    entry: { aros: 'src/vanilla/global.ts' },
    format: ['esm'],
    splitting: true,
    minify: true,
    sourcemap: true,
    dts: false,
    clean: false,
    outDir: 'dist/browser',
    platform: 'browser',
    // Sem bundler do lado do lojista, nada resolve "@base-org/account".
    // noExternal obriga o tsup a embutir tudo -- e o splitting joga o SDK
    // num arquivo separado, carregado so no clique.
    noExternal: [/.*/],
    esbuildPlugins: [stubServerOnlyDeps],
  },
]);
