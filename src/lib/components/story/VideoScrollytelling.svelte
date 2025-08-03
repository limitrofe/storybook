<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  
  // Props
  export let videoSrc = '';
  export let videoSrcMobile = '';
  export let steps = [];
  export let height = '300vh';
  export let fullWidth = true;
  export let showProgress = true;
  export let showTime = true;
  export let fallbackFrames = []; // Ex: [{ src: '/frames/001.jpg', time: 0.04 }, ...]
  export let videoMetadata = null;
  export let posterImage = '';
  
  // Estados
  let containerElement;
  let videoElement;
  let currentStep = 0;
  let scrollProgress = 0;
  let isReady = false;
  let useVideoFallback = false; // Flag para forçar fallback se o vídeo falhar
  let isVisible = false;
  
  // Detecção de dispositivo
  let isIOS = false;
  let isMobile = false;
  
  // Scroll handling
  let scrollHandler;
  let ticking = false;
  
  onMount(() => {
    // A detecção de dispositivo só pode ocorrer no cliente
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
    isMobile = window.innerWidth <= 768 || isIOS;
    
    console.log('🔍 Device detection:', { isIOS, isMobile });

    setupScrollListener();
    initializeStrategy();
    
    // Marcar como pronto
    setTimeout(() => { isReady = true; }, 100);
  });
  
  onDestroy(() => {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
    }
  });

  // --- Lógica Reativa ---

  // 🎯 CORREÇÃO 1: Lógica de decisão mais precisa
  // Usaremos o fallback se:
  // 1. O vídeo falhar explicitamente (useVideoFallback = true).
  // 2. Estamos no iOS E temos frames de fallback para mostrar.
  // 3. Nenhuma fonte de vídeo foi fornecida, mas temos frames.
  $: shouldUseFallback = useVideoFallback || 
                        (isIOS && fallbackFrames.length > 0) ||
                        (!actualVideoSrc && fallbackFrames.length > 0);

  $: actualVideoSrc = (isMobile && videoSrcMobile) ? videoSrcMobile : videoSrc;
  
  // Log para debug da estratégia
  $: if (browser) {
    console.log('🎬 Strategy decision:', {
      isIOS,
      shouldUseFallback,
      hasVideoSrc: !!actualVideoSrc,
      hasFallbackFrames: fallbackFrames.length > 0
    });
  }
  
  // Calcular step atual baseado no progresso
  $: if (steps.length > 0) {
    const stepIndex = Math.floor(scrollProgress * steps.length);
    currentStep = Math.min(stepIndex, steps.length - 1);
  }
  
  // Calcular posição e opacidade dos steps
  $: stepPositions = steps.map((_, index) => {
    const stepProgress = scrollProgress * steps.length;
    const stepStart = index;
    const stepEnd = index + 1;
    let localProgress = 0;
    
    if (stepProgress >= stepStart && stepProgress <= stepEnd) {
      localProgress = stepProgress - stepStart;
    } else if (stepProgress > stepEnd) {
      localProgress = 1;
    }
    
    let yPosition = 150 - (localProgress * 200);
    let opacity = 0;
    
    if (localProgress > 0 && localProgress < 1) {
      if (localProgress <= 0.1) opacity = localProgress * 10;
      else if (localProgress >= 0.9) opacity = (1 - localProgress) * 10;
      else opacity = 1;
    }
    
    if (stepProgress > stepEnd) yPosition = -50;
    if (stepProgress < stepStart) yPosition = 150;
    
    return {
      yPosition,
      opacity: Math.max(0, Math.min(1, opacity)),
      isActive: localProgress > 0.1 && localProgress < 0.9
    };
  });
  
  // Selecionar o frame de imagem correto para o fallback
  $: currentFallbackFrame = (() => {
    if (!shouldUseFallback || fallbackFrames.length === 0) return null;
    
    const progress = Math.max(0, Math.min(1, scrollProgress));
    
    if (videoMetadata && videoMetadata.duration) {
      // Lógica de tempo preciso se metadados existem
      const currentTime = progress * videoMetadata.duration;
      let closestFrame = fallbackFrames[0];
      let minDiff = Math.abs(currentTime - (closestFrame.time || 0));
      for (const frame of fallbackFrames) {
        const diff = Math.abs(currentTime - (frame.time || 0));
        if (diff < minDiff) {
          minDiff = diff;
          closestFrame = frame;
        }
      }
      return closestFrame;
    } else {
      // Fallback para índice simples
      const frameIndex = Math.floor(progress * (fallbackFrames.length - 1));
      return fallbackFrames[frameIndex];
    }
  })();
    
  // Determinar qual imagem exibir (poster, primeiro frame, ou frame atual)
  $: displayImage = (() => {
    if (shouldUseFallback) {
      // Se estamos scrollando e temos um frame atual, use-o
      if (scrollProgress > 0 && currentFallbackFrame) return currentFallbackFrame.src;
      // Caso contrário, use o poster se existir
      if (posterImage) return posterImage;
      // Se não, use o primeiro frame da sequência como imagem inicial
      if (fallbackFrames.length > 0) return fallbackFrames[0].src;
    }
    // Para o modo vídeo, o poster é tratado pelo atributo `poster` da tag <video>
    return posterImage;
  })();

  // --- Funções ---

  function setupScrollListener() {
    scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    handleScroll(); // Chamar uma vez para definir o estado inicial
  }
  
  function handleScroll() {
    if (!containerElement) {
      ticking = false;
      return;
    }
    
    const rect = containerElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = containerElement.offsetHeight;
    const startY = 0;
    const endY = -(sectionHeight - windowHeight);
    
    let newProgress = (startY - rect.top) / (startY - endY);
    scrollProgress = Math.max(0, Math.min(1, newProgress));
    
    isVisible = rect.bottom > 0 && rect.top < windowHeight;
    
    // Atualizar vídeo apenas se estivermos usando a estratégia de vídeo
    if (!shouldUseFallback && videoElement && videoElement.duration) {
      const targetTime = scrollProgress * videoElement.duration;
      if (Math.abs(videoElement.currentTime - targetTime) > 0.1) {
        videoElement.currentTime = targetTime;
      }
    }
    
    ticking = false;
  }
  
  function initializeStrategy() {
    if (shouldUseFallback) {
      console.log('📱 Usando fallback de imagens para iOS ou por falta de vídeo.');
    } else if (videoElement) {
      console.log('🎥 Usando vídeo HTML5.');
      videoElement.addEventListener('loadedmetadata', () => {
        console.log('✅ Metadados do vídeo carregados.');
        handleScroll(); // Atualizar para o frame correto no carregamento
      });
      videoElement.addEventListener('error', (e) => {
        console.error('❌ Erro ao carregar o vídeo. Tentando usar fallback.', e);
        useVideoFallback = true;
      });
      // Garantir que o vídeo não reproduza sozinho
      videoElement.addEventListener('play', (e) => {
        if (videoElement.readyState >= 2) {
            videoElement.pause();
        }
      });
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<section 
  class="video-scrollytelling"
  class:full-width={fullWidth}
  style:height
  bind:this={containerElement}
>
  <div class="media-container">
    {#if shouldUseFallback}
      {#if displayImage}
        <img
          src={displayImage}
          alt={currentFallbackFrame?.alt || 'Cena do scrollytelling'}
          class="fallback-image"
          class:visible={isReady}
        />
      {:else}
        <div class="placeholder"><span>Modo Fallback: Nenhuma imagem fornecida.</span></div>
      {/if}

    {:else if actualVideoSrc}
      <video
        bind:this={videoElement}
        src={actualVideoSrc}
        poster={posterImage || null}
        muted
        playsinline
        preload="auto"
        class="scroll-video"
        class:visible={isReady}
      >
        <track kind="captions" />
      </video>

    {:else}
      <div class="placeholder"><span>🎬 Conteúdo de vídeo ou fallback não encontrado.</span></div>
    {/if}
  </div>
  
  <div class="steps-container">
    {#each steps as step, index}
      <div 
        class="step"
        class:active={stepPositions[index]?.isActive}
        style:transform="translateY({stepPositions[index]?.yPosition}vh)"
        style:opacity={stepPositions[index]?.opacity}
      >
        <div class="step-content">
          <div class="step-number">{index + 1}</div>
          <h3>{step.title}</h3>
          <div class="step-text">{@html step.text}</div>
          {#if showTime && step.time}
            <div class="step-time">{formatTime(step.time)}</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
  
  {#if showProgress}
    <div class="progress-bar">
      <div class="progress-fill" style:width="{scrollProgress * 100}%"></div>
    </div>
  {/if}
  
  {#if import.meta.env.DEV}
    <div class="debug-info">
      <p>Strategy: {shouldUseFallback ? '🖼️ Fallback' : '🎥 Video'}</p>
      <p>Progress: {Math.round(scrollProgress * 100)}%</p>
      <p>Step: {currentStep + 1}/{steps.length}</p>
      {#if !shouldUseFallback && videoElement}
        <p>Video Time: {videoElement?.currentTime?.toFixed(2) || 0}s</p>
      {/if}
      {#if shouldUseFallback && currentFallbackFrame}
        <p>Frame Index: {fallbackFrames.indexOf(currentFallbackFrame)}</p>
      {/if}
    </div>
  {/if}
</section>

<style>
  :root {
    --step-transition-speed: 0.3s;
  }
  .video-scrollytelling {
    position: relative;
    width: 100%;
    background: #000;
  }
  .video-scrollytelling.full-width {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
  }
  .media-container {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    z-index: 1;
    background: #000;
  }
  .scroll-video,
  .fallback-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  .scroll-video.visible,
  .fallback-image.visible {
    opacity: 1;
  }
  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-family: monospace;
  }
  .steps-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
  }
  .step {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem;
    transition: opacity var(--step-transition-speed) ease, transform var(--step-transition-speed) ease;
  }
  .step-content {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    color: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 450px;
    pointer-events: all;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .step-number {
    background: #4A5568;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-weight: bold;
    margin-bottom: 1rem;
    font-size: 14px;
  }
  .step-content h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }
  .step-text {
    line-height: 1.6;
  }
  .step-time {
    margin-top: 1rem;
    font-family: monospace;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.9rem;
    display: inline-block;
  }
  .progress-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    z-index: 20;
    pointer-events: none;
  }
  .progress-fill {
    height: 100%;
    background: white;
    width: 0;
    transition: width 0.1s linear;
  }
  .debug-info {
    position: fixed; top: 1rem; right: 1rem; background: rgba(0,0,0,0.8); color: white; padding: 1rem; border-radius: 8px; font-size: 12px; font-family: monospace; z-index: 99; border: 1px solid #333;
  }
  @media (max-width: 768px) {
    .step { padding: 1rem; }
    .step-content { max-width: 100%; padding: 1.5rem; }
    .step-content h3 { font-size: 1.25rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .step { transition: none; }
    .progress-fill { transition: none; }
  }
</style>