// svelte.config.js - Versão Simples para Static Hosting
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null,
      precompress: false
    }),
    
    // 🎯 CORREÇÃO: URLs relativas (mais compatível)
    paths: {
      base: '',
      assets: ''
    },
    
    prerender: {
      handleHttpError: 'warn',
      handleMissingId: 'warn'
    }
  }
};

export default config;