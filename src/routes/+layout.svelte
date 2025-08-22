<script>
  // Carrega todos os estilos globais e de temas
  import '../app.css';
  import '$lib/styles/tokens.css';
  import '$lib/styles/themes.css';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  import { onMount } from 'svelte';
  
  // 🎯 CONFIGURAÇÃO CONDICIONAL
  // Para desenvolvimento: mostra seletor
  // Para produção: tema fixo "dias-perfeitos"
  const isProduction = false; // 👈 MUDANÇA AQUI: false = desenvolvimento
  const TEMA_FIXO = 'dias-perfeitos';

  onMount(() => {
    if (isProduction) {
      // Em produção: aplica tema fixo
      document.documentElement.setAttribute('data-theme', TEMA_FIXO);
      console.log('🎨 Produção: Tema "Dias Perfeitos" aplicado automaticamente');
    } else {
      console.log('🛠️ Desenvolvimento: Seletor de tema disponível');
    }
  });
</script>

<!-- Mostra seletor apenas em desenvolvimento -->
{#if !isProduction}
  <div class="persistent-theme-switcher">
    <ThemeSwitcher />
  </div>
{/if}

<slot />

<style>
  .persistent-theme-switcher {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
  }

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
    min-height: 100vh;
    transition: background-color 0.2s, color 0.2s;
  }
</style>