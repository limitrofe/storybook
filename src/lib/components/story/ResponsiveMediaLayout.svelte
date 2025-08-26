<!-- ResponsiveMediaLayout.svelte -->
<script>
  import { onMount } from 'svelte';

  // ===== CONTROLE DE ALTURA =====
  export let heightDesktop = '100vh';
  export let heightMobile = '100vh';
  
  // ===== BACKGROUND =====
  export let backgroundType = 'color'; // 'color', 'image', 'video'
  export let backgroundColor = '#000000';
  
  // Background Image
  export let backgroundImageDesktop = '';
  export let backgroundImageMobile = '';
  export let backgroundPositionDesktop = 'center center';
  export let backgroundPositionMobile = 'center center';
  export let backgroundSizeDesktop = 'cover';
  export let backgroundSizeMobile = 'cover';
  
  // Background Video
  export let backgroundVideoDesktop = '';
  export let backgroundVideoMobile = '';
  
  // ===== TEXTOS =====
  export let textos = [
    // Exemplo de estrutura:
    // {
    //   content: 'Meu texto aqui',
    //   fontFamily: 'obviously',
    //   fontSize: { desktop: '3rem', mobile: '2rem' },
    //   fontWeight: { desktop: '700', mobile: '600' },
    //   lineHeight: { desktop: '1.2', mobile: '1.3' },
    //   textAlign: { desktop: 'center', mobile: 'left' },
    //   letterSpacing: { desktop: '0px', mobile: '0px' },
    //   color: '#ffffff',
    //   position: { 
    //     desktop: { x: '50%', y: '50%', z: '10' }, 
    //     mobile: { x: '50%', y: '30%', z: '10' } 
    //   },
    //   transform: { desktop: 'translate(-50%, -50%)', mobile: 'translate(-50%, -50%)' }
    // }
  ];
  
  // ===== IMAGENS =====
  export let imagens = [
    // Exemplo de estrutura:
    // {
    //   srcDesktop: '/image-desktop.jpg',
    //   srcMobile: '/image-mobile.jpg',
    //   alt: 'Descrição da imagem',
    //   width: { desktop: '300px', mobile: '200px' },
    //   height: { desktop: 'auto', mobile: 'auto' },
    //   objectFit: { desktop: 'cover', mobile: 'contain' },
    //   position: {
    //     desktop: { x: '20%', y: '10%', z: '5' },
    //     mobile: { x: '50%', y: '60%', z: '5' }
    //   },
    //   transform: { desktop: 'none', mobile: 'translateX(-50%)' }
    // }
  ];

  // Estado para controle de responsividade
  let isMobile = false;

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth <= 768;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  });

  // Função para obter valores responsivos
  function getResponsiveValue(value, device = null) {
    if (typeof value === 'object' && value !== null) {
      const targetDevice = device || (isMobile ? 'mobile' : 'desktop');
      return value[targetDevice] || value.desktop || value.mobile || '';
    }
    return value || '';
  }

  // Gerar estilos dinâmicos para o container principal
  $: containerStyle = `
    --height-desktop: ${heightDesktop};
    --height-mobile: ${heightMobile};
    --bg-color: ${backgroundColor};
    ${backgroundType === 'image' ? `
      --bg-image-desktop: url(${backgroundImageDesktop});
      --bg-image-mobile: url(${backgroundImageMobile});
      --bg-position-desktop: ${backgroundPositionDesktop};
      --bg-position-mobile: ${backgroundPositionMobile};
      --bg-size-desktop: ${backgroundSizeDesktop};
      --bg-size-mobile: ${backgroundSizeMobile};
    ` : ''}
  `;

  // Gerar estilos para textos
function getTextStyles(texto, index) {
  const desktop = {
    fontSize: getResponsiveValue(texto.fontSize, 'desktop'),
    fontWeight: getResponsiveValue(texto.fontWeight, 'desktop'),
    lineHeight: getResponsiveValue(texto.lineHeight, 'desktop'),
    textAlign: getResponsiveValue(texto.textAlign, 'desktop'),
    letterSpacing: getResponsiveValue(texto.letterSpacing, 'desktop'),
    left: getResponsiveValue(texto.position, 'desktop')?.x || texto.xDesktop || '0',
    top: getResponsiveValue(texto.position, 'desktop')?.y || texto.yDesktop || '0',
    zIndex: getResponsiveValue(texto.position, 'desktop')?.z || '1',
    transform: getResponsiveValue(texto.transform, 'desktop') || texto.transformDesktop || 'none',
    
    // 🔧 CORREÇÃO: Capturar maxWidth diretamente do objeto texto
    width: texto.widthDesktop || 'auto',
    maxWidth: texto.maxWidthDesktop || 'none',  // 📍 AQUI
    minWidth: texto.minWidthDesktop || 'auto'
  };

  const mobile = {
    fontSize: getResponsiveValue(texto.fontSize, 'mobile'),
    fontWeight: getResponsiveValue(texto.fontWeight, 'mobile'),
    lineHeight: getResponsiveValue(texto.lineHeight, 'mobile'),
    textAlign: getResponsiveValue(texto.textAlign, 'mobile'),
    letterSpacing: getResponsiveValue(texto.letterSpacing, 'mobile'),
    left: getResponsiveValue(texto.position, 'mobile')?.x || texto.xMobile || '0',
    top: getResponsiveValue(texto.position, 'mobile')?.y || texto.yMobile || '0',
    zIndex: getResponsiveValue(texto.position, 'mobile')?.z || '1',
    transform: getResponsiveValue(texto.transform, 'mobile') || texto.transformMobile || 'none',
    
    // 🔧 CORREÇÃO: Capturar maxWidth diretamente do objeto texto
    width: texto.widthMobile || 'auto',
    maxWidth: texto.maxWidthMobile || 'none',  // 📍 AQUI  
    minWidth: texto.minWidthMobile || 'auto'
  };

  return `
    --text-${index}-font-size-desktop: ${desktop.fontSize};
    --text-${index}-font-weight-desktop: ${desktop.fontWeight};
    --text-${index}-line-height-desktop: ${desktop.lineHeight};
    --text-${index}-text-align-desktop: ${desktop.textAlign};
    --text-${index}-letter-spacing-desktop: ${desktop.letterSpacing};
    --text-${index}-left-desktop: ${desktop.left};
    --text-${index}-top-desktop: ${desktop.top};
    --text-${index}-z-index-desktop: ${desktop.zIndex};
    --text-${index}-transform-desktop: ${desktop.transform};
    --text-${index}-width-desktop: ${desktop.width};
    --text-${index}-max-width-desktop: ${desktop.maxWidth};
    --text-${index}-min-width-desktop: ${desktop.minWidth};
    
    --text-${index}-font-size-mobile: ${mobile.fontSize};
    --text-${index}-font-weight-mobile: ${mobile.fontWeight};
    --text-${index}-line-height-mobile: ${mobile.lineHeight};
    --text-${index}-text-align-mobile: ${mobile.textAlign};
    --text-${index}-letter-spacing-mobile: ${mobile.letterSpacing};
    --text-${index}-left-mobile: ${mobile.left};
    --text-${index}-top-mobile: ${mobile.top};
    --text-${index}-z-index-mobile: ${mobile.zIndex};
    --text-${index}-transform-mobile: ${mobile.transform};
    --text-${index}-width-mobile: ${mobile.width};
    --text-${index}-max-width-mobile: ${mobile.maxWidth};
    --text-${index}-min-width-mobile: ${mobile.minWidth};
    
    color: ${texto.color || '#ffffff'};
    font-family: ${texto.fontFamily || 'inherit'};
  `;
}



  // Gerar estilos para imagens
  function getImageStyles(imagem, index) {
    const desktop = {
      width: getResponsiveValue(imagem.width, 'desktop'),
      height: getResponsiveValue(imagem.height, 'desktop'),
      objectFit: getResponsiveValue(imagem.objectFit, 'desktop'),
      left: getResponsiveValue(imagem.position, 'desktop')?.x || '0',
      top: getResponsiveValue(imagem.position, 'desktop')?.y || '0',
      zIndex: getResponsiveValue(imagem.position, 'desktop')?.z || '1',
      transform: getResponsiveValue(imagem.transform, 'desktop')
    };

    const mobile = {
      width: getResponsiveValue(imagem.width, 'mobile'),
      height: getResponsiveValue(imagem.height, 'mobile'),
      objectFit: getResponsiveValue(imagem.objectFit, 'mobile'),
      left: getResponsiveValue(imagem.position, 'mobile')?.x || '0',
      top: getResponsiveValue(imagem.position, 'mobile')?.y || '0',
      zIndex: getResponsiveValue(imagem.position, 'mobile')?.z || '1',
      transform: getResponsiveValue(imagem.transform, 'mobile')
    };

    return `
      --img-${index}-width-desktop: ${desktop.width};
      --img-${index}-height-desktop: ${desktop.height};
      --img-${index}-object-fit-desktop: ${desktop.objectFit};
      --img-${index}-left-desktop: ${desktop.left};
      --img-${index}-top-desktop: ${desktop.top};
      --img-${index}-z-index-desktop: ${desktop.zIndex};
      --img-${index}-transform-desktop: ${desktop.transform};
      
      --img-${index}-width-mobile: ${mobile.width};
      --img-${index}-height-mobile: ${mobile.height};
      --img-${index}-object-fit-mobile: ${mobile.objectFit};
      --img-${index}-left-mobile: ${mobile.left};
      --img-${index}-top-mobile: ${mobile.top};
      --img-${index}-z-index-mobile: ${mobile.zIndex};
      --img-${index}-transform-mobile: ${mobile.transform};
    `;
  }
</script>

<section class="responsive-layout" style={containerStyle} class:bg-image={backgroundType === 'image'}>
  
  <!-- Background Video -->
  {#if backgroundType === 'video'}
    <div class="background-video">
      <picture>
        <source 
          media="(max-width: 768px)" 
          src={backgroundVideoMobile}
          type="video/mp4"
        >
        <video 
          src={backgroundVideoDesktop}
          autoplay 
          loop 
          muted 
          playsinline
          class="video-element"
        ></video>
      </picture>
    </div>
  {/if}

  <!-- Textos -->
  {#each textos as texto, index}
    <div 
      class="text-element text-{index}" 
      style={getTextStyles(texto, index)}
    >
      {@html texto.content}
    </div>
  {/each}

  <!-- Imagens -->
  {#each imagens as imagem, index}
    <div 
      class="image-element image-{index}" 
      style={getImageStyles(imagem, index)}
    >
      <picture>
        <source 
          media="(max-width: 768px)" 
          srcset={imagem.srcMobile}
        >
        <img 
          src={imagem.srcDesktop} 
          alt={imagem.alt || ''}
          class="responsive-image"
        />
      </picture>
    </div>
  {/each}

</section>

<style>
  /* ===== CONTAINER PRINCIPAL ===== */
  .responsive-layout {
    position: relative;
    width: 100%;
    min-height: var(--height-mobile);
    background-color: var(--bg-color);
    overflow: hidden;
    box-sizing: border-box;
  }

  /* Background com imagem */
  .bg-image {
    background-image: var(--bg-image-mobile);
    background-position: var(--bg-position-mobile);
    background-size: var(--bg-size-mobile);
    background-repeat: no-repeat;
  }

  /* ===== BACKGROUND VIDEO ===== */
  .background-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .video-element {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* ===== TEXTOS ===== */
  .text-element {
    position: absolute;
    pointer-events: none;
  }

  /* Estilos dinâmicos para textos - Mobile */
  .text-0 {
    font-size: var(--text-0-font-size-mobile);
    font-weight: var(--text-0-font-weight-mobile);
    line-height: var(--text-0-line-height-mobile);
    text-align: var(--text-0-text-align-mobile);
    letter-spacing: var(--text-0-letter-spacing-mobile);
    left: var(--text-0-left-mobile);
    top: var(--text-0-top-mobile);
    z-index: var(--text-0-z-index-mobile);
    transform: var(--text-0-transform-mobile);
    width: var(--text-0-width-mobile);
    max-width: var(--text-0-max-width-mobile);
    min-width: var(--text-0-min-width-mobile);
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
  }

  .text-1 {
    font-size: var(--text-1-font-size-mobile);
    font-weight: var(--text-1-font-weight-mobile);
    line-height: var(--text-1-line-height-mobile);
    text-align: var(--text-1-text-align-mobile);
    letter-spacing: var(--text-1-letter-spacing-mobile);
    left: var(--text-1-left-mobile);
    top: var(--text-1-top-mobile);
    z-index: var(--text-1-z-index-mobile);
    transform: var(--text-1-transform-mobile);
        width: var(--text-1-width-mobile);
    max-width: var(--text-1-max-width-mobile);
    min-width: var(--text-1-min-width-mobile);
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
  }

  .text-2 {
    font-size: var(--text-2-font-size-mobile);
    font-weight: var(--text-2-font-weight-mobile);
    line-height: var(--text-2-line-height-mobile);
    text-align: var(--text-2-text-align-mobile);
    letter-spacing: var(--text-2-letter-spacing-mobile);
    left: var(--text-2-left-mobile);
    top: var(--text-2-top-mobile);
    z-index: var(--text-2-z-index-mobile);
    transform: var(--text-2-transform-mobile);
        width: var(--text-2-width-mobile);
    max-width: var(--text-2-max-width-mobile);
    min-width: var(--text-2-min-width-mobile);
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
  }

  .text-3 {
    font-size: var(--text-3-font-size-mobile);
    font-weight: var(--text-3-font-weight-mobile);
    line-height: var(--text-3-line-height-mobile);
    text-align: var(--text-3-text-align-mobile);
    letter-spacing: var(--text-3-letter-spacing-mobile);
    left: var(--text-3-left-mobile);
    top: var(--text-3-top-mobile);
    z-index: var(--text-3-z-index-mobile);
    transform: var(--text-3-transform-mobile);
        width: var(--text-3-width-mobile);
    max-width: var(--text-3-max-width-mobile);
    min-width: var(--text-3-min-width-mobile);
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
  }

  .text-4 {
    font-size: var(--text-4-font-size-mobile);
    font-weight: var(--text-4-font-weight-mobile);
    line-height: var(--text-4-line-height-mobile);
    text-align: var(--text-4-text-align-mobile);
    letter-spacing: var(--text-4-letter-spacing-mobile);
    left: var(--text-4-left-mobile);
    top: var(--text-4-top-mobile);
    z-index: var(--text-4-z-index-mobile);
    transform: var(--text-4-transform-mobile);
        width: var(--text-4-width-mobile);
    max-width: var(--text-4-max-width-mobile);
    min-width: var(--text-4-min-width-mobile);
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
  }

  /* ===== IMAGENS ===== */
  .image-element {
    position: absolute;
  }

  .responsive-image {
    display: block;
    max-width: none; /* Permite ultrapassar limites do container */
  }

  /* Estilos dinâmicos para imagens - Mobile */
  .image-0 {
    width: var(--img-0-width-mobile);
    height: var(--img-0-height-mobile);
    left: var(--img-0-left-mobile);
    top: var(--img-0-top-mobile);
    z-index: var(--img-0-z-index-mobile);
    transform: var(--img-0-transform-mobile);
  }

  .image-0 .responsive-image {
    object-fit: var(--img-0-object-fit-mobile);
    width: 100%;
    height: 100%;
  }

  .image-1 {
    width: var(--img-1-width-mobile);
    height: var(--img-1-height-mobile);
    left: var(--img-1-left-mobile);
    top: var(--img-1-top-mobile);
    z-index: var(--img-1-z-index-mobile);
    transform: var(--img-1-transform-mobile);
  }

  .image-1 .responsive-image {
    object-fit: var(--img-1-object-fit-mobile);
    width: 100%;
    height: 100%;
  }

  .image-2 {
    width: var(--img-2-width-mobile);
    height: var(--img-2-height-mobile);
    left: var(--img-2-left-mobile);
    top: var(--img-2-top-mobile);
    z-index: var(--img-2-z-index-mobile);
    transform: var(--img-2-transform-mobile);
  }

  .image-2 .responsive-image {
    object-fit: var(--img-2-object-fit-mobile);
    width: 100%;
    height: 100%;
  }

  .image-3 {
    width: var(--img-3-width-mobile);
    height: var(--img-3-height-mobile);
    left: var(--img-3-left-mobile);
    top: var(--img-3-top-mobile);
    z-index: var(--img-3-z-index-mobile);
    transform: var(--img-3-transform-mobile);
  }

  .image-3 .responsive-image {
    object-fit: var(--img-3-object-fit-mobile);
    width: 100%;
    height: 100%;
  }

  .image-4 {
    width: var(--img-4-width-mobile);
    height: var(--img-4-height-mobile);
    left: var(--img-4-left-mobile);
    top: var(--img-4-top-mobile);
    z-index: var(--img-4-z-index-mobile);
    transform: var(--img-4-transform-mobile);
  }

  .image-4 .responsive-image {
    object-fit: var(--img-4-object-fit-mobile);
    width: 100%;
    height: 100%;
  }

  /* ===== DESKTOP - 769px+ ===== */
  @media (min-width: 769px) {
    .responsive-layout {
      min-height: var(--height-desktop);
    }

    .bg-image {
      background-image: var(--bg-image-desktop);
      background-position: var(--bg-position-desktop);
      background-size: var(--bg-size-desktop);
    }

    /* Textos Desktop */
    .text-0 {
      font-size: var(--text-0-font-size-desktop);
      font-weight: var(--text-0-font-weight-desktop);
      line-height: var(--text-0-line-height-desktop);
      text-align: var(--text-0-text-align-desktop);
      letter-spacing: var(--text-0-letter-spacing-desktop);
      left: var(--text-0-left-desktop);
      top: var(--text-0-top-desktop);
      z-index: var(--text-0-z-index-desktop);
      transform: var(--text-0-transform-desktop);
          width: var(--text-0-width-desktop);
    max-width: var(--text-0-max-width-desktop);
    min-width: var(--text-0-min-width-desktop);
    }

    .text-1 {
      font-size: var(--text-1-font-size-desktop);
      font-weight: var(--text-1-font-weight-desktop);
      line-height: var(--text-1-line-height-desktop);
      text-align: var(--text-1-text-align-desktop);
      letter-spacing: var(--text-1-letter-spacing-desktop);
      left: var(--text-1-left-desktop);
      top: var(--text-1-top-desktop);
      z-index: var(--text-1-z-index-desktop);
      transform: var(--text-1-transform-desktop);
          width: var(--text-1-width-desktop);
    max-width: var(--text-1-max-width-desktop);
    min-width: var(--text-1-min-width-desktop);
    }

    .text-2 {
      font-size: var(--text-2-font-size-desktop);
      font-weight: var(--text-2-font-weight-desktop);
      line-height: var(--text-2-line-height-desktop);
      text-align: var(--text-2-text-align-desktop);
      letter-spacing: var(--text-2-letter-spacing-desktop);
      left: var(--text-2-left-desktop);
      top: var(--text-2-top-desktop);
      z-index: var(--text-2-z-index-desktop);
      transform: var(--text-2-transform-desktop);
          width: var(--text-2-width-desktop);
    max-width: var(--text-2-max-width-desktop);
    min-width: var(--text-2-min-width-desktop);
    }

    .text-3 {
      font-size: var(--text-3-font-size-desktop);
      font-weight: var(--text-3-font-weight-desktop);
      line-height: var(--text-3-line-height-desktop);
      text-align: var(--text-3-text-align-desktop);
      letter-spacing: var(--text-3-letter-spacing-desktop);
      left: var(--text-3-left-desktop);
      top: var(--text-3-top-desktop);
      z-index: var(--text-3-z-index-desktop);
      transform: var(--text-3-transform-desktop);
          width: var(--text-3-width-desktop);
    max-width: var(--text-3-max-width-desktop);
    min-width: var(--text-3-min-width-desktop);
    }

    .text-4 {
      font-size: var(--text-4-font-size-desktop);
      font-weight: var(--text-4-font-weight-desktop);
      line-height: var(--text-4-line-height-desktop);
      text-align: var(--text-4-text-align-desktop);
      letter-spacing: var(--text-4-letter-spacing-desktop);
      left: var(--text-4-left-desktop);
      top: var(--text-4-top-desktop);
      z-index: var(--text-4-z-index-desktop);
      transform: var(--text-4-transform-desktop);
          width: var(--text-4-width-desktop);
    max-width: var(--text-4-max-width-desktop);
    min-width: var(--text-4-min-width-desktop);
    }

    /* Imagens Desktop */
    .image-0 {
      width: var(--img-0-width-desktop);
      height: var(--img-0-height-desktop);
      left: var(--img-0-left-desktop);
      top: var(--img-0-top-desktop);
      z-index: var(--img-0-z-index-desktop);
      transform: var(--img-0-transform-desktop);
    }

    .image-0 .responsive-image {
      object-fit: var(--img-0-object-fit-desktop);
    }

    .image-1 {
      width: var(--img-1-width-desktop);
      height: var(--img-1-height-desktop);
      left: var(--img-1-left-desktop);
      top: var(--img-1-top-desktop);
      z-index: var(--img-1-z-index-desktop);
      transform: var(--img-1-transform-desktop);
    }

    .image-1 .responsive-image {
      object-fit: var(--img-1-object-fit-desktop);
    }

    .image-2 {
      width: var(--img-2-width-desktop);
      height: var(--img-2-height-desktop);
      left: var(--img-2-left-desktop);
      top: var(--img-2-top-desktop);
      z-index: var(--img-2-z-index-desktop);
      transform: var(--img-2-transform-desktop);
    }

    .image-2 .responsive-image {
      object-fit: var(--img-2-object-fit-desktop);
    }

    .image-3 {
      width: var(--img-3-width-desktop);
      height: var(--img-3-height-desktop);
      left: var(--img-3-left-desktop);
      top: var(--img-3-top-desktop);
      z-index: var(--img-3-z-index-desktop);
      transform: var(--img-3-transform-desktop);
    }

    .image-3 .responsive-image {
      object-fit: var(--img-3-object-fit-desktop);
    }

    .image-4 {
      width: var(--img-4-width-desktop);
      height: var(--img-4-height-desktop);
      left: var(--img-4-left-desktop);
      top: var(--img-4-top-desktop);
      z-index: var(--img-4-z-index-desktop);
      transform: var(--img-4-transform-desktop);
    }

    .image-4 .responsive-image {
      object-fit: var(--img-4-object-fit-desktop);
    }
  }

  /* ===== ACESSIBILIDADE ===== */
  @media (prefers-reduced-motion: reduce) {
    .text-element,
    .image-element {
      animation: none !important;
      transition: none !important;
    }
  }
</style>