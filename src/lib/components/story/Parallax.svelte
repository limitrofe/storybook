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

  onMount(() => {
    mounted = true;
    
    const handleScroll = () => {
      if (!parallaxElement) return;
      
      const rect = parallaxElement.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      
      if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
        parallaxElement.style.transform = `translateY(${rate}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<div class="parallax-container" style="height: {height}">
  <div 
    class="parallax-image" 
    bind:this={parallaxElement}
    style="background-image: url({image})"
  ></div>
  
  {#if overlay}
    <div class="parallax-overlay"></div>
  {/if}
  
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
  }

  .parallax-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }

  .parallax-content {
    position: relative;
    z-index: 2;
    color: white;
    text-align: center;
    padding: 2rem;
  }

  .parallax-text {
    max-width: 600px;
    font-size: var(--font-size-90);
    font-weight: 600;
    line-height: 1.4;
  }
</style>
