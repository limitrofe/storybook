<!-- AbsoluteCanvas.svelte -->
<script>
  import { onMount } from 'svelte';

  // Props principais
  export let heightDesktop = '100vh';
  export let heightMobile = '100vh';
  export let backgroundColor = '#000000';
  export let backgroundImage = '';
  export let backgroundImageMobile = '';
  export let backgroundVideo = '';
  export let backgroundVideoMobile = '';
  export let backgroundSize = 'cover';
  export let backgroundPosition = 'center center';
  
  // Arrays de elementos
  export let elements = [
    // Exemplo de estrutura:
    // {
    //   type: 'text|image|video',
    //   content: 'Texto aqui', // para type: text
    //   src: 'url', // para type: image|video
    //   srcMobile: 'url-mobile', // opcional
    //   
    //   // Posicionamento responsivo
    //   desktop: {
    //     x: '50%', y: '50%', z: 10,
    //     width: 'auto', height: 'auto',
    //     transform: 'translate(-50%, -50%)'
    //   },
    //   mobile: {
    //     x: '50%', y: '100px', z: 10,
    //     width: 'auto', height: 'auto', 
    //     transform: 'translate(-50%, 0)'
    //   },
    //   
    //   // Estilos específicos por tipo
    //   textStyles: {
    //     fontFamily: 'Arial',
    //     fontSize: { desktop: '2rem', mobile: '1.5rem' },
    //     fontWeight: { desktop: '900', mobile: '700' },
    //     lineHeight: { desktop: '1.2', mobile: '1.3' },
    //     textAlign: { desktop: 'center', mobile: 'left' },
    //     color: '#ffffff',
    //     maxWidth: { desktop: '800px', mobile: '300px' },
    //     textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
    //   },
    //   
    //   imageStyles: {
    //     objectFit: { desktop: 'cover', mobile: 'contain' },
    //     borderRadius: '10px',
    //     filter: 'brightness(1.1)'
    //   },
    //   
    //   videoStyles: {
    //     objectFit: { desktop: 'cover', mobile: 'contain' },
    //     autoplay: true,
    //     loop: true,
    //     muted: true
    //   }
    // }
  ];

  // Estado responsivo
  let isMobile = false;
  let mounted = false;

  onMount(() => {
    mounted = true;
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

  // Gerar estilos para cada elemento
  function getElementStyles(element, index) {
    if (!element) return '';

    const config = isMobile ? element.mobile : element.desktop;
    if (!config) return '';

    let styles = `
      position: absolute;
      left: ${config.x || '0'};
      top: ${config.y || '0'};
      z-index: ${config.z || 1};
      width: ${config.width || 'auto'};
      height: ${config.height || 'auto'};
      transform: ${config.transform || 'none'};
      box-sizing: border-box;
    `;

    // Estilos específicos por tipo
    if (element.type === 'text' && element.textStyles) {
      const ts = element.textStyles;
      styles += `
        font-family: ${ts.fontFamily || 'inherit'};
        font-size: ${getResponsiveValue(ts.fontSize)};
        font-weight: ${getResponsiveValue(ts.fontWeight)};
        line-height: ${getResponsiveValue(ts.lineHeight)};
        text-align: ${getResponsiveValue(ts.textAlign)};
        color: ${ts.color || '#000000'};
        max-width: ${getResponsiveValue(ts.maxWidth)};
        text-shadow: ${ts.textShadow || 'none'};
        letter-spacing: ${getResponsiveValue(ts.letterSpacing) || '0'};
        white-space: ${getResponsiveValue(ts.whiteSpace) || 'normal'};
        word-wrap: break-word;
        overflow-wrap: break-word;
        pointer-events: none;
      `;
    }

    if (element.type === 'image' && element.imageStyles) {
      const is = element.imageStyles;
      styles += `
        object-fit: ${getResponsiveValue(is.objectFit) || 'cover'};
        border-radius: ${is.borderRadius || '0'};
        filter: ${is.filter || 'none'};
        opacity: ${is.opacity || '1'};
        transition: ${is.transition || 'none'};
      `;
    }

    if (element.type === 'video' && element.videoStyles) {
      const vs = element.videoStyles;
      styles += `
        object-fit: ${getResponsiveValue(vs.objectFit) || 'cover'};
        border-radius: ${vs.borderRadius || '0'};
        filter: ${vs.filter || 'none'};
        opacity: ${vs.opacity || '1'};
      `;
    }

    return styles;
  }

  // Obter src responsivo para imagens/vídeos
  function getResponsiveSrc(element) {
    if (isMobile && element.srcMobile) {
      return element.srcMobile;
    }
    return element.src || '';
  }

  // Estilo do container principal
  $: containerStyles = `
    --height-desktop: ${heightDesktop};
    --height-mobile: ${heightMobile};
    --bg-color: ${backgroundColor};
    --bg-size: ${backgroundSize};
    --bg-position: ${backgroundPosition};
    ${backgroundImage ? `--bg-image: url(${isMobile && backgroundImageMobile ? backgroundImageMobile : backgroundImage});` : ''}
  `;
</script>

<section 
  class="absolute-canvas" 
  class:mounted
  style={containerStyles}
>
  <!-- Background Video -->
  {#if backgroundVideo}
    <video 
      class="background-video"
      src={isMobile && backgroundVideoMobile ? backgroundVideoMobile : backgroundVideo}
      autoplay 
      loop 
      muted 
      playsinline
    ></video>
  {/if}

  <!-- Elementos dinâmicos -->
  {#if mounted}
    {#each elements as element, index}
      {#if element.type === 'text'}
        <div 
          class="canvas-element text-element"
          style={getElementStyles(element, index)}
        >
          {@html element.content}
        </div>
      
      {:else if element.type === 'image'}
        <div 
          class="canvas-element image-element"
          style={getElementStyles(element, index)}
        >
          <img 
            src={getResponsiveSrc(element)}
            alt={element.alt || ''}
            loading="lazy"
          />
        </div>
      
      {:else if element.type === 'video'}
        <div 
          class="canvas-element video-element"
          style={getElementStyles(element, index)}
        >
          <video
            src={getResponsiveSrc(element)}
            autoplay={element.videoStyles?.autoplay !== false}
            loop={element.videoStyles?.loop !== false}
            muted={element.videoStyles?.muted !== false}
            controls={element.videoStyles?.controls === true}
            playsinline
          ></video>
        </div>
      {/if}
    {/each}
  {/if}
</section>

<style>
  .absolute-canvas {
    position: relative;
    width: 100%;
    min-height: var(--height-mobile);
    background-color: var(--bg-color);
    background-image: var(--bg-image);
    background-size: var(--bg-size);
    background-position: var(--bg-position);
    background-repeat: no-repeat;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .absolute-canvas.mounted {
    opacity: 1;
  }

  .background-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  .canvas-element {
    transition: all 0.3s ease-in-out;
  }

  .text-element {
    user-select: none;
  }

  .image-element img,
  .video-element video {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* Desktop */
  @media (min-width: 769px) {
    .absolute-canvas {
      min-height: var(--height-desktop);
    }
  }

  /* Acessibilidade */
  @media (prefers-reduced-motion: reduce) {
    .canvas-element {
      transition: none !important;
    }
    
    .background-video {
      display: none;
    }
  }
</style>