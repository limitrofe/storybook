<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';

  // SEU CÓDIGO ORIGINAL - SEM ALTERAÇÕES
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
      script.onload = () => { resolve(window.WM.playerAvailable); };
      script.onerror = (e) => { reject(new Error('Falha ao carregar a API do player da Globo. Verifique seu Ad Blocker.', e)); };
      document.body.appendChild(script);
    });
    return scriptLoadPromise;
  }

  // --- Props do Componente ---

  // ✅ ADIÇÃO DAS NOVAS PROPS NO TOPO DAS SUAS
  export let videoIdMobile = null;
  export let widthMobile = null;
  export let containerBackgroundColor = 'transparent';
  export let aspectRatio = '16 / 9';
  export let aspectRatioMobile = null;

  // SUAS PROPS ORIGINAIS (INTACTAS)
  export let videoId = null;
  export let videosIDs = null;
  export let autoPlay = false;
  export let startMuted = true; // Modificado para true para autoplay
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
  export let caption = '';
  export let credit = '';
  export let fullWidth = false;
  export let autoplay = false;
  export let controls = true;
  export let showCaption = true;

  // --- Variáveis Internas ---
  let playerElement;
  let playerInstance = null;
  let isLoading = false; // Alterado para false para esperar a viewport
  let error = null;
  const dispatch = createEventDispatcher();
  
  // ✅ ADIÇÃO DE VARIÁVEIS DE CONTROLE
  let observer = null;
  let hasBeenInitialized = false;
  let isMobile = false;

  // ✅ ALTERAÇÃO: Sua função agora usa o videoIdMobile
  function getVideoId() {
    if (browser && isMobile && videoIdMobile) {
      return videoIdMobile;
    }
    return videoId || videosIDs || null;
  }

  // SUA FUNÇÃO createPlayer (COM AJUSTE PARA AUTOPLAY)
  function createPlayer(shouldAutoplayOnCreate = false) {
    if (!browser || !window.WM || !window.WM.Player) {
      error = new Error('A API do player da Globo (WM) não está disponível.');
      isLoading = false;
      return;
    }
    const actualVideoId = getVideoId();
    if (!actualVideoId) {
      error = new Error('É necessário informar o videoId para criar o player!');
      isLoading = false;
      return;
    }
    if (playerInstance && typeof playerInstance.destroy === 'function') {
      playerInstance.destroy();
    }
    const config = {
      source: Number(actualVideoId),
      autoPlay: shouldAutoplayOnCreate,
      startMuted, skipDFP, width: '100%', height: '100%', chromeless, allowRestrictedContent, allowLocation,
      exitFullscreenOnEnd, isLiveContent, preventBlackBars, includeResetStyle, disasterRecoveryMode,
      env, globoId, token, resumeAt, maxQualityLevel, defaultSubtitle, defaultAudio, adAccountId,
      adCmsId, adUnit, adCustomData, siteName, ga4
    };
    Object.keys(config).forEach(key => (config[key] === null || config[key] === undefined) && delete config[key]);
    config.events = {
      onError: (err) => { error = err; isLoading = false; dispatch('error', err); },
      onReady: () => {
        isLoading = false;
        if (shouldAutoplayOnCreate) playerInstance.play();
        dispatch('ready');
      },
      onEnded: () => dispatch('ended'),
      onPlay: () => dispatch('play'),
      onPause: () => dispatch('pause')
    };
    try {
      playerInstance = new window.WM.Player(config);
      playerInstance.attachTo(playerElement);
    } catch (e) {
      error = e;
      isLoading = false;
    }
  }

  // ✅ ADIÇÃO DA LÓGICA DE INICIALIZAÇÃO CONTROLADA
  async function initializePlayer(shouldPlay) {
    if (hasBeenInitialized || !browser) return;
    hasBeenInitialized = true;
    isLoading = true;
    try {
      await loadGloboScript();
      createPlayer(shouldPlay);
    } catch (err) {
      error = err;
      isLoading = false;
    }
  }

  // ✅ SUBSTITUIÇÃO DO SEU onMount PELA VERSÃO COM IntersectionObserver
  onMount(() => {
    if (!browser) return;
    const checkMobile = () => { isMobile = window.innerWidth <= 768; };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    const options = { root: null, rootMargin: '0px', threshold: 0.5 };
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const shouldPlayVideo = (autoPlay || autoplay);
      if (entry.isIntersecting) {
        if (!hasBeenInitialized) {
          initializePlayer(shouldPlayVideo);
        } else if (playerInstance && typeof playerInstance.play === 'function' && shouldPlayVideo) {
          playerInstance.play();
        }
      } else {
        if (playerInstance && typeof playerInstance.pause === 'function' && shouldPlayVideo) {
          playerInstance.pause();
        }
      }
    }, options);
    if (playerElement) {
      observer.observe(playerElement);
    }
    return () => {
      window.removeEventListener('resize', checkMobile);
    }
  });

  // SEU CÓDIGO onDestroy (COM ADIÇÃO DO OBSERVER)
  onDestroy(() => {
    if (observer && playerElement) {
      observer.unobserve(playerElement);
    }
    if (playerInstance && typeof playerInstance.destroy === 'function') {
      playerInstance.destroy();
      console.log('🗑️ GloboPlayer destruído');
    }
  });

  // SEU CÓDIGO REATIVO (COM AJUSTE)
  $: if (browser && (videoId || videosIDs) && hasBeenInitialized) {
    createPlayer(false);
  }
</script>

<div class="video-section-wrapper" style="background-color: {containerBackgroundColor};">
  <div 
    class="globo-player-container" 
    class:full-width={fullWidth}
    style="--width-desktop: {width}; --width-mobile: {widthMobile || width};"
  >
    <div 
      class="player-wrapper" 
      bind:this={playerElement}
      style="--aspect-ratio-desktop: {aspectRatio}; --aspect-ratio-mobile: {aspectRatioMobile || aspectRatio};"
    >
      {#if isLoading}
        <div class="feedback-state loading-state">
          <div class="loading-spinner"></div>
          <div class="loading-text">Carregando player Globo...</div>
        </div>
      {:else if error}
        <div class="feedback-state error-state">
          <div class="error-icon">⚠️</div>
          <strong>Erro no Player Globo</strong>
          <p>{error.message || 'Ocorreu um erro.'}</p>
          <button on:click={() => { isLoading = true; error = null; initializePlayer(false); }}>
            Tentar novamente
          </button>
        </div>
      {/if}
    </div>

    {#if showCaption && (caption || credit)}
      <div class="media-caption">
        {#if caption}<div class="caption-text">{@html caption}</div>{/if}
        {#if credit}<div class="caption-credit">{@html credit}</div>{/if}
      </div>
    {/if}
  </div>
</div>

<style>
  /* ✅ ADIÇÃO: Regra para o fundo da seção "escapar" e centralizar o conteúdo */
  .video-section-wrapper {
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    padding: 2rem 0;
    display: flex;
    justify-content: center;
  }

  /* ✅ MODIFICAÇÃO: Sua regra original de container, agora usando as variáveis de largura */
  .globo-player-container {
    width: var(--width-mobile);
    max-width: 100%;
    margin: 0;
  }
  
  /* ✅ ADIÇÃO: Media query para aplicar a largura de desktop */
  @media (min-width: 769px) {
    .globo-player-container {
      width: var(--width-desktop);
    }
  }
  
  /* ✅ MODIFICAÇÃO: Sua regra de full-width, corrigida para a nova estrutura */
  .globo-player-container.full-width {
    width: 100%;
    max-width: none;
  }

  /* ✅ ADIÇÃO: Remove o padding da seção quando o vídeo for full-width */
  .video-section-wrapper:has(.full-width) {
    padding: 0;
  }
  
  /* SEU CSS ORIGINAL DAQUI PARA BAIXO, COM UMA ÚNICA MUDANÇA */

  .player-wrapper {
    position: relative;
    width: 100%;
    /* ✅ MODIFICAÇÃO: aspect-ratio agora usa as variáveis CSS */
    aspect-ratio: var(--aspect-ratio-mobile, 16 / 9);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000;
    color: white;
    overflow: hidden;
    border-radius: 8px;
  }

  /* ✅ ADIÇÃO: Media query para aplicar a proporção de desktop */
  @media (min-width: 769px) {
    .player-wrapper {
      aspect-ratio: var(--aspect-ratio-desktop, 16 / 9);
    }
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