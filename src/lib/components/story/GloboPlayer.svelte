<!-- src/lib/components/story/GloboPlayer.svelte -->
<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';

  // Script loading shared between instances
  let scriptLoadPromise = null;

  function loadGloboScript() {
    if (scriptLoadPromise) {
      return scriptLoadPromise;
    }

    scriptLoadPromise = new Promise((resolve, reject) => {
      if (window.WM && window.WM.playerAvailable) {
        return resolve();
      }

      const scriptUrl = 'https://s3.glbimg.com/v1/AUTH_e1b09a2d222b4900a437a46914be81e5/api/stable/web/api.min.js';
      
      const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.WM.playerAvailable));
        existingScript.addEventListener('error', (e) => reject(new Error('Falha ao carregar script da Globo (existente).', e)));
        return;
      }
      
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      
      script.onload = () => {
        resolve(window.WM.playerAvailable);
      };
      
      script.onerror = (e) => {
        reject(new Error('Falha ao carregar a API do player da Globo. Verifique seu Ad Blocker.', e));
      };
      
      document.body.appendChild(script);
    });

    return scriptLoadPromise;
  }

  // Props do componente
  export let videoId = null; // ✅ CORRIGIDO: era videosIDs, agora é videoId
  export let videosIDs = null; // ✅ MANTIDO: para backward compatibility
  export let autoPlay = false;
  export let startMuted = false;
  export let skipDFP = false;
  export let width = '100%';
  export let height = '100%';
  export let chromeless = false;
  export let allowRestrictedContent = true;
  export let allowLocation = true;
  export let exitFullscreenOnEnd = true;
  export let isLiveContent = false;
  export let preventBlackBars = false;
  export let includeResetStyle = true;
  export let disasterRecoveryMode = false;
  export let env = 'production';
  export let globoId = null;
  export let token = null;
  export let resumeAt = null;
  export let maxQualityLevel = null;
  export let defaultSubtitle = null;
  export let defaultAudio = null;
  export let adAccountId = null;
  export let adCmsId = null;
  export let adUnit = null;
  export let adCustomData = null;
  export let siteName = null;
  export let ga4 = null;

  // Props extras para integração com StoryRenderer
  export let caption = '';
  export let credit = '';
  export let fullWidth = false;
  export let autoplay = false; // Alias para autoPlay
  export let controls = true;
  export let showCaption = true;

  // Variáveis internas
  let playerElement;
  let playerInstance = null;
  let isLoading = true;
  let error = null;
  const dispatch = createEventDispatcher();

  // ✅ FUNÇÃO PARA RESOLVER O VIDEO ID
  function getVideoId() {
    return videoId || videosIDs || null;
  }

  function createPlayer() {
    if (!browser || !window.WM || !window.WM.Player) {
      error = 'A API do player da Globo (WM) não está disponível.';
      console.error(error);
      isLoading = false;
      return;
    }

    const actualVideoId = getVideoId();
    if (!actualVideoId) {
      error = 'É necessário informar o videoId para criar o player!';
      isLoading = false;
      return;
    }

    if (playerInstance && typeof playerInstance.destroy === 'function') {
      playerInstance.destroy();
    }

    const config = {
      source: Number(actualVideoId),
      autoPlay: autoPlay || autoplay, // ✅ SUPORTE PARA AMBAS AS PROPS
      startMuted: startMuted,
      skipDFP: skipDFP,
      width,
      height,
      chromeless,
      allowRestrictedContent,
      allowLocation,
      exitFullscreenOnEnd,
      isLiveContent,
      preventBlackBars,
      includeResetStyle,
      disasterRecoveryMode,
      env,
      globoId,
      token,
      resumeAt,
      maxQualityLevel,
      defaultSubtitle,
      defaultAudio,
      adAccountId,
      adCmsId,
      adUnit,
      adCustomData,
      siteName,
      ga4
    };

    // Remove propriedades null/undefined
    Object.keys(config).forEach(key => (config[key] === null || config[key] === undefined) && delete config[key]);
    
    config.events = {
      onError: (err) => {
        error = `Erro no player: ${err.message || err}`;
        console.error('GloboPlayer Error:', error, err);
        isLoading = false;
        dispatch('error', err);
      },
      onReady: () => {
        isLoading = false;
        console.log(`✅ GloboPlayer: Player pronto para videoId ${actualVideoId}`);
        dispatch('ready');
      },
      onEnded: () => dispatch('ended'),
      onPlay: () => dispatch('play'),
      onPause: () => dispatch('pause')
    };

    try {
      console.log('🎬 Criando GloboPlayer com config:', config);
      playerInstance = new window.WM.Player(config);
      playerInstance.attachTo(playerElement);
    } catch (e) {
      error = `Erro ao instanciar o player: ${e.message}`;
      console.error('GloboPlayer Creation Error:', error, e);
      isLoading = false;
    }
  }

  onMount(async () => {
    if (!browser) return;

    const actualVideoId = getVideoId();
    if (!actualVideoId) {
      error = 'É necessário informar o videoId para criar o player!';
      isLoading = false;
      return;
    }
    
    try {
      console.log('🔄 Carregando script da Globo...');
      await loadGloboScript();
      console.log('✅ Script carregado, criando player...');
      createPlayer();
    } catch (err) {
      error = err.message;
      isLoading = false;
      console.error('❌ Falha no carregamento do script do player:', err);
    }
  });

  onDestroy(() => {
    if (playerInstance && typeof playerInstance.destroy === 'function') {
      playerInstance.destroy();
      console.log('🗑️ GloboPlayer destruído');
    }
  });

  // Reactive - recriar player se videoId mudar
  $: if (browser && (videoId || videosIDs) && window.WM) {
    createPlayer();
  }
</script>

<div class="globo-player-container" class:full-width={fullWidth}>
  <div class="player-wrapper" bind:this={playerElement}>
    {#if isLoading && !error}
      <div class="feedback-state loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">Carregando player Globo...</div>
      </div>
    {/if}

    {#if error}
      <div class="feedback-state error-state">
        <div class="error-icon">⚠️</div>
        <strong>Erro no Player Globo</strong>
        <p>{error}</p>
        <button on:click={() => { 
          isLoading = true; 
          error = null; 
          createPlayer(); 
        }}>
          Tentar novamente
        </button>
      </div>
    {/if}
  </div>

  <!-- Caption/Credit -->
  {#if showCaption && (caption || credit)}
    <div class="media-caption">
      {#if caption}
        <div class="caption-text">{@html caption}</div>
      {/if}
      {#if credit}
        <div class="caption-credit">{@html credit}</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .globo-player-container {
    width: 100%;
    margin: 0;
    max-width: 60rem;
  }

  .globo-player-container.full-width {
    max-width: none;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
  }

  .player-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000;
    color: white;
    overflow: hidden;
    border-radius: 8px;
  }

  .player-wrapper :global(> div),
  .player-wrapper :global(> iframe) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* Loading State */
  .feedback-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    position: absolute;
    z-index: 10;
    width: 100%;
    height: 100%;
  }

  .loading-state {
    background: rgba(0, 0, 0, 0.8);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    font-size: 1rem;
    opacity: 0.9;
  }

  /* Error State */
  .error-state {
    background: rgba(220, 38, 38, 0.9);
    gap: 0.5rem;
  }

  .error-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .error-state p {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0.5rem 0 1rem 0;
    max-width: 300px;
  }

  .error-state button {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .error-state button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Caption */
  .media-caption {
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.02);
    border-left: 3px solid #e5e7eb;
    margin-top: 0.5rem;
    border-radius: 0 4px 4px 0;
  }

  .caption-text {
    font-size: 0.9rem;
    color: #374151;
    line-height: 1.5;
    margin-bottom: 0.25rem;
  }

  .caption-credit {
    font-size: 0.8rem;
    color: #6b7280;
    font-style: italic;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .globo-player-container {
      margin: 0;
    }

    .player-wrapper {
      border-radius: 4px;
    }

    .feedback-state {
      padding: 1.5rem;
    }

    .loading-text {
      font-size: 0.9rem;
    }

    .media-caption {
      padding: 0.5rem 0.75rem;
      margin-top: 0rem;
    }

    .caption-text {
      font-size: 0.85rem;
    }

    .caption-credit {
      font-size: 0.75rem;
    }
  }
</style>