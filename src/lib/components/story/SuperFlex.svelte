<script>
  import { onMount } from 'svelte';

  export let data;

  // Função para checar a visibilidade de um elemento (para autoplay de vídeo)
  const viewport = (node) => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          node.dispatchEvent(new CustomEvent('enterViewport'));
        } else {
          node.dispatchEvent(new CustomEvent('exitViewport'));
        }
      });
    });

    observer.observe(node);

    return {
      destroy() {
        observer.unobserve(node);
      }
    };
  }

  // Função para tocar/pausar vídeos
  function handleEnterViewport(event) {
    const video = event.target;
    if (video.hasAttribute('data-autoplay-in-view') && video.dataset.autoplayInView === 'true') {
      video.play().catch(() => {});
    }
  }

  function handleExitViewport(event) {
    const video = event.target;
    if (video.hasAttribute('data-autoplay-in-view') && video.dataset.autoplayInView === 'true') {
      video.pause();
    }
  }

  // ✅ CORREÇÃO: Função para obter a melhor imagem de background
  function getBackgroundImageUrl(backgroundImage) {
    if (!backgroundImage) return 'none';
    
    // Se for string simples, retorna como URL
    if (typeof backgroundImage === 'string') {
      return backgroundImage ? `url(${backgroundImage})` : 'none';
    }
    
    // Se for objeto com desktop/mobile
    if (typeof backgroundImage === 'object') {
      return backgroundImage.desktop ? `url(${backgroundImage.desktop})` : 'none';
    }
    
    return 'none';
  }

  function getMobileBackgroundImageUrl(backgroundImage) {
    if (!backgroundImage) return 'none';
    
    // Se for string simples, usa como fallback
    if (typeof backgroundImage === 'string') {
      return backgroundImage ? `url(${backgroundImage})` : 'none';
    }
    
    // Se for objeto, prioriza mobile mas usa desktop como fallback
    if (typeof backgroundImage === 'object') {
      if (backgroundImage.mobile) {
        return `url(${backgroundImage.mobile})`;
      } else if (backgroundImage.desktop) {
        return `url(${backgroundImage.desktop})`;
      }
    }
    
    return 'none';
  }
</script>

<section
  class="super-flex-container"
  style:--background-color={data.backgroundColor || 'transparent'}
  style:--background-image-desktop={getBackgroundImageUrl(data.backgroundImage)}
  style:--background-image-mobile={getMobileBackgroundImageUrl(data.backgroundImage)}
>
  {#if data.items && Array.isArray(data.items)}
    {#each data.items as item}

      {#if item.type === 'text'}
        <!-- svelte-ignore missing-declaration -->
        <svelte:element
          this={item.tag || 'div'}
          class="flex-item text-item"
          style={`
            position: ${item.grifo ? 'relative' : 'static'};
            --max-width-desktop: ${item.styles?.maxWidth?.desktop || 'none'};
            --max-width-mobile: ${item.styles?.maxWidth?.mobile || 'none'};
            --width-desktop: ${item.styles?.width?.desktop || 'auto'};
            --width-mobile: ${item.styles?.width?.mobile || 'auto'};
            --margin-desktop: ${item.styles?.margin?.desktop || '0'};
            --margin-mobile: ${item.styles?.margin?.mobile || '0'};
            --padding-desktop: ${item.styles?.padding?.desktop || '0'};
            --padding-mobile: ${item.styles?.padding?.mobile || '0'};
            --text-align-desktop: ${item.styles?.textAlign?.desktop || 'left'};
            --text-align-mobile: ${item.styles?.textAlign?.mobile || 'left'};
            --font-family: ${item.styles?.fontFamily || 'inherit'};
            --color: ${item.styles?.color || 'inherit'};
            --font-size-desktop: ${item.styles?.fontSize?.desktop || 'inherit'};
            --font-size-mobile: ${item.styles?.fontSize?.mobile || 'inherit'};
            --font-weight-desktop: ${item.styles?.fontWeight?.desktop || 'normal'};
            --font-weight-mobile: ${item.styles?.fontWeight?.mobile || 'normal'};
            --line-height-desktop: ${item.styles?.lineHeight?.desktop || 'normal'};
            --line-height-mobile: ${item.styles?.lineHeight?.mobile || 'normal'};
          `}
        >
          {@html item.content}
          {#if item.grifo}
            <img 
              class="grifo-decorator" 
              src={item.grifo.src} 
              alt="" 
              style={`
                --grifo-width-desktop: ${item.grifo.width?.desktop || '300px'};
                --grifo-width-mobile: ${item.grifo.width?.mobile || '220px'};
                --grifo-offsetY-desktop: ${item.grifo.offsetY?.desktop || '3.5rem'};
                --grifo-offsetY-mobile: ${item.grifo.offsetY?.mobile || '2.5rem'};
              `}
            />
          {/if}
        </svelte:element>
      {/if}

      {#if item.type === 'image' && item.src}
        <!-- ✅ CORREÇÃO: Usando picture para melhor responsividade -->
        <picture class="flex-item image-item">
          <!-- Source para mobile se existir -->
          {#if item.src.mobile}
            <source 
              media="(max-width: 768px)" 
              srcset={item.src.mobile}
            />
          {/if}
          
          <!-- Source para desktop -->
          {#if item.src.desktop}
            <source 
              media="(min-width: 769px)" 
              srcset={item.src.desktop}
            />
          {/if}
          
          <!-- Fallback img -->
          <img
            src={item.src.mobile || item.src.desktop || item.src}
            alt={item.alt || ''}
            style={`
              --max-width-desktop: ${item.styles?.maxWidth?.desktop || 'none'};
              --max-width-mobile: ${item.styles?.maxWidth?.mobile || 'none'};
              --width-desktop: ${item.styles?.width?.desktop || 'auto'};
              --width-mobile: ${item.styles?.width?.mobile || 'auto'};
              --margin-desktop: ${item.styles?.margin?.desktop || '0'};
              --margin-mobile: ${item.styles?.margin?.mobile || '0'};
              --padding-desktop: ${item.styles?.padding?.desktop || '0'};
              --padding-mobile: ${item.styles?.padding?.mobile || '0'};
            `}
            loading="lazy"
            on:error={(e) => {
              console.error('❌ Erro ao carregar imagem:', e.target.src);
              // Fallback logic
              const mobile = item.src.mobile;
              const desktop = item.src.desktop;
              
              if (e.target.src === mobile && desktop) {
                console.log('📱➡️🖥️ Mudando de mobile para desktop');
                e.target.src = desktop;
              } else if (e.target.src === desktop && mobile) {
                console.log('🖥️➡️📱 Mudando de desktop para mobile');  
                e.target.src = mobile;
              } else {
                console.log('❌ Ocultando imagem sem fallback válido');
                e.target.style.display = 'none';
              }
            }}
          />
        </picture>
      {/if}

      {#if item.type === 'video' && item.src}
        <video
          class="flex-item video-item"
          src={item.src.mobile || item.src.desktop || item.src}
          style={`
            --max-width-desktop: ${item.styles?.maxWidth?.desktop || 'none'};
            --max-width-mobile: ${item.styles?.maxWidth?.mobile || 'none'};
            --width-desktop: ${item.styles?.width?.desktop || 'auto'};
            --width-mobile: ${item.styles?.width?.mobile || 'auto'};
            --margin-desktop: ${item.styles?.margin?.desktop || '0'};
            --margin-mobile: ${item.styles?.margin?.mobile || '0'};
            --padding-desktop: ${item.styles?.padding?.desktop || '0'};
            --padding-mobile: ${item.styles?.padding?.mobile || '0'};
          `}
          loop={item.loop || false}
          muted={item.muted || false}
          autoplay={item.autoplay || false}
          playsinline
          data-autoplay-in-view={item.autoplayInView || false}
          use:viewport
          on:enterViewport={handleEnterViewport}
          on:exitViewport={handleExitViewport}
        >
          Seu navegador não suporta vídeos.
        </video>
      {/if}

      {#if item.type === 'audio' && item.src}
        <div class="flex-item audio-wrapper">
          <audio
            src={item.src.desktop || item.src.mobile || item.src}
            controls
            style={`
              --max-width-desktop: ${item.styles?.maxWidth?.desktop || 'none'};
              --max-width-mobile: ${item.styles?.maxWidth?.mobile || 'none'};
              --width-desktop: ${item.styles?.width?.desktop || 'auto'};
              --width-mobile: ${item.styles?.width?.mobile || 'auto'};
              --margin-desktop: ${item.styles?.margin?.desktop || '0'};
              --margin-mobile: ${item.styles?.margin?.mobile || '0'};
              --padding-desktop: ${item.styles?.padding?.desktop || '0'};
              --padding-mobile: ${item.styles?.padding?.mobile || '0'};
            `}
          >
            Seu navegador não suporta áudio.
          </audio>
        </div>
      {/if}

    {/each}
  {/if}
</section>

<style>
  .super-flex-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: var(--background-color);
    background-image: var(--background-image-mobile);
    background-size: cover;
    background-position: center;
    background-attachment: local; /* ✅ NOVO: Melhora performance mobile */
  }

  .flex-item {
    /* Estilos Mobile primeiro */
    max-width: var(--max-width-mobile, var(--max-width-desktop, 100%));
    width: var(--width-mobile, var(--width-desktop, auto));
    margin: var(--margin-mobile, var(--margin-desktop, 0));
    padding: var(--padding-mobile, var(--padding-desktop, 0));
    text-align: var(--text-align-mobile, var(--text-align-desktop, left));
  }

  .text-item {
    /* CORREÇÃO APLICADA AQUI: Removidos os valores padrão */
    font-family: var(--font-family);
    color: var(--color);
    font-size: var(--font-size-mobile, var(--font-size-desktop));
    font-weight: var(--font-weight-mobile, var(--font-weight-desktop));
    line-height: var(--line-height-mobile, var(--line-height-desktop));
  }
  
  .image-item, .video-item {
    height: auto;
    display: block;
  }

  /* ✅ CORREÇÃO: Melhor estilo para picture */
  .image-item img {
    width: 100%;
    height: auto;
    max-width: var(--max-width-mobile, var(--max-width-desktop, 100%));
  }

  .audio-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .audio-wrapper audio {
    width: 100%;
    max-width: 500px;
  }
  
  /* Media Query para Desktop */
  @media (min-width: 768px) {
    .super-flex-container {
      background-image: var(--background-image-desktop);
    }

    .flex-item {
      max-width: var(--max-width-desktop, 100%);
      width: var(--width-desktop, auto);
      margin: var(--margin-desktop, 0);
      padding: var(--padding-desktop, 0);
      text-align: var(--text-align-desktop, left);
    }
    
    .text-item {
      /* CORREÇÃO APLICADA AQUI: Removidos os valores padrão */
      font-size: var(--font-size-desktop);
      font-weight: var(--font-weight-desktop);
      line-height: var(--line-height-desktop);
    }

    /* ✅ CORREÇÃO: Melhor estilo para picture em desktop */
    .image-item img {
      max-width: var(--max-width-desktop, 100%);
    }
  }

  /* Estilos para o Grifo */
  .grifo-decorator {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
      pointer-events: none;
      height: auto;
      
      /* Estilos Mobile */
      width: var(--grifo-width-mobile);
      transform: translateY(var(--grifo-offsetY-mobile));
      transition: all 0.2s ease-in-out;
    }

    @media (min-width: 768px) {
      .grifo-decorator {
        /* Estilos Desktop */
        width: var(--grifo-width-desktop);
        transform: translateY(var(--grifo-offsetY-desktop));
      }
    }
</style>