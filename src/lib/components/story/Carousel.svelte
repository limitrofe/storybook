<!-- src/lib/components/story/Carousel.svelte -->
<script>
  import { onMount } from 'svelte';
  
  export let items = [];
  export let autoplay = false;
  export let interval = 5000;
  export let showDots = true;
  export let showArrows = true;
  
  let currentIndex = 0;
  let carouselElement;
  let autoplayInterval;

  onMount(() => {
    if (autoplay) {
      startAutoplay();
    }
    
    return () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
    };
  });

  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      next();
    }, interval);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function next() {
    currentIndex = (currentIndex + 1) % items.length;
  }

  function prev() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
  }

  function goTo(index) {
    currentIndex = index;
  }
</script>

<div 
  class="carousel" 
  bind:this={carouselElement}
  on:mouseenter={stopAutoplay}
  on:mouseleave={() => autoplay && startAutoplay()}
>
  <div class="carousel-track" style="transform: translateX(-{currentIndex * 100}%)">
    {#each items as item, index}
      <div class="carousel-slide">
        {#if item.type === 'image'}
          <img src={item.src} alt={item.alt || ''} />
        {:else if item.type === 'video'}
          <video controls>
            <source src={item.src} type="video/mp4" />
          </video>
        {:else if item.type === 'content'}
          <div class="carousel-content">
            {@html item.content}
          </div>
        {/if}
        
        {#if item.caption}
          <div class="carousel-caption">
            <p>{item.caption}</p>
            {#if item.credit}
              <small>{item.credit}</small>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if showArrows && items.length > 1}
    <button class="carousel-arrow carousel-prev" on:click={prev}>‹</button>
    <button class="carousel-arrow carousel-next" on:click={next}>›</button>
  {/if}

  {#if showDots && items.length > 1}
    <div class="carousel-dots">
      {#each items as _, index}
        <button 
          class="carousel-dot" 
          class:active={currentIndex === index}
          on:click={() => goTo(index)}
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .carousel {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    background: var(--color-background);
  }

  .carousel-track {
    display: flex;
    transition: transform 0.5s ease;
    will-change: transform;
  }

  .carousel-slide {
    min-width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .carousel-slide img,
  .carousel-slide video {
    width: 100%;
    height: auto;
    display: block;
  }

  .carousel-content {
    padding: 2rem;
    text-align: center;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    color: white;
    padding: 2rem 1rem 1rem;
  }

  .carousel-caption p {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-50);
  }

  .carousel-caption small {
    opacity: 0.8;
    font-size: var(--font-size-40);
  }

  .carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    z-index: 10;
  }

  .carousel-arrow:hover {
    background: white;
    transform: translateY(-50%) scale(1.1);
  }

  .carousel-prev {
    left: 1rem;
  }

  .carousel-next {
    right: 1rem;
  }

  .carousel-dots {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 10;
  }

  .carousel-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .carousel-dot.active {
    background: white;
    transform: scale(1.2);
  }

  @media (max-width: 768px) {
    .carousel-arrow {
      width: 40px;
      height: 40px;
      font-size: 1.2rem;
    }

    .carousel-prev {
      left: 0.5rem;
    }

    .carousel-next {
      right: 0.5rem;
    }
  }
</style>
