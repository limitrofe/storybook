<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';

  // Props de configuração do player
  export let videosIDs = null; // ID do vídeo (obrigatório)
  export let globoId = null; // ID de identificação do usuário
  export let token = null; // Token de acesso do usuário (GLBID)
  export let autoPlay = false; // Inicia reprodução automaticamente
  export let startMuted = false; // Inicia sem áudio
  export let resumeAt = null; // Momento inicial em segundos
  export let width = 640; // Largura do player
  export let height = 360; // Altura do player
  export let maxQualityLevel = null; // Qualidade máxima ('low', 'mid', 'high', 'max')
  export let env = 'production'; // Ambiente ('production', 'dev', 'internal')
  export let chromeless = false; // Player sem UI
  export let allowRestrictedContent = false; // Permite conteúdo restrito
  export let allowLocation = false; // Permite geolocalização
  export let exitFullscreenOnEnd = true; // Sai do fullscreen ao terminar
  export let isLiveContent = false; // Conteúdo ao vivo
  export let preventBlackBars = false; // Remove barras pretas
  export let includeResetStyle = true; // Aplica reset CSS
  export let disasterRecoveryMode = false; // Modo de recuperação

  // Props de publicidade (DFP)
  export let adAccountId = null;
  export let adCmsId = null;
  export let adUnit = null;
  export let adCustomData = null;
  export let skipDFP = false; // Pula publicidade

  // Props de analytics
  export let siteName = null; // Para comScore
  export let ga4 = null; // Configuração Google Analytics 4

  // Props de legendas e áudio padrão
  export let defaultSubtitle = null; // { language: 'por', role: 'subtitle' }
  export let defaultAudio = null; // { language: 'por', role: '' }

  // Props de controle
  export let containerClass = 'globo-player-container';
  export let playerClass = 'globo-player';

  // Dispatcher para eventos
  const dispatch = createEventDispatcher();

  // Variáveis de controle
  let playerContainer;
  let player = null;
  let isLoading = true;
  let error = null;
  let scriptLoaded = false;
  let playerId = `globo-player-${Math.random().toString(36).substr(2, 9)}`;

  // URLs e configurações
  const GLOBO_API_URL = 'https://s3.glbimg.com/v1/AUTH_e1b09a2d222b4900a437a46914be81e5/api/stable/web/api.min.js';
  const MIN_WIDTH = 320;
  const MIN_HEIGHT = 180;

  // Função para carregar script da Globo
  function loadGloboScript() {
    return new Promise((resolve, reject) => {
      // Verifica se já existe o WM global
      if (window.WM && window.WM.Player) {
        scriptLoaded = true;
        resolve();
        return;
      }

      // Verifica se o script já está sendo carregado
      const existingScript = document.querySelector(`script[src="${GLOBO_API_URL}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          scriptLoaded = true;
          resolve();
        });
        existingScript.addEventListener('error', reject);
        return;
      }

      // Cria novo script
      const script = document.createElement('script');
      script.src = GLOBO_API_URL;
      script.async = true;
      
      script.onload = () => {
        scriptLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Falha ao carregar API do Player Globo'));
      };

      document.head.appendChild(script);
    });
  }

  // Função para aguardar disponibilidade do player
  async function waitForPlayer() {
    if (!window.WM || !window.WM.playerAvailable) {
      throw new Error('API do Player Globo não disponível');
    }

    try {
      await window.WM.playerAvailable;
      return true;
    } catch (err) {
      throw new Error('Timeout aguardando Player Globo');
    }
  }

  // Validação de props
  function validateProps() {
    if (!videosIDs) {
      throw new Error('videosIDs é obrigatório');
    }

    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
      console.warn(`Tamanho mínimo recomendado: ${MIN_WIDTH}x${MIN_HEIGHT}px`);
    }
  }

  // Configuração do player
  function buildPlayerConfig() {
    const config = {
      videosIDs,
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      autoPlay,
      startMuted,
      chromeless,
      allowRestrictedContent,
      allowLocation,
      exitFullscreenOnEnd,
      isLiveContent,
      preventBlackBars,
      includeResetStyle,
      disasterRecoveryMode,
      env
    };

    // Adiciona props opcionais
    if (globoId) config.globoId = globoId;
    if (token) config.token = token;
    if (resumeAt !== null) config.resumeAt = resumeAt;
    if (maxQualityLevel) config.maxQualityLevel = maxQualityLevel;

    // Configuração de legendas padrão
    if (defaultSubtitle) config.defaultSubtitle = defaultSubtitle;
    if (defaultAudio) config.defaultAudio = defaultAudio;

    // Configuração de publicidade
    if (adAccountId) config.adAccountId = adAccountId;
    if (adCmsId) config.adCmsId = adCmsId;
    if (adUnit) config.adUnit = adUnit;
    if (adCustomData) config.adCustomData = adCustomData;
    if (skipDFP) config.skipDFP = skipDFP;

    // Configuração de analytics
    if (siteName) config.siteName = siteName;
    if (ga4) config.ga4 = ga4;

    // Eventos
    config.events = {
      onCanPlay: () => dispatch('canplay'),
      onPlay: (eventMetadata) => dispatch('play', eventMetadata),
      onPause: (eventMetadata) => dispatch('pause', eventMetadata),
      onSeek: (time) => dispatch('seek', { time }),
      onStop: (eventMetadata) => dispatch('stop', eventMetadata),
      onEnded: () => dispatch('ended'),
      onWatchSessionEnded: () => dispatch('watchsessionended'),
      onError: (error) => {
        console.error('Player Error:', error);
        dispatch('error', error);
      },
      onVolumeUpdate: (volume) => dispatch('volumeupdate', { volume }),
      onTimeUpdate: (timeProgress) => dispatch('timeupdate', timeProgress),
      onResize: (newSize) => dispatch('resize', newSize),
      onSubtitleChanged: (subtitle) => dispatch('subtitlechanged', subtitle),
      onAudioChanged: (audio) => dispatch('audiochanged', audio),
      onDidLoadCuepoints: (cuepoints) => dispatch('didloadcuepoints', cuepoints),
      onDidReachCuepoint: (cuepoint) => dispatch('didreachcuepoint', cuepoint),
      onDidReachLiveStopTime: () => dispatch('didreachlivestoptime')
    };

    return config;
  }

  // Função para criar o player
  async function createPlayer() {
    try {
      isLoading = true;
      error = null;

      validateProps();
      await loadGloboScript();
      await waitForPlayer();

      const config = buildPlayerConfig();
      player = new window.WM.Player(config);
      
      if (playerContainer) {
        player.attachTo(playerContainer);
        dispatch('ready', { player });
      }

    } catch (err) {
      error = err.message;
      console.error('Erro ao criar player:', err);
      dispatch('error', { error: err.message });
    } finally {
      isLoading = false;
    }
  }

  // Função para destruir o player
  function destroyPlayer() {
    if (player) {
      try {
        if (typeof player.destroy === 'function') {
          player.destroy();
        }
      } catch (err) {
        console.warn('Erro ao destruir player:', err);
      }
      player = null;
    }
  }

  // Métodos expostos do player
  export function play(actionMetadata = {}) {
    return player?.play(actionMetadata);
  }

  export function pause(actionMetadata = {}) {
    return player?.pause(actionMetadata);
  }

  export function stop(actionMetadata = {}) {
    return player?.stop(actionMetadata);
  }

  export function seek(time) {
    return player?.seek(time);
  }

  export function seekPercentage(percentage) {
    return player?.seekPercentage(percentage);
  }

  export function mute() {
    return player?.mute();
  }

  export function unmute() {
    return player?.unmute();
  }

  export function setVolume(volume) {
    return player?.setVolume(volume);
  }

  export function toggleFullscreen() {
    return player?.toggleFullscreen();
  }

  export function resize(size) {
    return player?.resize(size);
  }

  export function load(videoId) {
    return player?.load(videoId);
  }

  export function configure(options) {
    return player?.configure(options);
  }

  // Getters de status
  export function isPlaying() {
    return player?.isPlaying() || false;
  }

  export function isPaused() {
    return player?.isPaused() || false;
  }

  export function isStopped() {
    return player?.isStopped() || false;
  }

  export function isOnPoster() {
    return player?.isOnPoster() || false;
  }

  export function getCurrentTime() {
    return player?.getCurrentTime() || 0;
  }

  export function getPlayer() {
    return player;
  }

  // Lifecycle
  onMount(() => {
    if (browser) {
      createPlayer();
    }
  });

  onDestroy(() => {
    destroyPlayer();
  });

  // Reativo: recria player quando videosIDs mudar
  $: if (browser && videosIDs && scriptLoaded) {
    destroyPlayer();
    createPlayer();
  }
</script>

<div class={containerClass} class:loading={isLoading} class:error={!!error}>
  {#if isLoading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando player...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{error}</p>
      <button 
        class="retry-button"
        on:click={createPlayer}
      >
        Tentar novamente
      </button>
    </div>
  {:else}
    <div 
      bind:this={playerContainer}
      id={playerId}
      class={playerClass}
      style="width: {typeof width === 'number' ? width + 'px' : width}; height: {typeof height === 'number' ? height + 'px' : height};"
    ></div>
  {/if}
</div>

<style>
  .globo-player-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    border-radius: 4px;
    overflow: hidden;
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: white;
    text-align: center;
    min-height: 200px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-message {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .retry-button {
    background: #ff6b35;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .retry-button:hover {
    background: #e55a2e;
  }

  .globo-player {
    width: 100%;
    height: 100%;
  }

  /* Responsividade */
  @media (max-width: 768px) {
    .globo-player-container {
      border-radius: 0;
    }
    
    .loading-state,
    .error-state {
      padding: 1rem;
      min-height: 150px;
    }
    
    .loading-spinner {
      width: 30px;
      height: 30px;
    }
    
    .error-icon {
      font-size: 2rem;
    }
  }

  /* Garantir que o player preencha o container */
  :global(.globo-player-container .player-wrapper) {
    width: 100% !important;
    height: 100% !important;
  }

  :global(.globo-player-container video) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }
</style>