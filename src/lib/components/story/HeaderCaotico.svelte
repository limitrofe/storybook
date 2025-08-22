<!-- src/lib/components/story/HeaderCaotico.svelte -->
<script>
  import { onMount } from 'svelte';
  
  // Props customizáveis
  export let title = 'HEADER CAÓTICO';
  export let subtitle = '40 mídias se movimentando dinamicamente';
  export let medias = []; // Array de mídias customizado (opcional)
  export let shuffleInterval = 3000; // Intervalo de rotação em ms
  export let animationDelay = 300; // Delay entre animações de entrada
  export let backgroundColor = '#fff';
  export let titleColor = '#232323';

  // 🎯 DETECÇÃO AUTOMÁTICA - LINK COMPLETO EM PRODUÇÃO
  let baseUrl = '';
  let mediasWithPosition = [];
  
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

  // Array padrão de 40 mídias se não for fornecido
  let defaultMedias = [
    // 2 vídeos de exemplo
    { 
      type: 'video', 
      src: 'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4'
    },
    { 
      type: 'video', 
      src: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
    },
    
    // 🎯 42 IMAGENS COM URLs COMPLETAS AUTOMÁTICAS
    ...Array.from({ length: 42 }, (_, i) => ({
      type: 'image',
      src: getFullImageUrl(`/img/header/header${i + 1}.jpg`)
    }))
  ];

  // Usar medias customizadas ou padrão
  $: sourceMedias = medias.length > 0 ? medias : defaultMedias;
  
  // Estado das mídias com propriedades de posicionamento
  let shuffleIntervalRef;
  let isLoaded = false;

  // Níveis de Z-index: 1 (fundo), 2 (meio), 3 (frente)
  const Z_LEVELS = [1, 2, 3];

  // Função para gerar posição aleatória
  function generateRandomPosition() {
    return {
      x: Math.random() * 90 + 5, // 5% a 95% da largura
      y: Math.random() * 90 + 5, // 5% a 95% da altura
      rotation: (Math.random() - 0.5) * 30, // -15° a +15°
      scale: 0.8 + Math.random() * 0.4, // 0.8x a 1.2x
      zLevel: Z_LEVELS[Math.floor(Math.random() * Z_LEVELS.length)]
    };
  }

  // Inicializar todas as mídias com posições
  function initializeMedias() {
    mediasWithPosition = sourceMedias.map((media, index) => ({
      ...media,
      id: index,
      loaded: false,
      ...generateRandomPosition()
    }));
    console.log(`🌪️ Inicializadas ${mediasWithPosition.length} mídias`);
    
    // 🎯 LOG DAS PRIMEIRAS URLs PARA DEBUG
    if (mediasWithPosition.length > 0) {
      console.log('🖼️ Primeira imagem:', mediasWithPosition[2]?.src);
      console.log('🖼️ Última imagem:', mediasWithPosition[mediasWithPosition.length - 1]?.src);
    }
  }

  // Função para embaralhar z-levels (movimento das camadas)
  function shuffleZLevels() {
    mediasWithPosition = mediasWithPosition.map(media => ({
      ...media,
      zLevel: Z_LEVELS[Math.floor(Math.random() * Z_LEVELS.length)]
    }));
  }

  // Função para movimento sutil (pequenos ajustes de posição)
  function subtleMovement() {
    mediasWithPosition = mediasWithPosition.map(media => ({
      ...media,
      x: Math.max(5, Math.min(95, media.x + (Math.random() - 0.5) * 10)), // movimento de até 5%
      y: Math.max(5, Math.min(95, media.y + (Math.random() - 0.5) * 10)),
      rotation: media.rotation + (Math.random() - 0.5) * 10 // rotação de até 5°
    }));
  }

  // Marcar mídia como carregada
  function handleMediaLoad(index) {
    if (mediasWithPosition[index]) {
      mediasWithPosition[index].loaded = true;
      
      // Verificar se todas estão carregadas
      const allLoaded = mediasWithPosition.every(media => media.loaded);
      if (allLoaded && !isLoaded) {
        isLoaded = true;
        console.log('✅ Todas as mídias carregaram!');
        startAnimations();
      }
    }
  }

  // Iniciar animações após carregamento
  function startAnimations() {
    // Movimento sutil a cada 1 segundo
    setInterval(subtleMovement, 100000);
    
    // Embaralhar z-levels no intervalo especificado
    shuffleIntervalRef = setInterval(shuffleZLevels, shuffleInterval);
  }

  onMount(() => {
    // LOG DE DEBUG
    console.log('🌍 URL atual:', window.location.href);
    console.log('🖼️ Primeira imagem:', defaultMedias[2]?.src);
    console.log('🖼️ Última imagem:', defaultMedias[defaultMedias.length - 1]?.src);
    
    initializeMedias();
    
    // Fallback: se algumas mídias não carregarem, iniciar mesmo assim após 5 segundos
    setTimeout(() => {
      if (!isLoaded) {
        console.log('⚠️ Timeout: iniciando animações mesmo com mídias não carregadas');
        isLoaded = true;
        startAnimations();
      }
    }, 5000);

    return () => {
      if (shuffleIntervalRef) {
        clearInterval(shuffleIntervalRef);
      }
    };
  });
</script>

<header class="chaotic-header">
  <!-- Container das mídias -->
  <div class="media-container">
    {#each mediasWithPosition as media (media.id)}
      <div 
        class="media-item z-level-{media.zLevel}"
        class:loaded={media.loaded}
        style="
          left: {media.x}%;
          top: {media.y}%;
          transform: translate(-50%, -50%) rotate({media.rotation}deg) scale({media.scale});
        "
      >
        {#if media.type === 'video'}
          <video 
            src={media.src}
            autoplay 
            muted 
            loop 
            playsinline
            class="media-element video-element"
            on:loadeddata={() => handleMediaLoad(media.id)}
            on:error={() => handleMediaLoad(media.id)}
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

  <!-- Título sobreposto (z-index mais alto) -->
  <div class="header-content">
    <h1 class="main-title">{title}</h1>
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
  }

  .media-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
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

  /* Níveis de Z-index */
  .z-level-1 {
    z-index: 1;
  }

  .z-level-2 {
    z-index: 2;
  }

  .z-level-3 {
    z-index: 3;
  }

  .media-element {
    width: 220px;
    height: 165px;
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

  .header-content {
    position: relative;
    z-index: 10; /* Acima de todas as mídias */
    text-align: center;
    color: white;
    background: #fff;
    padding: 2rem 3rem;
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .main-title {
    font-size: 4rem;
    font-weight: 900;
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background-size: 400% 400%;
    color: #232323;
  }

  .subtitle {
    font-size: 1.2rem;
    margin: 0;
    opacity: 0.9;
    font-weight: 300;
    color: #666;
  }

  /* Responsividade */
  @media (max-width: 768px) {
    .main-title {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .header-content {
      padding: 1.5rem 2rem;
    }

    .media-element {
      width: 160px;
      height: 120px;
    }
  }

  @media (max-width: 480px) {
    .main-title {
      font-size: 2rem;
    }

    .media-element {
      width: 120px;
      height: 90px;
    }
  }

  /* Performance otimizada */
  .media-item {
    transform-origin: center center;
    backface-visibility: hidden;
    perspective: 1000px;
  }

  /* Efeitos visuais de fundo */
  .chaotic-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;
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