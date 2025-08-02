<!-- src/lib/components/story/VideoScrollytelling.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  // Props vindas do JSON
  export let videoSrc = '';
  export let videoSrcMobile = '';
  export let steps = [];
  export let height = '300vh';
  export let videoAspectRatio = '16/9';
  export let fullWidth = true;
  export let showProgress = true;
  export let showTime = true;

  // Estado do componente
  let video;
  let scrollySection;
  let isVideoReady = false;
  let videoDuration = 0;
  let currentStep = 0;
  let progress = 0;
  let currentTime = 0;
  let isLoading = true;
  let error = null;

  // Detecção específica para iOS/iPhone
  let isIOS = false;
  let isLowPowerMode = false;
  let isMobile = false;
  let actualVideoSrc = '';
  let userInteracted = false;

  // Fallback para quando vídeo não funciona
  let shouldUseFallback = false;
  let fallbackImages = [];

  // Event handlers
  let scrollHandler;
  let ticking = false;

  onMount(() => {
    if (!browser) return;

    // Detectar iOS e limitações
    detectIOSAndLimitations();
    
    // Escolher estratégia baseada no dispositivo
    setupVideoStrategy();

    console.log('🍎 iOS:', isIOS);
    console.log('🔋 Low Power Mode:', isLowPowerMode);
    console.log('📱 Mobile:', isMobile);
    console.log('🎬 Video source:', actualVideoSrc);
    console.log('🎯 Strategy:', shouldUseFallback ? 'Fallback Images' : 'Video');
  });

  onDestroy(() => {
    if (browser && scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
    }
  });

  function detectIOSAndLimitations() {
    if (!browser) return;

    // Detectar iOS
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Detectar mobile
    isMobile = window.innerWidth <= 768 || isIOS;

    // Tentar detectar Low Power Mode (iOS)
    if (isIOS) {
      // Métodos para detectar economia de bateria
      isLowPowerMode = detectLowPowerMode();
    }

    // Verificar se deve usar fallback
    shouldUseFallback = isLowPowerMode || 
                       (isIOS && window.innerWidth <= 480) || // iPhone pequeno
                       navigator.connection?.saveData; // Data Saver ativo
  }

  function detectLowPowerMode() {
    if (!browser || !isIOS) return false;

    try {
      // Método 1: Verificar requestAnimationFrame throttling
      let throttled = false;
      const start = performance.now();
      
      requestAnimationFrame(() => {
        const elapsed = performance.now() - start;
        throttled = elapsed > 20; // Mais de 20ms indica throttling
      });

      // Método 2: Verificar capacidades reduzidas
      const reducedCapabilities = !window.DeviceMotionEvent || 
                                 !window.DeviceOrientationEvent ||
                                 navigator.hardwareConcurrency <= 2;

      // Método 3: Performance da bateria (heurística)
      const battery = navigator.battery || navigator.mozBattery || navigator.webkitBattery;
      const lowBattery = battery && battery.level < 0.2;

      return throttled || reducedCapabilities || lowBattery;
      
    } catch (e) {
      console.warn('Não foi possível detectar Low Power Mode:', e);
      return false;
    }
  }

  function setupVideoStrategy() {
    // Escolher source do vídeo
    actualVideoSrc = (isMobile && videoSrcMobile) ? videoSrcMobile : videoSrc;

    if (shouldUseFallback) {
      // Usar fallback de imagens ao invés de vídeo
      createFallbackImages();
    } else {
      // Tentar usar vídeo normalmente
      setupVideoHandlers();
    }
  }

  function createFallbackImages() {
    // Gerar imagens estáticas para cada step baseado no tempo
    fallbackImages = steps.map((step, index) => {
      const timePercent = (step.time || 0) / 596; // Assumindo vídeo de 9min56s
      
      // Você pode substituir por frames reais do vídeo ou imagens estáticas
      return {
        src: `https://picsum.photos/800/450?random=${index + 10}`,
        time: step.time || 0,
        alt: `Frame do vídeo aos ${formatTime(step.time || 0)}`
      };
    });

    isVideoReady = true;
    isLoading = false;
    videoDuration = 596; // 9min56s
    
    setupScrollHandlers();
  }

  function setupVideoHandlers() {
    // Setup scroll listener
    setupScrollHandlers();
  }

  function setupScrollHandlers() {
    scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // Initial check
    setTimeout(handleScroll, 500);
  }

  function handleVideoLoad() {
    if (!video) return;
    
    videoDuration = video.duration;
    isVideoReady = true;
    isLoading = false;
    
    console.log('✅ Vídeo carregado:', videoDuration, 'segundos');
    
    // iPhone precisa de interação do usuário primeiro
    if (isIOS && !userInteracted) {
      // Aguardar primeiro toque/scroll
      setupUserInteractionListener();
    } else {
      video.currentTime = 0;
      currentTime = 0;
    }
  }

  function setupUserInteractionListener() {
    const handleFirstInteraction = () => {
      userInteracted = true;
      if (video) {
        video.currentTime = 0;
        currentTime = 0;
      }
      
      // Remover listeners após primeira interação
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      
      console.log('✅ iPhone: Primeira interação registrada');
    };

    window.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
    window.addEventListener('scroll', handleFirstInteraction, { passive: true, once: true });
  }

  function handleVideoError(e) {
    console.error('❌ Erro no vídeo:', e);
    console.log('🔄 Fallback para imagens...');
    
    // Fallback automático para imagens
    shouldUseFallback = true;
    createFallbackImages();
  }

  function handleScroll() {
    if (!isVideoReady || !scrollySection) {
      ticking = false;
      return;
    }

    const scrollY = window.scrollY;
    const sectionTop = scrollySection.offsetTop;
    const sectionHeight = scrollySection.offsetHeight;
    const windowHeight = window.innerHeight;
    
    // Só processar se estivermos na seção
    if (scrollY >= sectionTop && scrollY <= sectionTop + sectionHeight) {
      // Calcular progresso
      const rawProgress = (scrollY - sectionTop) / (sectionHeight - windowHeight);
      progress = Math.max(0, Math.min(1, rawProgress));
      
      if (!shouldUseFallback && video) {
        // Modo vídeo normal
        const targetTime = progress * videoDuration;
        
        // iPhone: update menos frequente para economia
        const threshold = isIOS ? 0.5 : 0.2;
        
        if (Math.abs(video.currentTime - targetTime) > threshold) {
          video.currentTime = targetTime;
          currentTime = targetTime;
        }
      } else {
        // Modo fallback: simular tempo baseado no progresso
        currentTime = progress * videoDuration;
      }
      
      // Atualizar step ativo
      updateActiveStep(scrollY);
    }
    
    ticking = false;
  }

  function updateActiveStep(scrollY) {
    const stepElements = scrollySection?.querySelectorAll('.step');
    if (!stepElements) return;
    
    stepElements.forEach((step, index) => {
      const stepTop = step.offsetTop;
      const stepHeight = step.offsetHeight;
      
      // Card fica ativo durante TODO o step (desde o topo até o final)
      if (scrollY >= stepTop - window.innerHeight * 0.2 && 
          scrollY < stepTop + stepHeight - window.innerHeight * 0.2) {
        
        if (currentStep !== index) {
          currentStep = index;
          
          const stepData = steps[index];
          if (stepData?.time !== undefined) {
            if (!shouldUseFallback && video) {
              // Vídeo: pular para tempo específico
              video.currentTime = stepData.time;
              currentTime = stepData.time;
            } else {
              // Fallback: simular tempo
              currentTime = stepData.time;
            }
          }
        }
      }
    });
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function getCurrentFallbackImage() {
    if (!shouldUseFallback || fallbackImages.length === 0) return null;
    
    // Encontrar a imagem mais próxima do tempo atual
    const closest = fallbackImages.reduce((prev, curr) => {
      return Math.abs(curr.time - currentTime) < Math.abs(prev.time - currentTime) ? curr : prev;
    });
    
    return closest;
  }

  // Reactive
  $: progressPercent = progress * 100;
  $: formattedCurrentTime = formatTime(currentTime);
  $: formattedDuration = formatTime(videoDuration);
  $: currentFallbackImage = getCurrentFallbackImage();
</script>

<section 
  class="video-scrollytelling"
  class:full-width={fullWidth}
  class:ios-device={isIOS}
  class:low-power={isLowPowerMode}
  class:fallback-mode={shouldUseFallback}
  bind:this={scrollySection}
  style="min-height: {height};"
>
  <!-- Video/Image Container -->
  <div class="video-container">
    <div class="video-wrapper" style="aspect-ratio: {videoAspectRatio};">
      
      {#if !shouldUseFallback && actualVideoSrc}
        <!-- Modo Vídeo (quando possível) -->
        <video
          bind:this={video}
          src={actualVideoSrc}
          muted
          preload="metadata"
          playsinline
          webkit-playsinline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          on:loadedmetadata={handleVideoLoad}
          on:error={handleVideoError}
          on:loadstart={() => console.log('🎬 Vídeo: Iniciando carregamento')}
          on:canplay={() => console.log('🎬 Vídeo: Pode reproduzir')}
        >
          Seu navegador não suporta vídeo HTML5.
        </video>
        
      {:else if shouldUseFallback && currentFallbackImage}
        <!-- Modo Fallback (imagens estáticas) -->
        <img
          src={currentFallbackImage.src}
          alt={currentFallbackImage.alt}
          class="fallback-image"
        />
        
      {/if}
      
      <!-- Loading State -->
      {#if isLoading}
        <div class="loading">
          <div class="spinner"></div>
          <div class="loading-text">
            {#if isIOS}
              {isLowPowerMode ? 'Modo economia de bateria detectado...' : 'Carregando para iPhone...'}
            {:else}
              Carregando vídeo...
            {/if}
            {#if isMobile && videoSrcMobile}
              <br><small>versão otimizada para mobile</small>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Status Indicators -->
      {#if isVideoReady}
        <div class="status-indicators">
          {#if isIOS}<span class="status-badge ios">🍎 iOS</span>{/if}
          {#if isLowPowerMode}<span class="status-badge low-power">🔋 Economia</span>{/if}
          {#if shouldUseFallback}<span class="status-badge fallback">📷 Fallback</span>{/if}
        </div>
      {/if}
      
      <!-- Progress Bar -->
      {#if isVideoReady && showProgress}
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progressPercent}%;"></div>
        </div>
      {/if}
      
      <!-- Time Display -->
      {#if isVideoReady && showTime}
        <div class="time-display">
          {formattedCurrentTime} / {formattedDuration}
        </div>
      {/if}
    </div>
  </div>

  <!-- Steps -->
  <div class="steps-container">
    {#each steps as step, index}
      <div 
        class="step"
        class:active={currentStep === index}
        data-time={step.time || 0}
      >
        <div class="step-content">
          <div class="step-number">{index + 1}</div>
          <h3>{step.title}</h3>
          <p>{@html step.text}</p>
          {#if step.time !== undefined}
            <div class="step-time">⏰ {formatTime(step.time)}</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .video-scrollytelling {
    position: relative;
    background: #000;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
  }

  .video-scrollytelling.full-width {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
  }

  /* Otimizações específicas para iOS */
  .video-scrollytelling.ios-device {
    -webkit-overflow-scrolling: touch;
  }

  .video-scrollytelling.low-power {
    /* Reduzir animações em modo economia */
  }

  .video-container {
    position: sticky;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    background: #000;
    margin-left: calc(-50vw + 50%);
  }

  .video-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    overflow: hidden;
  }

  video, .fallback-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .fallback-image {
    transition: opacity 0.3s ease;
  }

  .fallback-mode .video-wrapper {
    border: 2px solid #667eea;
  }

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    text-align: center;
    z-index: 5;
  }

  .loading-text {
    margin-top: 15px;
    font-size: 1.1rem;
    max-width: 250px;
  }

  .loading-text small {
    opacity: 0.7;
    font-size: 0.9rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  /* Reduzir animação em modo economia */
  .low-power .spinner {
    animation-duration: 2s;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .status-indicators {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }

  .status-badge {
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 3px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: bold;
  }

  .status-badge.ios {
    background: rgba(0,122,255,0.8);
  }

  .status-badge.low-power {
    background: rgba(255,149,0,0.8);
  }

  .status-badge.fallback {
    background: rgba(52,199,89,0.8);
  }

  .progress-bar {
    position: absolute;
    bottom: 15px;
    left: 15px;
    right: 15px;
    height: 4px;
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
    transition: width 0.1s ease;
  }

  /* iOS: transição mais lenta para economia */
  .ios-device .progress-fill {
    transition: width 0.3s ease;
  }

  .time-display {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
  }

  .steps-container {
    position: relative;
    z-index: 10;
    padding-top: 100vh;
  }

  .step {
    min-height: 120vh;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 2rem;
    opacity: 1;
  }

  .step.active .step-content {
    transform: scale(1.02);
    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
  }

  .step-content {
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 12px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    position: relative;
    z-index: 11;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .step-content h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
    font-weight: 600;
  }

  .step-content p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
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

  .step-time {
    font-size: 0.8rem;
    color: #999;
    font-family: monospace;
    background: rgba(0,0,0,0.05);
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
  }

  /* Mobile específico */
  @media (max-width: 768px) {
    .step {
      justify-content: center;
      padding: 1rem;
    }

    .step-content {
      max-width: 320px;
      padding: 1.5rem;
    }

    .video-wrapper {
      width: 95%;
    }
  }

  /* iPhone específico */
  @media (max-width: 480px) {
    .video-wrapper {
      width: 98%;
      border-radius: 6px;
    }

    .status-indicators {
      top: 5px;
      left: 5px;
    }

    .status-badge {
      font-size: 9px;
      padding: 2px 4px;
    }
  }

  /* Reduzir motion para economia de bateria */
  @media (prefers-reduced-motion: reduce) {
    .step, .progress-fill, .fallback-image {
      transition: none;
    }
    
    .spinner {
      animation: none;
    }
  }
</style>