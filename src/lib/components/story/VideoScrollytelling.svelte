<!-- VideoScrollytelling.svelte - Versão Simples e Funcional -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  
  // Props principais
  export let videoSrc = '';
  export let videoSrcMobile = '';
  export let steps = [];
  export let height = '300vh';
  export let fullWidth = true;
  export let showProgress = true;
  export let showTime = true;
  export let fallbackFrames = [];
  export let posterImage = '';
  
  // Estados
  let containerElement;
  let videoElement;
  let currentStep = 0;
  let scrollProgress = 0;
  let isReady = false;
  let useVideoFallback = false;
  let userInteracted = false;
  
  // Detecção de dispositivo
  let isIOS = false;
  let isMobile = false;
  
  // Scroll handling
  let scrollHandler;
  let ticking = false;

  $: if (browser) {
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    isMobile = window.innerWidth <= 768 || isIOS;
    
    // 🎯 FORÇAR iOS para debug
    console.log('🔍 Device:', {
      userAgent: navigator.userAgent,
      isIOS: isIOS,
      isMobile: isMobile,
      fallbackFrames: fallbackFrames.length
    });
  }
  
  // Escolher estratégia
  $: actualVideoSrc = (isMobile && videoSrcMobile) ? videoSrcMobile : videoSrc;
  $: shouldUseFallback = isIOS || useVideoFallback || !actualVideoSrc;
  
  // Step atual
  $: if (steps.length > 0) {
    const stepIndex = Math.floor(scrollProgress * steps.length);
    currentStep = Math.min(stepIndex, steps.length - 1);
  }
  
  // Frame atual para fallback
  $: currentFrame = shouldUseFallback && fallbackFrames.length > 0 
    ? fallbackFrames[Math.floor(scrollProgress * (fallbackFrames.length - 1))]
    : null;
    
  // Imagem para mostrar (poster ou frame atual)
  $: displayImage = currentFrame?.src || posterImage || (fallbackFrames.length > 0 ? fallbackFrames[0].src : null);
  
  // Posições dos steps
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
    
    if (localProgress >= 0 && localProgress <= 1) {
      if (localProgress <= 0.1) {
        opacity = localProgress * 10;
      } else if (localProgress >= 0.9) {
        opacity = (1 - localProgress) * 10;
      } else {
        opacity = 1;
      }
    }
    
    if (stepProgress > stepEnd) {
      yPosition = -50;
      opacity = 0;
    }
    
    if (stepProgress < stepStart) {
      yPosition = 150;
      opacity = 0;
    }
    
    return {
      yPosition: yPosition,
      opacity: Math.max(0, Math.min(1, opacity)),
      isActive: localProgress > 0.1 && localProgress < 0.9
    };
  });

  onMount(() => {
    setupScrollListener();
    
    setTimeout(() => {
      isReady = true;
    }, 500);
  });
  
  onDestroy(() => {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
    }
  });
  
  function setupScrollListener() {
    scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
  }
  
  function handleScroll() {
    if (!containerElement || !isReady) {
      ticking = false;
      return;
    }
    
    const rect = containerElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = containerElement.offsetHeight;
    
    const startY = 0;
    const endY = -(sectionHeight - windowHeight);
    const currentY = rect.top;
    
    let newProgress = 0;
    if (currentY <= startY && currentY >= endY) {
      newProgress = Math.abs(currentY - startY) / Math.abs(endY - startY);
    } else if (currentY > startY) {
      newProgress = 0;
    } else {
      newProgress = 1;
    }
    
    scrollProgress = Math.max(0, Math.min(1, newProgress));
    
    // Atualizar vídeo se não estiver em fallback
    if (!shouldUseFallback && videoElement && videoElement.duration) {
      const targetTime = scrollProgress * videoElement.duration;
      if (Math.abs(videoElement.currentTime - targetTime) > 0.2) {
        if (!videoElement.paused) {
          videoElement.pause();
        }
        try {
          videoElement.currentTime = targetTime;
        } catch (error) {
          // Ignorar erros de currentTime
        }
      }
    }
    
    ticking = false;
  }
  
  function handleUserInteraction() {
    if (!userInteracted) {
      userInteracted = true;
      
      if (!shouldUseFallback && videoElement) {
        videoElement.pause();
        videoElement.muted = true;
        videoElement.currentTime = scrollProgress * (videoElement.duration || 0);
      }
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
  style="height: {height};"
  bind:this={containerElement}
  on:touchstart={handleUserInteraction}
  on:click={handleUserInteraction}
>
  <!-- Media Container - STICKY -->
  <div class="media-container">
    
    <!-- Debug temporário - SEMPRE visível -->
    <div class="debug-overlay">
      <div>iOS: {isIOS ? 'SIM' : 'NÃO'}</div>
      <div>Mobile: {isMobile ? 'SIM' : 'NÃO'}</div>
      <div>Fallback: {shouldUseFallback ? 'SIM' : 'NÃO'}</div>
      <div>Frames: {fallbackFrames.length}</div>
      <div>Progress: {Math.round(scrollProgress * 100)}%</div>
      <div>Display: {displayImage ? 'SIM' : 'NÃO'}</div>
      {#if displayImage}
        <div style="font-size: 10px; word-break: break-all;">URL: {displayImage.substring(0, 50)}...</div>
      {/if}
    </div>
    
    <!-- Vídeo (desktop/android) -->
    {#if !shouldUseFallback && actualVideoSrc}
      <video
        bind:this={videoElement}
        src={actualVideoSrc}
        poster={displayImage}
        muted
        playsinline
        webkit-playsinline="true"
        preload="metadata"
        class="scroll-video"
        autoplay={false}
        loop={false}
      >
        <track kind="captions" />
      </video>
    {/if}
    
    <!-- 🎯 TESTE: FORÇAR IMAGEM SEMPRE (independente de iOS) -->
    {#if fallbackFrames && fallbackFrames.length > 0}
      {@const testImage = fallbackFrames[0].src}
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: {isIOS ? 20 : 5}; background: blue;">
        <img
          src={testImage}
          alt="TESTE FORÇADO"
          style="width: 100%; height: 100%; object-fit: cover;"
          on:load={() => console.log('✅ TESTE: Imagem carregou!', testImage)}
          on:error={(e) => console.log('❌ TESTE: Erro na imagem', testImage, e)}
        />
        <div style="position: absolute; top: 10px; right: 10px; background: rgba(255,0,0,0.8); color: white; padding: 5px; font-size: 12px;">
          {isIOS ? 'iOS TESTE' : 'DESKTOP TESTE'}
        </div>
      </div>
    {/if}
    
    <!-- Placeholder -->
    {#if !displayImage && !actualVideoSrc}
      <div class="placeholder">
        <div class="placeholder-content">
          <p>🎬 VideoScrollytelling</p>
          <p>iOS: {isIOS ? 'Detectado' : 'Não detectado'}</p>
          <p>Frames: {fallbackFrames.length}</p>
        </div>
      </div>
    {/if}
    
    <!-- iOS Play Button -->
    {#if isIOS && !userInteracted && !shouldUseFallback}
      <div class="ios-prompt">
        <button 
          class="play-button"
          on:click={handleUserInteraction}
        >
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="30" fill="rgba(0,0,0,0.7)"/>
            <polygon points="22,18 22,42 42,30" fill="white"/>
          </svg>
          <span>Toque para iniciar</span>
        </button>
      </div>
    {/if}
  </div>
  
  <!-- Steps Container - TAMBÉM STICKY -->
  <div class="steps-container">
    {#each steps as step, index}
      <div 
        class="step"
        class:active={stepPositions[index]?.isActive}
        class:visible={isReady}
        style="
          transform: translateY({stepPositions[index]?.yPosition || 150}vh);
          opacity: {stepPositions[index]?.opacity || 0};
        "
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
  
  <!-- Progress Bar -->
  {#if showProgress && isReady}
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        style="width: {scrollProgress * 100}%"
      ></div>
    </div>
  {/if}
</section>

<style>
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
    display: block;
  }
  
  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #111;
    color: #666;
  }
  
  .placeholder-content {
    text-align: center;
  }
  
  .placeholder-content p {
    font-size: 1.2rem;
    margin: 0.5rem 0;
  }
  
  .ios-prompt {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 5;
  }
  
  .play-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    font-size: 1rem;
  }
  
  .steps-container {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    pointer-events: none;
    z-index: 10;
  }
  
  .step {
    position: absolute;
    top: 0;
    left: 2rem;
    right: 2rem;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    pointer-events: none;
    transition: opacity 0.2s ease-out, transform 0.2s ease-out;
  }
  
  .step-content {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    color: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 500px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .step-number {
    display: inline-block;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    text-align: center;
    line-height: 30px;
    font-weight: bold;
    margin-bottom: 1rem;
    font-size: 14px;
  }
  
  .step-content h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1.3;
  }
  
  .step-text {
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .step-text :global(strong) {
    color: #ffd700;
  }
  
  .step-text :global(em) {
    color: #87ceeb;
  }
  
  .step-time {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 0.9rem;
    font-family: monospace;
  }
  
  .progress-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    z-index: 15;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.1s ease;
  }
  
  .debug-overlay {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    font-size: 12px;
    z-index: 100;
    border-radius: 4px;
  }
  
  .debug-overlay div {
    margin: 2px 0;
  }
  
  /* Mobile */
  @media (max-width: 768px) {
    .step {
      left: 1rem;
      right: 1rem;
    }
    
    .step-content {
      padding: 1.5rem;
    }
    
    .step-content h3 {
      font-size: 1.25rem;
    }
  }
  
  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .step,
    .progress-fill,
    .play-button {
      transition: none;
    }
  }
</style>