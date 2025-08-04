<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment'; // Importa o 'browser' para checagem
  import StoryRenderer from '$lib/components/StoryRenderer.svelte';
  import ReelsGloboPlayer from '$lib/components/story/GloboPlayer.svelte';

  // NOVAS FUNCIONALIDADES (opcionais)
  let enhancedMode = false;
  let showExtras = false;
  
  // Analytics com correção
  let readingProgress = 0;
  let scrollY = 0;
  let innerHeight = 0;
  let documentHeight = 0;
  
  // Seu código original (mantido intacto)
  let currentStory = null;
  let loading = true;

  onMount(async () => {
    try {
      const response = await fetch('./data/diario-de-um-legendario-a-fe-o-cansaco-e-as-regras.json');
      if (response.ok) {
        currentStory = await response.json();
        
        console.log('📖 Story carregada com sucesso!');
        console.log('📊 Dados da story:', {
          title: currentStory.title,
          components: currentStory.paragraphs?.length || 0,
          hasVideo: currentStory.paragraphs?.some(p => p.type?.includes('video')) || false
        });

        // Aguardar DOM ser renderizado para calcular altura inicial
        setTimeout(() => {
          updateReadingProgress();
        }, 200);
      }
    } catch (error) {
      console.error('Erro ao carregar matéria:', error);
    }
    loading = false;
  });

  function updateReadingProgress() {
    // CORREÇÃO: Adicionamos uma checagem para garantir que este código
    // só rode no browser, evitando o erro no servidor.
    if (!browser) return;

    const body = document.body;
    const html = document.documentElement;
    
    const pageHeight = Math.max(
      body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight
    );
    
    const viewportHeight = window.innerHeight || html.clientHeight;
    const scrollableHeight = pageHeight - viewportHeight;
    const currentScroll = window.pageYOffset || html.scrollTop || body.scrollTop || 0;

    if (scrollableHeight > 0) {
      readingProgress = Math.min(100, Math.max(0, (currentScroll / scrollableHeight) * 100));
    } else {
      readingProgress = currentScroll > 100 ? 100 : (currentScroll / 100) * 100;
    }
    
    documentHeight = pageHeight;
    scrollY = currentScroll;
    innerHeight = viewportHeight;
  }

  async function quickShare() {
    if (!currentStory) return;
    
    const shareData = {
      title: currentStory.title,
      text: currentStory.subtitle || 'Confira esta história interessante!',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiado! 📋');
      }
    } catch (err) {
      console.log('Compartilhamento cancelado ou falhou');
    }
  }

  function getReadingTime(story) {
    if (!story) return 0;
    const wordsPerMinute = 200;
    let totalWords = 0;
    
    if (story.title) totalWords += story.title.split(' ').length;
    if (story.subtitle) totalWords += story.subtitle.split(' ').length;
    if (story.intro?.text) totalWords += story.intro.text.split(' ').length;
    
    story.paragraphs?.forEach(p => {
      if (p.text) {
        const cleanText = p.text.replace(/<[^>]*>/g, '');
        totalWords += cleanText.split(' ').length;
      }
    });
    
    return Math.ceil(totalWords / wordsPerMinute);
  }

  function toggleExtras() {
    showExtras = !showExtras;
    if (showExtras) {
      setTimeout(() => updateReadingProgress(), 200);
    }
  }

  let scrollTimeout;
  function handleScroll() {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(() => {
        updateReadingProgress();
        scrollTimeout = null;
      }, 16);
    }
  }

  function handleResize() {
    setTimeout(() => updateReadingProgress(), 100);
  }
</script>

<svelte:window 
  bind:scrollY 
  bind:innerHeight 
  on:scroll={handleScroll}
  on:resize={handleResize}
/>

<svelte:head>
  <title>{currentStory ? currentStory.title : 'Sistema de Jornalismo'}</title>
  
  {#if currentStory}
    <meta name="description" content={currentStory.subtitle || currentStory.intro?.text || 'Sistema de jornalismo digital'} />
    <meta property="og:title" content={currentStory.title} />
    <meta property="og:description" content={currentStory.subtitle || 'História do sistema de jornalismo'} />
    <meta property="og:type" content="article" />
    {#if currentStory.author}
      <meta name="author" content={currentStory.author} />
    {/if}
  {/if}
</svelte:head>

<div class="reading-progress">
  <div class="progress-bar" style="width: {readingProgress}%"></div>
  </div>

{#if currentStory}
  <button class="share-button" on:click={quickShare} title="Compartilhar">
    📤
  </button>
{/if}


<!-- <div class="dev-controls">
  <button on:click={toggleExtras} class="toggle-btn" class:active={showExtras}>
    {showExtras ? '🚀' : '📰'} {showExtras ? 'Extras ON' : 'Extras OFF'}
  </button>
</div> -->


{#if showExtras}
  {#if currentStory && !loading}
    <div class="story-info">
      <div class="info-content">
        <span class="reading-time">⏱️ {getReadingTime(currentStory)} min</span>
        <span class="components">📦 {currentStory.paragraphs?.length || 0} componentes</span>
        {#if currentStory.author}
          <span class="author">✍️ {currentStory.author}</span>
        {/if}
        <span class="progress-debug">📊 {Math.round(readingProgress)}%</span>
      </div>
    </div>
  {/if}

  {#if import.meta.env.DEV}
    <div class="debug-info">
      <details open>
        <summary>🔧 Debug Avançado</summary>
        <div class="debug-content">
          <p>📊 <strong>Progresso:</strong> {readingProgress.toFixed(1)}%</p>
          <p>📜 <strong>Scroll Y:</strong> {scrollY}px</p>
          <p>📏 <strong>Doc Height:</strong> {documentHeight}px</p>
          <p>🖥️ <strong>Viewport:</strong> {innerHeight}px</p>
          <p>📐 <strong>Scrollable:</strong> {documentHeight - innerHeight}px</p>
          <p>📖 <strong>Tempo:</strong> {getReadingTime(currentStory)} min</p>
          <p>🎨 <strong>Tema:</strong> {currentStory?.theme || 'default'}</p>
          <button on:click={() => {updateReadingProgress();}}>
            🔄 Recalcular
          </button>
        </div>
      </details>
    </div>
  {/if}
{/if}


{#if loading}
  <div class="loading">
    <div class="spinner"></div>
    <p>Carregando...</p>
  </div>
{:else if currentStory}
  <StoryRenderer storyData={currentStory} />
{/if}


<style>
  /* ======= SEUS ESTILOS ORIGINAIS (não alterados) ======= */
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* ======= 🆕 NOVOS ESTILOS (só para as funcionalidades extras) ======= */
  
  /* Controles de desenvolvimento */
  .dev-controls {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 9999;
  }

  .toggle-btn {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .toggle-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .toggle-btn.active {
    background: #16a34a;
  }

  /* 🔧 BARRA DE PROGRESSO MELHORADA */
  .reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(0, 0, 0, 0.1);
    z-index: 1000;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary, #C4170C), #ff6b35);
    transition: width 0.1s ease-out;
    box-shadow: 0 0 3px rgba(196, 23, 12, 0.5);
  }

  .progress-text {
    position: absolute;
    top: 4px;
    right: 1rem;
    background: var(--color-background, white);
    padding: 0.4rem 0.8rem;
    border-radius: 0 0 8px 8px;
    font-size: 0.75rem;
    color: var(--color-secondary, #666);
    border: 1px solid var(--color-border, #eee);
    border-top: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-weight: 600;
  }

  .scroll-info {
    opacity: 0.6;
    font-size: 0.65rem;
  }

  /* Informações da story */
  .story-info {
    position: sticky;
    top: 5rem;
    margin: 1rem auto;
    max-width: 800px;
    padding: 0 2rem;
    z-index: 100;
  }

  .info-content {
    background: var(--color-highlight-bg, #f8f9fa);
    border: 1px solid var(--color-border, #eee);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.85rem;
    color: var(--color-secondary, #666);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .info-content span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .progress-debug {
    background: var(--color-primary, #C4170C);
    color: white !important;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
  }

  /* Botão de compartilhamento */
  .share-button {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--color-primary, #C4170C);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    z-index: 999;
  }

  .share-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  /* 🔧 DEBUG INFO MELHORADO */
  .debug-info {
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-family: monospace;
    z-index: 1000;
    max-width: 250px;
  }

  .debug-content {
    margin-top: 0.5rem;
  }

  .debug-content p {
    margin: 0.25rem 0;
  }

  .debug-content button {
    background: #16a34a;
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.7rem;
    margin-top: 0.5rem;
  }

  /* Mobile responsivo */
  @media (max-width: 768px) {
    .dev-controls {
      top: 0.5rem;
      left: 0.5rem;
    }

    .toggle-btn {
      font-size: 0.75rem;
      padding: 0.4rem 0.8rem;
    }

    .story-info {
      padding: 0 1rem;
    }

    .info-content {
      flex-direction: column;
      gap: 0.5rem;
    }

    .share-button {
      bottom: 1rem;
      right: 1rem;
      width: 45px;
      height: 45px;
      font-size: 1rem;
    }

    .progress-text {
      font-size: 0.7rem;
      padding: 0.3rem 0.6rem;
    }

    .scroll-info {
      display: none; /* Oculta info de scroll no mobile */
    }

    .debug-info {
      bottom: 0.5rem;
      left: 0.5rem;
      font-size: 0.7rem;
      max-width: 200px;
    }
  }
</style>