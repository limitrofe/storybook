<!-- VideoScrollytelling.svelte - VERSÃO OTIMIZADA COM PERFORMANCE -->
<script>
  import { onMount, onDestroy, tick } from 'svelte';
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
  
  // 🆕 Props para geração automática de frames
  export let imagePrefix = '';
  export let imagePrefixMobile = '';
  export let totalFrames = 0;
  
  // 🚀 Props de performance
  export let preloadFrames = 5; // Quantos frames carregar antecipadamente
  export let bufferSize = 10; // Tamanho do buffer de imagens
  export let smoothTransition = true; // Transições suaves entre frames
  export let lazyLoading = true; // Lazy loading para frames distantes
  
  // Estados principais
  let containerElement;
  let videoElement;
  let currentStep = 0;
  let scrollProgress = 0;
  let isReady = false;
  let useVideoFallback = false;
  let userInteracted = false;
  
  // Estados de performance
  let currentFrameIndex = 0;
  let lastFrameIndex = -1;
  let loadedFrames = new Map(); // Cache de imagens carregadas
  let preloadQueue = new Set(); // Fila de preload
  let isLoading = false;
  
  // Detecção de dispositivo
  let isIOS = false;
  let isMobile = false;
  
  // Scroll handling otimizado
  let scrollHandler;
  let ticking = false;
  let lastScrollTime = 0;
  
  // 🎯 Intersection Observer para lazy loading
  let intersectionObserver;

  $: if (browser) {
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    isMobile = window.innerWidth <= 768 || isIOS;
    
    console.log('🔍 Device & Performance:', {
      userAgent: navigator.userAgent,
      isIOS: isIOS,
      isMobile: isMobile,
      preloadFrames: preloadFrames,
      bufferSize: bufferSize,
      lazyLoading: lazyLoading
    });
  }
  
  // 🆕 GERAÇÃO AUTOMÁTICA DE FRAMES OTIMIZADA
  $: generatedFrames = (() => {
    // Se já tem fallbackFrames definidos, usar eles
    if (fallbackFrames && fallbackFrames.length > 0) {
      return fallbackFrames;
    }
    
    // Se tem imagePrefix e totalFrames, gerar automaticamente
    if (totalFrames > 0) {
      const prefix = (isMobile && imagePrefixMobile) ? imagePrefixMobile : imagePrefix;
      
      if (prefix) {
        const frames = [];
        const duration = steps.length > 0 ? Math.max(...steps.map(s => s.time || 0)) : totalFrames;
        
        for (let i = 0; i < totalFrames; i++) {
          const paddedIndex = String(i + 1).padStart(3, '0');
          const time = duration > 0 ? (i / (totalFrames - 1)) * duration : i;
          
          frames.push({
            index: i,
            time: time,
            src: `${prefix}${paddedIndex}.jpg`,
            alt: `Frame ${i + 1}`,
            loaded: false,
            loading: false,
            element: null
          });
        }
        
        console.log(`✅ Gerados ${frames.length} frames para otimização:`, frames.slice(0, 3));
        return frames;
      }
    }
    
    return [];
  })();
  
  // Escolher estratégia
  $: actualVideoSrc = (isMobile && videoSrcMobile) ? videoSrcMobile : videoSrc;
  $: shouldUseFallback = isIOS || useVideoFallback || !actualVideoSrc || generatedFrames.length > 0;
  
  // 🚀 CÁLCULO OTIMIZADO DO FRAME ATUAL
  $: {
    if (generatedFrames.length > 0) {
      const newFrameIndex = Math.floor(scrollProgress * (generatedFrames.length - 1));
      const clampedIndex = Math.max(0, Math.min(newFrameIndex, generatedFrames.length - 1));
      
      if (clampedIndex !== currentFrameIndex) {
        lastFrameIndex = currentFrameIndex;
        currentFrameIndex = clampedIndex;
        
        // Trigger preload inteligente
        if (browser) {
          preloadNearbyFrames(currentFrameIndex);
        }
      }
    }
  }
  
  // Step atual
  $: if (steps.length > 0) {
    const stepIndex = Math.floor(scrollProgress * steps.length);
    currentStep = Math.min(stepIndex, steps.length - 1);
  }
  
  // Frame atual para exibição - OTIMIZADO
  $: currentFrame = shouldUseFallback && generatedFrames.length > 0 
    ? generatedFrames[currentFrameIndex]
    : null;
    
  // Imagem para mostrar - COM FALLBACK INTELIGENTE
  $: displayImage = (() => {
    if (currentFrame?.loaded && currentFrame?.element) {
      return currentFrame.src;
    }
    
    // Fallback para frame anterior carregado se atual não estiver pronto
    if (smoothTransition && lastFrameIndex >= 0 && generatedFrames[lastFrameIndex]?.loaded) {
      return generatedFrames[lastFrameIndex].src;
    }
    
    // Fallback para poster ou primeiro frame
    return posterImage || (generatedFrames.length > 0 ? generatedFrames[0]?.src : null);
  })();
  
  // 🚀 PRELOAD INTELIGENTE DE FRAMES
  async function preloadNearbyFrames(centerIndex) {
    if (!generatedFrames.length || isLoading) return;
    
    isLoading = true;
    
    // Calcular range de preload
    const startIndex = Math.max(0, centerIndex - Math.floor(preloadFrames / 2));
    const endIndex = Math.min(generatedFrames.length - 1, centerIndex + Math.ceil(preloadFrames / 2));
    
    // Priorizar frame atual e adjacentes
    const loadPromises = [];
    
    for (let i = startIndex; i <= endIndex; i++) {
      const frame = generatedFrames[i];
      
      if (!frame.loaded && !frame.loading && !preloadQueue.has(i)) {
        preloadQueue.add(i);
        loadPromises.push(preloadFrame(frame, i));
      }
    }
    
    // Limpar frames distantes do buffer para economizar memória
    if (loadedFrames.size > bufferSize) {
      cleanupDistantFrames(centerIndex);
    }
    
    await Promise.allSettled(loadPromises);
    isLoading = false;
  }
  
  // 🖼️ PRELOAD DE FRAME INDIVIDUAL
  async function preloadFrame(frame, index) {
    if (frame.loaded || frame.loading) return;
    
    frame.loading = true;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        frame.loaded = true;
        frame.loading = false;
        frame.element = img;
        loadedFrames.set(index, img);
        preloadQueue.delete(index);
        
        console.log(`✅ Frame ${index + 1} carregado:`, frame.src);
        resolve(img);
      };
      
      img.onerror = (error) => {
        frame.loading = false;
        preloadQueue.delete(index);
        
        console.warn(`❌ Erro ao carregar frame ${index + 1}:`, frame.src, error);
        reject(error);
      };
      
      // Definir src por último para evitar race conditions
      img.src = frame.src;
    });
  }
  
  // 🧹 LIMPEZA DE FRAMES DISTANTES
  function cleanupDistantFrames(centerIndex) {
    const keepRange = bufferSize;
    
    for (const [index, img] of loadedFrames.entries()) {
      const distance = Math.abs(index - centerIndex);
      
      if (distance > keepRange) {
        // Remover da memória
        if (img && img.src) {
          img.src = '';
        }
        
        generatedFrames[index].loaded = false;
        generatedFrames[index].element = null;
        loadedFrames.delete(index);
        
        console.log(`🧹 Frame ${index + 1} removido do buffer`);
      }
    }
  }
  
  // Posições dos steps (inalterado)
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
    setupIntersectionObserver();
    
    // Preload inicial
    if (generatedFrames.length > 0) {
      preloadNearbyFrames(0);
    }
    
    setTimeout(() => {
      isReady = true;
    }, 100); // Reduzido para melhor responsividade
  });
  
  onDestroy(() => {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
    }
    
    if (intersectionObserver) {
      intersectionObserver.disconnect();
    }
    
    // Limpar todas as imagens do cache
    for (const [index, img] of loadedFrames.entries()) {
      if (img && img.src) {
        img.src = '';
      }
    }
    loadedFrames.clear();
    preloadQueue.clear();
  });
  
  // 🚀 SCROLL LISTENER OTIMIZADO
  function setupScrollListener() {
    scrollHandler = () => {
      const now = performance.now();
      
      // Throttle baseado no tempo para melhor performance
      if (now - lastScrollTime < 16) return; // ~60fps
      
      lastScrollTime = now;
      
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
  }
  
  // 🔍 INTERSECTION OBSERVER PARA LAZY LOADING
  function setupIntersectionObserver() {
    if (!lazyLoading || !browser) return;
    
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Componente visível - iniciar preload agressivo
            if (generatedFrames.length > 0 && !isLoading) {
              preloadNearbyFrames(currentFrameIndex);
            }
          }
        });
      },
      {
        rootMargin: '100px 0px', // Começar preload 100px antes
        threshold: 0.1
      }
    );
    
    if (containerElement) {
      intersectionObserver.observe(containerElement);
    }
  }
  
  // 📐 CÁLCULO DE SCROLL OTIMIZADO
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
      if (Math.abs(videoElement.currentTime - targetTime) > 0.1) { // Menor threshold para suavidade
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
  class:smooth-transition={smoothTransition}
  style="height: {height};"
  bind:this={containerElement}
  on:touchstart={handleUserInteraction}
  on:click={handleUserInteraction}
>
  <!-- Media Container - STICKY -->
  <div class="media-container">
    
    <!-- Performance Debug -->
    <div class="debug-overlay">
      <div>iOS: {isIOS ? 'SIM' : 'NÃO'}</div>
      <div>Mobile: {isMobile ? 'SIM' : 'NÃO'}</div>
      <div>Fallback: {shouldUseFallback ? 'SIM' : 'NÃO'}</div>
      <div>Frames: {generatedFrames.length}</div>
      <div>Progress: {Math.round(scrollProgress * 100)}%</div>
      <div>Frame: {currentFrameIndex + 1}/{generatedFrames.length}</div>
      <div>Loaded: {loadedFrames.size}</div>
      <div>Preload Queue: {preloadQueue.size}</div>
      <div class:loading={isLoading}>Loading: {isLoading ? 'SIM' : 'NÃO'}</div>
      {#if displayImage}
        <div style="font-size: 10px; word-break: break-all;">URL: {displayImage.substring(0, 50)}...</div>
      {/if}
    </div>
    
    <!-- Vídeo (desktop/android apenas quando NÃO é iOS e NÃO tem frames gerados) -->
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
    
    <!-- 🎯 IMAGEM OTIMIZADA PARA iOS E FALLBACK -->
    {#if shouldUseFallback && displayImage}
      <img
        src={displayImage}
        alt="Video frame {currentFrameIndex + 1}"
        class="fallback-image"
        class:smooth={smoothTransition}
        loading="eager"
        decoding="async"
        on:load={() => console.log('✅ Frame exibido:', currentFrameIndex + 1, displayImage)}
        on:error={(e) => console.log('❌ Erro no frame:', currentFrameIndex + 1, displayImage, e)}
      />
    {/if}
    
    <!-- Loading indicator -->
    {#if isLoading && shouldUseFallback}
      <div class="loading-indicator">
        <div class="loading-spinner"></div>
        <span>Carregando frames...</span>
      </div>
    {/if}
    
    <!-- Placeholder quando não tem nada -->
    {#if !displayImage && !actualVideoSrc}
      <div class="placeholder">
        <div class="placeholder-content">
          <p>🎬 VideoScrollytelling Otimizado</p>
          <p>iOS: {isIOS ? 'Detectado' : 'Não detectado'}</p>
          <p>Frames Gerados: {generatedFrames.length}</p>
          <p>Performance: {preloadFrames} preload, {bufferSize} buffer</p>
          <p>ImagePrefix: {imagePrefix ? 'Definido' : 'Não definido'}</p>
          <p>TotalFrames: {totalFrames}</p>
        </div>
      </div>
    {/if}
    
    <!-- iOS Play Button (apenas quando tem vídeo mas não tem frames) -->
    {#if isIOS && !userInteracted && !shouldUseFallback && actualVideoSrc}
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
  
  <!-- Progress Bar Otimizada -->
  {#if showProgress && isReady}
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        style="width: {scrollProgress * 100}%"
      ></div>
      <div class="progress-frame-indicator" style="left: {(currentFrameIndex / (generatedFrames.length - 1)) * 100}%"></div>
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
  
  /* 🚀 TRANSIÇÕES SUAVES */
  .fallback-image.smooth {
    transition: opacity 0.1s ease-out;
  }
  
  .smooth-transition .fallback-image {
    transition: opacity 0.05s ease-out;
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
  
  /* 🔄 LOADING INDICATOR */
  .loading-indicator {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 15px;
    border-radius: 20px;
    font-size: 12px;
    z-index: 50;
  }
  
  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
  
  /* 🚀 PROGRESS BAR OTIMIZADA */
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
    transition: width 0.05s ease;
  }
  
  .progress-frame-indicator {
    position: absolute;
    top: -2px;
    width: 2px;
    height: 8px;
    background: #ffd700;
    transition: left 0.05s ease;
  }
  
  /* 🐛 DEBUG OVERLAY OTIMIZADO */
  .debug-overlay {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 10px;
    font-size: 11px;
    z-index: 100;
    border-radius: 4px;
    font-family: monospace;
    min-width: 200px;
  }
  
  .debug-overlay div {
    margin: 2px 0;
    display: flex;
    justify-content: space-between;
  }
  
  .debug-overlay .loading {
    color: #ffd700;
    font-weight: bold;
  }
  
  /* Mobile otimizações */
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
    
    .debug-overlay {
      font-size: 10px;
      padding: 8px;
      min-width: 180px;
    }
    
    .loading-indicator {
      top: 10px;
      right: 10px;
      padding: 8px 12px;
      font-size: 11px;
    }
    
    /* Otimizações de performance mobile */
    .fallback-image {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
  }
  
  /* Otimizações de performance geral */
  .video-scrollytelling {
    contain: layout style paint;
    will-change: scroll-position;
  }
  
  .media-container {
    contain: layout style paint;
  }
  
  .fallback-image {
    will-change: opacity;
    backface-visibility: hidden;
    transform: translateZ(0);
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .step,
    .progress-fill,
    .progress-frame-indicator,
    .fallback-image.smooth,
    .play-button {
      transition: none;
    }
    
    .loading-spinner {
      animation: none;
    }
  }
  
  /* High performance mode */
  @media (min-resolution: 2dppx) {
    .fallback-image {
      image-rendering: -webkit-optimize-contrast;
    }
  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .placeholder {
      background: #0a0a0a;
      color: #888;
    }
    
    .debug-overlay {
      background: rgba(10, 10, 10, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
  
  /* Print styles */
  @media print {
    .video-scrollytelling {
      height: auto !important;
      page-break-inside: avoid;
    }
    
    .debug-overlay,
    .loading-indicator,
    .progress-bar {
      display: none !important;
    }
    
    .fallback-image {
      position: static;
      max-height: 400px;
      object-fit: contain;
    }
    
    .steps-container {
      position: static;
      height: auto;
    }
    
    .step {
      position: static;
      opacity: 1 !important;
      transform: none !important;
      margin: 20px 0;
    }
  }
</style>