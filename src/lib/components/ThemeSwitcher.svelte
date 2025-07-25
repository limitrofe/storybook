<script>
  import { onMount } from 'svelte';

  let selectedTheme = 'default';

  onMount(() => {
    // Pega o tema salvo no localStorage ou usa o padrão
    selectedTheme = localStorage.getItem('theme') || 'default';
    document.documentElement.setAttribute('data-theme', selectedTheme);
  });

  function switchTheme(event) {
    selectedTheme = event.currentTarget.value;
    document.documentElement.setAttribute('data-theme', selectedTheme);
    // Salva a escolha do usuário
    localStorage.setItem('theme', selectedTheme);
  }
</script>

<div class="theme-switcher">
  <label for="theme-select">Tema:</label>
  <select id="theme-select" on:change={switchTheme} bind:value={selectedTheme}>
    <option value="default">Padrão Claro</option>
    <option value="dark">Padrão Escuro</option>
    <option value="mundo-light">Mundo (Claro)</option>
    <option value="mundo-dark">Mundo (Escuro)</option>
    <option value="economia">Economia</option>
    <option value="tecnologia">Tecnologia</option>
    <option value="natureza">Natureza</option>
    <option value="pop-art">Pop & Art</option>
    <option value="alto-contraste">Alto Contraste</option>
    <option value="bem-estar">Bem-estar</option>
  </select>
</div>

<style>
  .theme-switcher {
    padding: 1rem;
    text-align: center;
    background-color: var(--color-highlight-bg);
  }
  label {
    margin-right: 0.5rem;
    color: var(--color-subtle-text);
  }
  select {
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    background-color: var(--color-background);
    color: var(--color-text);
    border-radius: 4px;
  }
</style>