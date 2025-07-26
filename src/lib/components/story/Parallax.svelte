<!-- src/lib/components/story/Parallax.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  
  export let image = '';
  export let height = '80vh';
  export let speed = 0.5; // 0 = sem parallax, 1 = velocidade normal
  export let content = '';
  export let overlay = true;
  
  let parallaxElement;
  let backgroundElement;
  let containerElement;
  let mounted = false;
  let ticking = false;

  function handleScroll() {
    if (!ticking && mounted && parallaxElement && backgroundElement) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  function updateParallax() {
    if (!parallaxElement || !backgroundElement) return;
    
    const rect = parallaxElement.getBoundingClientRect();
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    // Verifica se o elemento está na viewport
    if (rect.bottom >= 0 && rect.top <= windowHeight) {
      // Calcula o movimento baseado na posição do scroll
      const elementTop = rect.top + scrolled;
      const elementHeight = rect.height;
      const rate = -(scrolled - elementTop) * speed;
      
      // Aplica o transform
      backgroundElement.style.transform = `translate3d(0, ${rate}px, 0)`;
    }
    
    ticking = false;
  }

  onMount(() => {
    if (!browser) return;
    
    mounted = true;
    
    // Initial update
    setTimeout(updateParallax, 100);
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Debug
    if (import.meta.env.DEV) {
      console.log('🌄 Parallax mounted:', {
        image,
        height,
        speed,
        hasContent: !!content
      });
    }
  });

  onDestroy(() => {
    if (!browser) return;
    
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleScroll);
  });

  // Debug reativo
  $: if (import.meta.env.DEV && mounted) {
    console.log('🌄 Parallax props changed:', { image, height, speed, content: content?.substring(0, 50) });
  }
</script>

<div 
  class="parallax-container" 
  bind:this={parallaxElement}
  style="height: {height}"
>
  <!-- Background image -->
  {#if image}
    <div 
      class="parallax-background"
      bind:this={backgroundElement}
      style="background-image: url({image})"
    ></div>
  {:else}
    <div class="parallax-background parallax-background--fallback">
      <div class="fallback-content">
        <p>⚠️ Imagem não carregada</p>
        <small>Image: {image || 'não fornecida'}</small>
      </div>
    </div>
  {/if}
  
  <!-- Overlay -->
  {#if overlay}
    <div class="parallax-overlay"></div>
  {/if}
  
  <!-- Content -->
  {#if content}
    <div class="parallax-content">
      <div class="parallax-text">
        {@html content}
      </div>
    </div>
  {/if}
</div>

<style>
  .parallax-container {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
  }

  .parallax-background {
    position: absolute;
    top: -30%;
    left: 0;
    width: 100%;
    height: 130%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    will-change: transform;
    z-index: 1;
  }

  .parallax-background--fallback {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fallback-content {
    text-align: center;
    color: white;
    opacity: 0.8;
  }

  .fallback-content p {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }

  .fallback-content small {
    font-size: 0.9rem;
    opacity: 0.7;
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
    max-width: 800px;
    margin: 0 auto;
  }

  .parallax-text {
    font-size: var(--font-size-90);
    font-weight: 600;
    line-height: 1.4;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  /* Typography dentro do content */
  .parallax-text :global(h1),
  .parallax-text :global(h2),
  .parallax-text :global(h3) {
    margin: 0 0 1rem 0;
    font-weight: 700;
    color: white;
  }

  .parallax-text :global(h1) {
    font-size: var(--font-size-140);
  }

  .parallax-text :global(h2) {
    font-size: var(--font-size-120);
  }

  .parallax-text :global(h3) {
    font-size: var(--font-size-100);
  }

  .parallax-text :global(p) {
    margin: 0 0 1rem 0;
    line-height: 1.6;
  }

  .parallax-text :global(strong) {
    font-weight: 700;
  }

  .parallax-text :global(em) {
    font-style: italic;
  }

  /* Mobile */
  @media (max-width: 768px) {
    .parallax-background {
      background-attachment: scroll; /* Fix para mobile */
      transform: none !important; /* Desabilita parallax em mobile */
    }

    .parallax-content {
      padding: 1.5rem;
    }

    .parallax-text {
      font-size: var(--font-size-70);
    }

    .parallax-text :global(h1) {
      font-size: var(--font-size-120);
    }

    .parallax-text :global(h2) {
      font-size: var(--font-size-100);
    }

    .parallax-text :global(h3) {
      font-size: var(--font-size-90);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .parallax-background {
      transform: none !important;
      background-attachment: scroll;
    }
  }

  /* Debug em desenvolvimento */
  @media (max-width: 1200px) {
    .parallax-container::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      width: 20px;
      height: 20px;
      background: var(--color-primary);
      border-radius: 50%;
      z-index: 10;
      opacity: 0.8;
    }
  }
</style>