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
</script>

<section
  class="super-flex-container"
  style:--background-color={data.backgroundColor || 'transparent'}
  style:--background-image-desktop={data.backgroundImage?.desktop ? `url(${data.backgroundImage.desktop})` : 'none'}
  style:--background-image-mobile={data.backgroundImage?.mobile ? `url(${data.backgroundImage.mobile})` : "var(--background-image-desktop)"}
>
  {#if data.items && Array.isArray(data.items)}
    {#each data.items as item}

      {#if item.type === 'text'}
        <div
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
        </div>
      {/if}

      {#if item.type === 'image' && item.src}
        <img
          class="flex-item image-item"
          src={item.src.mobile || item.src.desktop}
          srcset={item.src.desktop && item.src.mobile ? `${item.src.mobile} 767w, ${item.src.desktop} 1920w` : null}
          sizes="(max-width: 767px) 100vw, 100vw"
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
            --text-align-desktop: ${item.styles?.textAlign?.desktop || 'left'};
            --text-align-mobile: ${item.styles?.textAlign?.mobile || 'left'};
          `}
          loading="lazy"
        />
      {/if}

      {#if item.type === 'video' && item.src}
        <video
          class="flex-item video-item"
          controls={item.controls || false}
          muted={item.autoplay || false}
          loop={item.loop || false}
          playsinline
          style={`
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
          `}
          data-autoplay-in-view={item.autoplay || false}
          use:viewport
          on:enterViewport={handleEnterViewport}
          on:exitViewport={handleExitViewport}
          preload="metadata"
        >
          {#if item.src.desktop}
            <source src={item.src.desktop} type="video/mp4" media="(min-width: 768px)">
          {/if}
          {#if item.src.mobile}
            <source src={item.src.mobile} type="video/mp4">
          {:else if item.src.desktop}
            <source src={item.src.desktop} type="video/mp4">
          {/if}
        </video>
      {/if}

      {#if item.type === 'audio' && item.src}
        <div class="flex-item audio-wrapper" 
          style={`
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
          `}
        >
          {#if item.title}<p class="audio-title">{item.title}</p>{/if}
          <audio controls src={item.src}>
            Seu navegador não suporta o elemento de áudio.
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
    font-family: var(--font-family, inherit);
    color: var(--color, inherit);
    font-size: var(--font-size-mobile, var(--font-size-desktop, inherit));
    font-weight: var(--font-weight-mobile, var(--font-weight-desktop, normal));
    line-height: var(--line-height-mobile, var(--line-height-desktop, normal));
  }
  
  .image-item, .video-item {
    height: auto;
    display: block;
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
      font-size: var(--font-size-desktop, inherit);
      font-weight: var(--font-weight-desktop, normal);
      line-height: var(--line-height-desktop, normal);
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