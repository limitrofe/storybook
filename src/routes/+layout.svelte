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
    position: fixed; /* Fica fixo na tela ao rolar */
    top: 1rem;
    right: 1rem;
    z-index: 9999; /* Garante que ele fique na frente de tudo */
  }

  /* Esta é a única regra de estilo que realmente PRECISA estar aqui.
    Ela garante que o tema selecionado seja aplicado ao fundo e à fonte
    de todo o site.
  */
  :global(body) {
    background-color: var(--color-background);
    color: var(--color-text);
    font-family: 'Globotipo', -apple-system, sans-serif;
    margin: 0;
    transition: background-color 0.2s, color 0.2s;
  }
</style>