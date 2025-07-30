<script>
  import { onMount } from 'svelte';
  import '../app.css';
  import '../lib/styles/tokens.css';
  import '../lib/styles/themes.css';
  
  // ✅ 1. Importando as actions do seu store
  import { storyActions } from '$lib/stores/storyStores.js';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

  // ✅ 2. Ao carregar o layout, verificamos se há um tema salvo
  onMount(() => {
    const savedTheme = localStorage.getItem('story-theme') || 'default';
    storyActions.setTheme(savedTheme);
  });
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

  /* Seus estilos globais foram mantidos */
  :global(html) {
    background-color: var(--color-background);
    transition: background-color 0.2s;
  }

  :global(body) {
    background-color: var(--color-background);
    color: var(--color-text);
    font-family: 'Globotipo', -apple-system, sans-serif;
    margin: 0;
    min-height: 100vh;
    transition: background-color 0.2s, color 0.2s;
  }
</style>