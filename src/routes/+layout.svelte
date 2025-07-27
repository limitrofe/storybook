<script>
  // Carrega todos os estilos globais e de temas
  import '../app.css';
  import '../lib/styles/tokens.css';
  import '../lib/styles/themes.css';
  // Importa o seletor de temas
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
</script>

<div class="persistent-theme-switcher">
  <ThemeSwitcher />
</div>

<slot />


<style>
  .persistent-theme-switcher {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
  }

  /* ▼▼▼ INÍCIO DA CORREÇÃO ▼▼▼ */

  /* Garante que a raiz do documento também receba a cor do tema */
  :global(html) {
    background-color: var(--color-background);
    transition: background-color 0.2s;
  }

  :global(body) {
    background-color: var(--color-background);
    color: var(--color-text);
    font-family: 'Globotipo', -apple-system, sans-serif;
    margin: 0;
    min-height: 100vh; /* Garante que o body ocupe no mínimo a altura total da tela */
    transition: background-color 0.2s, color 0.2s;
  }
  
  /* ▲▲▲ FIM DA CORREÇÃO ▲▲▲ */
</style>