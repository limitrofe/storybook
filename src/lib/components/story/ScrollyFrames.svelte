<!-- src/lib/components/story/ScrollyFrames.svelte -->
<script>
  // ScrollyFrames.svelte - Componente de ScrollyTelling Otimizado
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  // === PROPS ===
  export let framePrefix = ''; // URL base dos frames: https://example.com/frames/frame_
  export let framePrefixMobile = ''; // URL base mobile (usa framePrefix se vazio)
  export let totalFrames = 100; // Número total de frames
  export let frameExtension = '.jpg'; // Extensão dos frames (.jpg, .webp, .png)
  export let frameExtensionMobile = '.webp'; // Extensão mobile
  export let framePadding = 4; // Zeros à esquerda (0001, 0002, etc)
  export let startFrame = 1; // Frame inicial
  export let endFrame = null; // Frame final (null = totalFrames)
  
  // Performance Settings
  export let preloadRadius = 5; // Quantos frames pré-carregar ao redor do atual
  export let maxMemoryMB = 50; // Limite de memória em MB
  export let throttleMs = 16; // Throttle do scroll (60fps = 16ms)
  export let lazyLoadThreshold = 0.1; // Quando começar a carregar (10% na tela)
  
  // UI Settings
  export let showProgress = true;
  export let showFrameCounter = false;
  export let className = '';
  export let height = '400vh'; // ✅ ALTURA TOTAL DO SCROLL CONTAINER

  // === ESTADO INTERNO ===
  let scrollContainer; // ✅ Container do scroll (altura total)
  let stickyPlayer; // ✅ Player fixo (100vh)
  let canvas;
  let ctx;
  let observer;
  
  // Controle de frames
  let currentFrame = startFrame;
  let frames = new Map(); // Cache de imagens carregadas
  let loadingFrames = new Set(); // Frames sendo carregados
  let failedFrames = new Set(); // Frames que falharam
  
  // Performance
  let memoryUsage = 0;
  let isInView = false;
  let lastScrollTime = 0;
  let rafId = null;
  
  // Estado da UI
  let isLoading = true;
  let loadProgress = 0;
  let error = null;

  // Detectar se é mobile
  let isMobile = false;

  // === COMPUTED ===
  $: finalFrame = endFrame || totalFrames;
  $: frameRange = finalFrame - startFrame + 1;
  $: progressPercent = ((currentFrame - startFrame) / (frameRange - 1)) * 100;
  $: currentFramePrefix = isMobile && framePrefixMobile ? framePrefixMobile : framePrefix;
  $: currentFrameExtension = isMobile && frameExtensionMobile ? frameExtensionMobile : frameExtension;

  // === LIFECYCLE ===
  onMount(() => {
    if (!browser) return;
    
    // Detectar mobile
    isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    initializeComponent();
  });

  onDestroy(() => {
    cleanup();
  });

  // === INICIALIZAÇÃO ===
  async function initializeComponent() {
    try {
      // Setup canvas
      setupCanvas();
      
      // Setup intersection observer
      setupObserver();
      
      // Pré-carregar frames iniciais
      await preloadInitialFrames();
      
      isLoading = false;
    } catch (err) {
      console.error('Erro ao inicializar ScrollyFrames:', err);
      error = err.message;
      isLoading = false;
    }
  }

  function setupCanvas() {
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    // Configurar canvas responsivo
    const resizeCanvas = () => {
      if (!stickyPlayer) return;
      const rect = stickyPlayer.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Redesenhar frame atual
      if (frames.has(currentFrame)) {
        drawFrame(currentFrame);
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function setupObserver() {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          isInView = entry.isIntersecting;
          
          if (isInView) {
            startScrollTracking();
          } else {
            stopScrollTracking();
          }
        });
      },
      { threshold: lazyLoadThreshold }
    );

    if (scrollContainer) {
      observer.observe(scrollContainer);
    }
  }

  // === CARREGAMENTO DE FRAMES ===
  async function preloadInitialFrames() {
    // Carregar primeiro frame imediatamente
    await loadFrame(startFrame);
    drawFrame(startFrame);
    
    // Carregar alguns frames ao redor do inicial
    const initialFrames = [];
    for (let i = 1; i <= Math.min(preloadRadius, 10); i++) {
      const frame = startFrame + i;
      if (frame <= finalFrame) {
        initialFrames.push(loadFrame(frame));
      }
    }
    
    await Promise.allSettled(initialFrames);
    updateLoadProgress();
  }

  async function loadFrame(frameNum) {
    if (frames.has(frameNum) || loadingFrames.has(frameNum) || failedFrames.has(frameNum)) {
      return frames.get(frameNum);
    }

    loadingFrames.add(frameNum);

    try {
      const img = new Image();
      const frameUrl = getFrameUrl(frameNum);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = frameUrl;
      });

      // Calcular uso de memória (aproximado)
      const imageSize = (img.width * img.height * 4) / (1024 * 1024); // RGBA em MB
      memoryUsage += imageSize;

      frames.set(frameNum, img);
      loadingFrames.delete(frameNum);
      
      // Limpar memória se necessário
      cleanupMemory();
      
      return img;
    } catch (err) {
      console.warn(`Falha ao carregar frame ${frameNum}:`, err);
      failedFrames.add(frameNum);
      loadingFrames.delete(frameNum);
      throw err;
    }
  }

  function getFrameUrl(frameNum) {
    const paddedNum = String(frameNum).padStart(framePadding, '0');
    return `${currentFramePrefix}${paddedNum}${currentFrameExtension}`;
  }

  function cleanupMemory() {
    if (memoryUsage <= maxMemoryMB) return;

    // Remover frames mais distantes do atual
    const toRemove = [];
    
    for (const [frameNum] of frames) {
      const distance = Math.abs(frameNum - currentFrame);
      if (distance > preloadRadius * 2) {
        toRemove.push(frameNum);
      }
    }

    toRemove.forEach(frameNum => {
      const img = frames.get(frameNum);
      if (img) {
        const imageSize = (img.width * img.height * 4) / (1024 * 1024);
        memoryUsage -= imageSize;
        frames.delete(frameNum);
      }
    });
  }

  // === SCROLL TRACKING ===
  function startScrollTracking() {
    if (rafId) return;
    
    const handleScroll = () => {
      const now = performance.now();
      if (now - lastScrollTime < throttleMs) return;
      
      lastScrollTime = now;
      updateFrameFromScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // RAF para animações suaves
    const animate = () => {
      if (isInView) {
        rafId = requestAnimationFrame(animate);
      }
    };
    animate();
  }

  function stopScrollTracking() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // ✅ LÓGICA CORRIGIDA: Scroll baseado no container total
  function updateFrameFromScroll() {
    if (!scrollContainer) return;

    const rect = scrollContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calcular progresso baseado na posição do scroll
    let progress = 0;
    
    if (rect.top <= 0 && rect.bottom >= windowHeight) {
      // Container está "passando" pela viewport
      const scrolled = Math.abs(rect.top);
      const scrollableHeight = rect.height - windowHeight;
      progress = scrolled / scrollableHeight;
    } else if (rect.top > 0) {
      // Container ainda não chegou
      progress = 0;
    } else {
      // Container já passou
      progress = 1;
    }

    // Limitar progresso entre 0 e 1
    progress = Math.max(0, Math.min(1, progress));
    
    // Calcular frame baseado no progresso
    const targetFrame = Math.round(startFrame + (frameRange - 1) * progress);
    
    if (targetFrame !== currentFrame) {
      currentFrame = targetFrame;
      renderCurrentFrame();
      preloadNearbyFrames();
    }
  }

  async function renderCurrentFrame() {
    if (!ctx || !frames.has(currentFrame)) {
      // Tentar carregar o frame se não estiver disponível
      try {
        await loadFrame(currentFrame);
      } catch (err) {
        return; // Frame falhou, manter o anterior
      }
    }

    drawFrame(currentFrame);
  }

  function drawFrame(frameNum) {
    if (!ctx || !frames.has(frameNum)) return;

    const img = frames.get(frameNum);
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Limpar canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calcular dimensões mantendo aspect ratio
    const imgAspect = img.width / img.height;
    const canvasAspect = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspect > canvasAspect) {
      // Imagem mais larga - ajustar pela altura
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imgAspect;
      drawX = (canvasWidth - drawWidth) / 2;
      drawY = 0;
    } else {
      // Imagem mais alta - ajustar pela largura
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgAspect;
      drawX = 0;
      drawY = (canvasHeight - drawHeight) / 2;
    }

    // Desenhar imagem
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  async function preloadNearbyFrames() {
    const promises = [];
    
    for (let i = -preloadRadius; i <= preloadRadius; i++) {
      const frameNum = currentFrame + i;
      if (frameNum >= startFrame && frameNum <= finalFrame) {
        promises.push(loadFrame(frameNum).catch(() => {})); // Ignorar erros
      }
    }

    await Promise.allSettled(promises);
    updateLoadProgress();
  }

  function updateLoadProgress() {
    const totalFramesToLoad = Math.min(frameRange, preloadRadius * 2 + 1);
    const loadedCount = Array.from(frames.keys()).length;
    loadProgress = (loadedCount / totalFramesToLoad) * 100;
  }

  // === CLEANUP ===
  function cleanup() {
    if (observer) {
      observer.disconnect();
    }
    
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    stopScrollTracking();
    
    // Limpar todas as imagens da memória
    frames.clear();
    memoryUsage = 0;
  }
</script>

<!-- ✅ TEMPLATE CORRIGIDO: Container de scroll + Player sticky -->
<div 
  bind:this={scrollContainer}
  class="scrolly-scroll-container {className}"
  style="height: {height};"
>
  <!-- Player sticky que fica fixo na tela -->
  <div 
    bind:this={stickyPlayer}
    class="scrolly-sticky-player"
  >
    <!-- Canvas principal -->
    <canvas 
      bind:this={canvas}
      class="scrolly-canvas"
    ></canvas>

    <!-- Loading State -->
    {#if isLoading}
      <div class="scrolly-loading">
        <div class="loading-spinner"></div>
        <p>Carregando frames...</p>
        {#if loadProgress > 0}
          <div class="loading-progress">
            <div class="progress-bar" style="width: {loadProgress}%"></div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Error State -->
    {#if error}
      <div class="scrolly-error">
        <h3>Erro ao carregar</h3>
        <p>{error}</p>
      </div>
    {/if}

    <!-- Progress Indicator -->
    {#if showProgress && !isLoading && !error}
      <div class="scrolly-progress">
        <div class="progress-track">
          <div class="progress-fill" style="width: {progressPercent}%"></div>
        </div>
      </div>
    {/if}

    <!-- Frame Counter -->
    {#if showFrameCounter && !isLoading && !error}
      <div class="scrolly-counter">
        Frame {currentFrame} / {finalFrame}
      </div>
    {/if}
  </div>
</div>

<style>
  /* ✅ Container de scroll com altura total */
  .scrolly-scroll-container {
    position: relative;
    width: 100%;
    /* altura definida pela prop (ex: 400vh) */
  }

  /* ✅ Player sticky que fica fixo na tela */
  .scrolly-sticky-player {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    background: #000;
    overflow: hidden;
    z-index: 1;
  }

  .scrolly-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .scrolly-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white;
    z-index: 10;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  .loading-progress {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
    margin: 10px auto;
  }

  .progress-bar {
    height: 100%;
    background: white;
    transition: width 0.3s ease;
  }

  .scrolly-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #ff6b6b;
    z-index: 10;
  }

  .scrolly-progress {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    z-index: 5;
  }

  .progress-track {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: white;
    transition: width 0.1s ease;
  }

  .scrolly-counter {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
    z-index: 5;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsivo */
  @media (max-width: 768px) {
    .scrolly-progress {
      bottom: 10px;
      left: 10px;
      right: 10px;
    }

    .scrolly-counter {
      top: 10px;
      right: 10px;
      padding: 6px 8px;
      font-size: 12px;
    }
  }
</style>