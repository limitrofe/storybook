<!-- src/lib/components/story/Parallax.svelte -->
<script>
  import { onMount } from 'svelte';
  
  export let image = '';
  export let height = '80vh';
  export let speed = 0.5; // 0 = sem parallax, 1 = velocidade normal
  export let content = '';
  export let overlay = true;
  
  let parallaxElement;
  let mounted = false;

  // 🔧 CORREÇÃO: Normalizar height para incluir 'vh' se necessário
  $: normalizedHeight = (() => {
    if (!height) return '80vh';
    
    // Se é só número, adiciona 'vh'
    if (typeof height === 'number' || /^\d+$/.test(height)) {
      return `${height}vh`;
    }
    
    // Se já tem unidade, mantém como está
    if (typeof height === 'string' && (height.includes('vh') || height.includes('px') || height.includes('%'))) {
      return height;
    }
    
    // Fallback
    return `${height}vh`;
  })();

  // 🔧 CORREÇÃO: Tratar conteúdo HTML de forma mais robusta
  $: safeContent = (() => {
    if (!content) return '';
    
    // Se já é string HTML válida, retorna
    if (typeof content === 'string') {
      return content;
    }
    
    // Se veio como objeto ou outro tipo, converte para string
    return String(content);
  })();

  // 🔧 CORREÇÃO: Validar se a imagem é uma URL válida
  $: validImage = (() => {
    if (!image) return false;
    try {
      const url = new URL(image);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  })();

  // 🔧 DEBUG completo
  $: if (import.meta.env.DEV) {
    console.log('🌄 Debug Parallax COMPLETO:', {
      image: image || 'NO IMAGE',
      validImage,
      content: content || 'NO CONTENT',
      safeContent: safeContent || 'NO SAFE CONTENT',
      height: height,
      normalizedHeight: normalizedHeight,
      speed: speed,
      overlay: overlay,
      contentLength: safeContent?.length || 0,
      rawProps: { image, height, speed, content, overlay }
    });
  }

  onMount(() => {
    mounted = true;
    
    const handleScroll = () => {
      if (!parallaxElement) return;
      
      const rect = parallaxElement.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      
      // 🔧 CORREÇÃO: Melhor detecção de viewport
      if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
        parallaxElement.style.transform = `translateY(${rate}px)`;
      }
    };

    // 🔧 CORREÇÃO: Throttle do scroll para performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    
    // Trigger inicial
    handleScroll();
    
    return () => window.removeEventListener('scroll', throttledScroll);
  });
</script>

<div class="parallax-container" style="height: {normalizedHeight}">
  <!-- 🔧 DEBUG: Container visual para verificar se está renderizando -->
  {#if !validImage}
    <div class="debug-no-image">
      <p>⚠️ Imagem inválida ou não carregou</p>
      <p>URL: {image || 'Nenhuma URL fornecida'}</p>
    </div>
  {/if}
  
  {#if validImage}
    <div 
      class="parallax-image" 
      bind:this={parallaxElement}
      style="background-image: url('{image}')"
    ></div>
  {/if}
  
  {#if overlay && validImage}
    <div class="parallax-overlay"></div>
  {/if}
  
  <div class="parallax-content">
    <div class="parallax-text">
      {#if safeContent}
        {@html safeContent}
      {:else}
        <div class="debug-no-content">
          <p>⚠️ Nenhum conteúdo fornecido</p>
          <p>Content prop: {content || 'undefined'}</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .parallax-container {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    
    /* 🔧 CORREÇÃO: Garantir que o container respeite a altura */
    width: 100%;
    min-height: 200px; /* Fallback mínimo */
  }

  .parallax-image {
    position: absolute;
    top: -20%;
    left: 0;
    width: 100%;
    height: 120%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    will-change: transform;
    z-index: 1;
    
    /* 🔧 CORREÇÃO: Garantir que a imagem carregue */
    background-color: #333; /* Fallback enquanto carrega */
  }

  /* 🔧 NOVA: Estilos de debug */
  .debug-no-image,
  .debug-no-content {
    background: rgba(255, 0, 0, 0.1);
    border: 2px dashed #ff0000;
    padding: 1rem;
    text-align: center;
    color: #ff0000;
    font-family: monospace;
    font-size: 0.9rem;
  }

  .debug-no-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .debug-no-content {
    background: rgba(255, 255, 0, 0.1);
    border-color: #ffaa00;
    color: #cc8800;
  }

  .parallax-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 2;
  }

  .parallax-content {
    position: relative;
    z-index: 3;
    color: white;
    text-align: center;
    padding: 2rem;
    width: 100%;
    
    /* 🔧 CORREÇÃO: Garantir que o conteúdo seja visível */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .parallax-text {
    max-width: 800px;
    width: 100%;
    font-size: var(--font-size-90, 1.375rem);
    font-weight: 600;
    line-height: 1.4;
    
    /* 🔧 CORREÇÃO: Estilos para melhor legibilidade */
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  }

  /* 🔧 CORREÇÃO: Estilos específicos para elementos HTML dentro do conteúdo */
  .parallax-text :global(h1),
  .parallax-text :global(h2),
  .parallax-text :global(h3) {
    margin: 0 0 1rem 0;
    font-weight: 800;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }

  .parallax-text :global(h2) {
    font-size: var(--font-size-110, 1.75rem);
  }

  .parallax-text :global(p) {
    margin: 0.5rem 0 0 0;
    font-size: var(--font-size-70, 1.125rem);
    opacity: 0.95;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  /* 🔧 CORREÇÃO: Mobile responsivo */
  @media (max-width: 768px) {
    .parallax-container {
      /* No mobile, usar altura fixa menor se for muito grande */
      min-height: 50vh;
    }
    
    .parallax-image {
      /* Remove background-attachment no mobile para performance */
      background-attachment: scroll;
    }
    
    .parallax-content {
      padding: 1.5rem 1rem;
    }
    
    .parallax-text {
      font-size: var(--font-size-70, 1.125rem);
    }
    
    .parallax-text :global(h2) {
      font-size: var(--font-size-90, 1.375rem);
    }
    
    .parallax-text :global(p) {
      font-size: var(--font-size-60, 1rem);
    }
  }

  /* 🔧 CORREÇÃO: Para dispositivos com preferência por movimento reduzido */
  @media (prefers-reduced-motion: reduce) {
    .parallax-image {
      background-attachment: scroll;
      transform: none !important;
    }
  }

  /* 🔧 NOVA: Suporte para diferentes tamanhos de altura */
  .parallax-container[style*="100vh"] {
    min-height: 100vh;
  }
  
  .parallax-container[style*="80vh"] {
    min-height: 80vh;
  }
  
  .parallax-container[style*="60vh"] {
    min-height: 60vh;
  }
</style>