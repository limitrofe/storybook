<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';

  // --- INÍCIO DA CORREÇÃO: PONTO DE ENCONTRO ---
  // Esta variável é compartilhada entre TODAS as instâncias do GloboPlayer na página.
  // Ela vai guardar a "promessa" de que o script da Globo será carregado.
  let scriptLoadPromise = null;

  function loadGloboScript() {
    // Se a promessa já foi criada por outro componente, apenas a retornamos.
    // Assim, todos esperam pelo mesmo evento.
    if (scriptLoadPromise) {
      return scriptLoadPromise;
    }

    // Se somos o PRIMEIRO componente, criamos a promessa.
    scriptLoadPromise = new Promise((resolve, reject) => {
      // Se por acaso o script já estiver na página, resolvemos imediatamente.
      if (window.WM && window.WM.playerAvailable) {
        return resolve();
      }

      const scriptUrl = 'https://s3.glbimg.com/v1/AUTH_e1b09a2d222b4900a437a46914be81e5/api/stable/web/api.min.js';
      
      // Checa se outro componente já adicionou a tag <script> mas ela ainda não carregou.
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
        // Quando o script carrega, resolvemos a promessa usando a promise interna da própria API.
        resolve(window.WM.playerAvailable);
      };
      
      script.onerror = (e) => {
        reject(new Error('Falha ao carregar a API do player da Globo. Verifique seu Ad Blocker.', e));
      };

      document.body.appendChild(script);
    });

    return scriptLoadPromise;
  }
  // --- FIM DA CORREÇÃO ---


  // Props do "Caminhão de Bombeiros": todas as opções possíveis para o jornalista
  // (NENHUMA PROP FOI REMOVIDA)
  export let videosIDs = null;
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

  // Variáveis internas
  let playerElement;
  let playerInstance = null;
  let isLoading = true;
  let error = null;

  const dispatch = createEventDispatcher();

  function createPlayer() {
    if (!browser || !window.WM || !window.WM.Player) {
      error = 'A API do player da Globo (WM) não está disponível.';
      console.error(error);
      isLoading = false;
      return;
    }

    if (playerInstance && typeof playerInstance.destroy === 'function') {
      playerInstance.destroy();
    }

    const config = {
      source: Number(videosIDs),
      autoPlay: autoPlay,
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

    Object.keys(config).forEach(key => (config[key] === null || config[key] === undefined) && delete config[key]);
    
    config.events = {
      onError: (err) => {
        error = `Erro no player: ${err.message}`;
        console.error(error, err);
        isLoading = false;
        dispatch('error', err);
      },
      onReady: () => {
        isLoading = false;
        console.log(`GloboPlayer: Player pronto para videoId ${videosIDs}`);
        dispatch('ready');
      },
      onEnded: () => dispatch('ended')
    };

    try {
      playerInstance = new window.WM.Player(config);
      playerInstance.attachTo(playerElement);
    } catch (e) {
      error = `Erro ao instanciar o player: ${e.message}`;
      console.error(error, e);
      isLoading = false;
    }
  }

  onMount(async () => {
    if (!browser) return;

    if (!videosIDs) {
      error = 'É necessário informar o videoId para criar o player!';
      isLoading = false;
      return;
    }
    
    try {
      await loadGloboScript();
      createPlayer();
    } catch (err) {
      error = err.message;
      isLoading = false;
      console.error('Falha final no carregamento do script do player:', err);
    }
  });

  onDestroy(() => {
    if (playerInstance && typeof playerInstance.destroy === 'function') {
      playerInstance.destroy();
    }
  });
</script>

<div class="player-wrapper" bind:this={playerElement}>
  {#if isLoading && !error}
    <div class="feedback-state">Carregando player...</div>
  {/if}
  {#if error}
    <div class="feedback-state error-state">
      <strong>Erro no Player</strong>
      <p>{error}</p>
      <button on:click={() => { isLoading = true; error = null; onMount(); }}>
        Tentar novamente
      </button>
    </div>
  {/if}
</div>

<style>
  .player-wrapper {
    position: relative;
    width: 100%; /* Ocupa 100% da largura que o StoryRenderer definir (seja 60% ou 100%) */
    
    /* ✅ AQUI ESTÁ A CORREÇÃO PRINCIPAL */
    /* Força o contêiner do player a ter SEMPRE a proporção de 16:9. */
    /* A altura será calculada automaticamente pelo navegador. */
    aspect-ratio: 16 / 9;
    
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: black;
    color: white;
    overflow: hidden; /* Garante que o vídeo não "vaze" para fora do contêiner */
  }

  /* Faz o player injetado (div, video, iframe) preencher o wrapper perfeitamente */
  .player-wrapper :global(> div),
  .player-wrapper :global(> iframe) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* ✅ CONTROLE DE CORTE */
  /* Esta regra agora é controlada pela prop 'preventBlackBars' do player.
     Se preventBlackBars: false (padrão) -> object-fit: contain (mostra tudo, com barras pretas)
     Se preventBlackBars: true -> object-fit: cover (cobre tudo, com cortes) 
     Não precisamos mais forçar o estilo aqui. */
  
  /* ESTILOS DE FEEDBACK (LOADING/ERROR) */
  .feedback-state {
    padding: 1rem;
    text-align: center;
    /* Adicionado para garantir que o feedback fique visível */
    position: absolute; 
    z-index: 1;
  }
  .error-state p {
    font-size: 0.8rem;
    opacity: 0.8;
    margin: 0.5rem 0 1rem 0;
  }
  .error-state button {
    background: #333;
    color: white;
    border: 1px solid #555;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
</style>