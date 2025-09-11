<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import StoryRenderer from '$lib/components/StoryRenderer.svelte';

  // Variáveis de estado
  let currentStory = null;
  let loading = true;

  onMount(async () => {
    try {
const response = await fetch('/data/o-julgamento.json');
      if (response.ok) {
        currentStory = await response.json();
        console.log('📖 Story carregada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao carregar matéria:', error);
    }
    loading = false;
  });
</script>

<svelte:head>
  <title>{currentStory ? currentStory.title : 'O julgamento'}</title>
  {#if currentStory}
    <meta name="description" content={currentStory.subtitle || currentStory.intro?.text || 'O julgamento'} />
    <meta property="og:title" content={currentStory.title} />
    <meta property="og:description" content={currentStory.subtitle || 'Por X votos a X, 1 Turma do STF declarou ex-presidente e sete aliados culpados por tentativa de golpe. Veja sentenças de todos os réus e as justificativas dos ministros.'} />
    <meta property="og:type" content="article" />
    {#if currentStory.author}
      <meta name="author" content={currentStory.author} />
    {/if}
  {/if}
</svelte:head>

{#if loading}
  <div class="loading">
    <div class="spinner"></div>
    <p>Carregando...</p>
  </div>
{:else if currentStory}
  <StoryRenderer storyData={currentStory} />
{/if}

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: var(--color-text);
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-border, #f3f3f3);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>