// svelte.config.js
import adapter from '@sveltejs/adapter-node'; // <-- Altere esta linha

const config = {
  kit: {
    adapter: adapter() // <-- Altere esta linha
  }
};

export default config;