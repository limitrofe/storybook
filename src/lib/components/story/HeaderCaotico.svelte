<!-- src/lib/components/story/HeaderCaotico.svelte -->
<script>
  import { onMount } from 'svelte';
  
  // Props customizáveis básicas
  export let title = 'HEADER CAÓTICO';
  export let subtitle = '40 mídias se movimentando dinamicamente';
  export let titleColor = '#232323';
  
  // 🆕 PROPS DE BACKGROUND PERSONALIZADO
  export let useCustomBackground = false; // Se true, usa background personalizado
  export let backgroundImage = ''; // Background desktop
  export let backgroundImageMobile = ''; // Background mobile
  export let backgroundVideo = ''; // Vídeo background desktop
  export let backgroundVideoMobile = ''; // Vídeo background mobile
  export let overlay = true; // Overlay escuro sobre o background
  export let overlayOpacity = 0.5; // Opacidade do overlay (0-1)
  
  // 🎪 PROPS DE MÍDIAS CAÓTICAS
  export let medias = []; // Array de mídias customizado (opcional)
  export let totalDefaultMedias = 40; // Quantas mídias padrão gerar se medias estiver vazio
  export let shuffleInterval = 3000; // Intervalo de rotação em ms
  export let animationDelay = 300; // Delay entre animações de entrada
  
  // 🎨 PROPS DE TAMANHO DAS MÍDIAS
  export let mediaWidth = 220; // Largura das mídias em pixels
  export let mediaHeight = 165; // Altura das mídias em pixels
  export let mediaSizeVariation = 0.4; // Variação de tamanho (0.8 + random * variation)
  export let mediaWidthMobile = 160; // Largura mobile
  export let mediaHeightMobile = 120; // Altura mobile

  // 🎯 DETECÇÃO AUTOMÁTICA - LINK COMPLETO EM PRODUÇÃO
  let baseUrl = '';
  let mediasWithPosition = [];
  
  // Verificar se tem background personalizado
  $: hasCustomBackground = useCustomBackground && (backgroundImage || backgroundImageMobile || backgroundVideo || backgroundVideoMobile);
  
  // Função para gerar a URL completa baseada no ambiente atual
  function getFullImageUrl(imagePath) {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      if (currentUrl.includes('s3.glbimg.com')) {
        // PRODUÇÃO: monta URL completa baseada na URL atual
        const urlParts = currentUrl.split('/');
        const baseUrl = urlParts.slice(0, urlParts.indexOf('index.html') || urlParts.length).join('/');
        return `${baseUrl}${imagePath}`;
      }
    }
    // LOCAL: path relativo
    return imagePath;
  }

  // Array padrão de mídias baseado na prop totalDefaultMedias
  let defaultMedias = [];
  
  // Função para gerar mídias padrão
  function generateDefaultMedias() {
    const videoCount = Math.min(2, Math.floor(totalDefaultMedias * 0.1)); // 10% de vídeos, máximo 2
    const imageCount = totalDefaultMedias - videoCount;
    
    // Detectar se está em localhost para usar imagens de exemplo
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('127.0.0.1'));
    
    defaultMedias = [
      // Vídeos de exemplo
      ...Array.from({ length: videoCount }, (_, i) => ({
        type: 'video',
        src: i === 0 
          ? 'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4'
          : 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
      })),
      
      // Imagens: usar URLs online se localhost, ou URLs do projeto se produção
      ...Array.from({ length: imageCount }, (_, i) => ({
        type: 'image',
        src: isLocalhost 
          ? `https://picsum.photos/300/200?random=${i + 1}`  // Imagens aleatórias do Picsum
          : getFullImageUrl(`/img/header/header${(i % 42) + 1}.jpg`) // Imagens do projeto
      }))
    ];
    
    console.log(`🎪 HeaderCaotico gerou ${defaultMedias.length} mídias (${videoCount} vídeos + ${imageCount} imagens)`);
    if (isLocalhost) {
      console.log('🌐 Usando imagens de exemplo online (localhost detectado)');
    }
  }

  // 🔥 SEMPRE usa as mídias caóticas (com ou sem background personalizado)
  $: sourceMedias = medias.length > 0 ? medias : defaultMedias;
  
  // Reagir a mudanças no totalDefaultMedias
  $: if (totalDefaultMedias) {
    generateDefaultMedias();
  }

  let loadedMedias = 0;

  // Função para gerar posições randômicas
  function generateRandomPosition() {
    return {
      left: Math.random() * 80 + 10, // 10% a 90%
      top: Math.random() * 80 + 10,  // 10% a 90%
      scale: Math.random() * mediaSizeVariation + (1 - mediaSizeVariation/2), // Baseado na prop
      rotation: Math.random() * 360,
      zIndex: Math.floor(Math.random() * 3) + 1 // 1, 2 ou 3
    };
  }

  // Configurar posições iniciais
  function setupMediaPositions() {
    mediasWithPosition = sourceMedias.map((media, index) => ({
      ...media,
      id: index,
      ...generateRandomPosition(),
      loaded: false
    }));
  }

  // Reorganizar elementos aleatoriamente
  function shufflePositions() {
    mediasWithPosition = mediasWithPosition.map(media => ({
      ...media,
      ...generateRandomPosition()
    }));
  }

  // Controlar quando mídia carrega
  function handleMediaLoad(mediaId) {
    loadedMedias++;
    const mediaIndex = mediasWithPosition.findIndex(m => m.id === mediaId);
    if (mediaIndex >= 0) {
      mediasWithPosition[mediaIndex].loaded = true;
      console.log(`✅ Mídia ${mediaId + 1} carregada (${loadedMedias}/${mediasWithPosition.length})`);
    }
  }
  
  // Debug function
  function debugMedias() {
    console.log('🔍 DEBUG HeaderCaotico:');
    console.log('   sourceMedias:', sourceMedias.length);
    console.log('   mediasWithPosition:', mediasWithPosition.length);
    console.log('   loadedMedias:', loadedMedias);
    console.log('   Primeiras 3 mídias:', sourceMedias.slice(0, 3));
  }

  onMount(() => {
    generateDefaultMedias(); // Gerar mídias padrão primeiro
    setupMediaPositions();
    
    // Debug
    setTimeout(() => {
      debugMedias();
    }, 1000);
    
    // Sempre iniciar shuffle das mídias caóticas
    const interval = setInterval(shufflePositions, shuffleInterval);
    return () => clearInterval(interval);
  });

  // Reagir a mudanças nas mídias ou configurações
  $: if (typeof window !== 'undefined') {
    setupMediaPositions();
  }
</script>

<header class="chaotic-header" class:custom-background={hasCustomBackground}>
  
  <!-- 🆕 BACKGROUND PERSONALIZADO (CAMADA 1) -->
  {#if hasCustomBackground}
    <div class="background-container">
      <!-- Background Mobile (padrão) -->
      {#if backgroundImageMobile}
        <div class="background-image mobile" style="background-image: url({backgroundImageMobile})"></div>
      {/if}
      {#if backgroundVideoMobile}
        <video class="background-video mobile" autoplay muted loop playsinline src={backgroundVideoMobile}>
          <track kind="captions" />
        </video>
      {/if}
      
      <!-- Background Desktop -->
      {#if backgroundImage}
        <div class="background-image desktop" style="background-image: url({backgroundImage})"></div>
      {/if}
      {#if backgroundVideo}
        <video class="background-video desktop" autoplay muted loop playsinline src={backgroundVideo}>
          <track kind="captions" />
        </video>
      {/if}
      
      <!-- Overlay -->
      {#if overlay}
        <div class="background-overlay" style="background: rgba(0, 0, 0, {overlayOpacity})"></div>
      {/if}
    </div>
  {/if}

  <!-- 🎪 MÍDIAS CAÓTICAS (CAMADA 2 - SEMPRE PRESENTES) -->
  <div class="media-container" style="
    --media-width: {mediaWidth}px; 
    --media-height: {mediaHeight}px;
    --media-width-mobile: {mediaWidthMobile}px;
    --media-height-mobile: {mediaHeightMobile}px;
  ">
    {#each mediasWithPosition as media (media.id)}
      <div 
        class="media-item z-level-{media.zIndex}"
        class:loaded={media.loaded}
        style="
          left: {media.left}%;
          top: {media.top}%;
          --scale: {media.scale};
          --rotation: {media.rotation}deg;
          transform: translate(-50%, -50%) rotate({media.rotation}deg) scale({media.scale});
          transition-delay: {media.id * animationDelay}ms;
        "
      >
        {#if media.type === 'video'}
          <video 
            src={media.src} 
            class="media-element video-element"
            autoplay 
            muted 
            loop 
            playsinline
            on:loadeddata={() => handleMediaLoad(media.id)}
          >
            <track kind="captions" />
          </video>
        {:else}
          <img 
            src={media.src} 
            alt="Mídia {media.id + 1}"
            class="media-element image-element"
            loading="eager"
            on:load={() => handleMediaLoad(media.id)}
            on:error={() => handleMediaLoad(media.id)}
          />
        {/if}
      </div>
    {/each}
  </div>

  <!-- 📝 TÍTULO (CAMADA 3 - MAIS ALTO Z-INDEX) -->
  <div class="header-content">
    <h1 class="main-title" style="color: {titleColor}">{title}</h1>
    <p class="subtitle">{subtitle}</p>
  </div>
</header>

<style>
  .chaotic-header {
    position: relative;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }

  /* 🆕 ESTILOS PARA BACKGROUND PERSONALIZADO (CAMADA 1) */
  .background-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1; /* Atrás das mídias caóticas */
  }

  .background-image,
  .background-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-size: cover;
    background-position: center;
  }

  /* Mobile first: mostra mobile por padrão */
  .background-image.desktop,
  .background-video.desktop {
    display: none;
  }

  .background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2; /* Acima do background, mas abaixo das mídias */
  }

  /* Desktop: esconde mobile e mostra desktop */
  @media (min-width: 769px) {
    .background-image.mobile,
    .background-video.mobile {
      display: none;
    }

    .background-image.desktop,
    .background-video.desktop {
      display: block;
    }
  }

  /* 🎪 ESTILOS DAS MÍDIAS CAÓTICAS (CAMADA 2) */
  .media-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5; /* Acima do background e overlay */
  }

  .media-item {
    position: absolute;
    opacity: 0;
    transition: all 5.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform, z-index;
    pointer-events: none;
  }

  .media-item.loaded {
    opacity: 1;
  }

  /* Níveis de Z-index para mídias caóticas (ACIMA DO BACKGROUND) */
  .z-level-1 {
    z-index: 6;
  }

  .z-level-2 {
    z-index: 7;
  }

  .z-level-3 {
    z-index: 8;
  }

  .media-element {
    width: var(--media-width, 220px);
    height: var(--media-height, 165px);
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 0 2px rgba(255, 255, 255, 0.1);
    filter: contrast(1.1) saturate(1.2);
  }

  .video-element {
    border: 2px solid rgba(255, 0, 0, 0.3);
  }

  .image-element {
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  /* 📝 CONTEÚDO DO HEADER */
  .header-content {
    position: relative;
    z-index: 10; /* Acima de todas as mídias */
    text-align: center;
    color: white;
    /* background: rgba(255, 255, 255, 0.95);
    padding: 2rem 3rem;
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px); */
  }

  .custom-background .header-content {
    /* background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px); */
  }

  .main-title {
    font-size: 4rem;
    font-weight: 900;
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background-size: 400% 400%;
  }

  .subtitle {
    font-size: 1.2rem;
    margin: 0;
    opacity: 0.9;
    font-weight: 300;
    color: #666;
  }

  /* Responsividade com props customizáveis */
  @media (max-width: 768px) {
    .media-container {
      --media-width: var(--media-width-mobile, 160px);
      --media-height: var(--media-height-mobile, 120px);
    }

    .main-title {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .header-content {
      /* padding: 1.5rem 2rem; */
    }
  }

  @media (max-width: 480px) {
    .media-container {
      --media-width: calc(var(--media-width-mobile, 160px) * 0.75);
      --media-height: calc(var(--media-height-mobile, 120px) * 0.75);
    }

    .main-title {
      font-size: 3rem;
      text-align: left;
      padding: 0;
      margin: 0;
      line-height: 3rem;
      padding-left: 2%;
      font-weight: 1000;
      font-style: normal;
    }

        .subtitle {
      font-size: 1.5rem;
      text-align: left;
      padding-left: 2%;
      line-height: 1.5rem;
    }
  }

  /* Performance otimizada */
  .media-item {
    transform-origin: center center;
    backface-visibility: hidden;
    perspective: 1000px;
  }

  /* Animação sutil de flutuação para elementos carregados */
  .media-item.loaded {
    animation: subtleFloat 8s ease-in-out infinite;
  }

  @keyframes subtleFloat {
    0%, 100% {
      transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) scale(var(--scale, 1)) translateY(0px);
    }
    50% {
      transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) scale(var(--scale, 1)) translateY(-3px);
    }
  }
</style>