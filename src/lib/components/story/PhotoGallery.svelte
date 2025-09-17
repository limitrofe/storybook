<!-- src/lib/components/story/PhotoGallery.svelte -->
<script>
  export let images = [];
  export let layout = 'grid'; // 'grid', 'masonry', 'slider'
  export let columns = 3;
  
  let currentIndex = 0;
  let showLightbox = false;

  function openLightbox(index) {
    currentIndex = index;
    showLightbox = true;
  }

  function closeLightbox() {
    showLightbox = false;
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }
</script>

<div class="gallery gallery--{layout}" style="--columns: {columns}">
  {#each images as image, index}
    <button class="gallery-item" type="button" on:click={() => openLightbox(index)}>
      <picture>
        {#if image.srcMobile}
          <source srcset={image.srcMobile} media="(max-width: 768px)" />
        {/if}
        <img src={image.src} alt={image.alt || ''} loading="lazy" />
      </picture>
      {#if image.caption}
        <div class="gallery-caption">
          <p>{image.caption}</p>
          {#if image.credit}
            <small>{image.credit}</small>
          {/if}
        </div>
      {/if}
    </button>
  {/each}
</div>

{#if showLightbox}
  <div
    class="lightbox"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click={closeLightbox}
    on:keydown={(event) => {
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') { event.preventDefault(); prevImage(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); nextImage(); }
    }}
  >
    <div class="lightbox-content" role="document" on:click|stopPropagation>
      <button class="lightbox-close" on:click={closeLightbox}>×</button>
      
      {#if images.length > 1}
        <button class="lightbox-nav lightbox-prev" on:click={prevImage}>‹</button>
        <button class="lightbox-nav lightbox-next" on:click={nextImage}>›</button>
      {/if}
      
      <picture>
        {#if images[currentIndex].srcMobile}
          <source srcset={images[currentIndex].srcMobile} media="(max-width: 768px)" />
        {/if}
        <img src={images[currentIndex].src} alt={images[currentIndex].alt || ''} />
      </picture>
      
      {#if images[currentIndex].caption}
        <div class="lightbox-caption">
          <p>{images[currentIndex].caption}</p>
          {#if images[currentIndex].credit}
            <small>{images[currentIndex].credit}</small>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .gallery {
    padding: 2rem 0;
  }

  .gallery--grid {
    display: grid;
    grid-template-columns: repeat(var(--columns, 3), 1fr);
    gap: 1rem;
  }

  .gallery--masonry {
    columns: var(--columns, 3);
    column-gap: 1rem;
  }

  .gallery-item {
    position: relative;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    break-inside: avoid;
    margin-bottom: 1rem;
    transition: transform 0.3s ease;
    border: none;
    background: transparent;
    padding: 0;
  }

  .gallery-item:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 4px;
  }

  .gallery--grid .gallery-item:hover {
    transform: scale(1.02);
  }

  .gallery-item picture,
  .gallery-item img {
    width: 100%;
    height: auto;
    display: block;
  }

  .gallery-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    color: white;
    padding: 2rem 1rem 1rem;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  .gallery-item:hover .gallery-caption {
    transform: translateY(0);
  }

  .gallery-caption p {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-40);
  }

  .gallery-caption small {
    opacity: 0.8;
    font-size: var(--font-size-30);
  }

  /* Lightbox */
  .lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .lightbox-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }

  .lightbox-content img {
    width: 100%;
    height: auto;
    max-height: 80vh;
    object-fit: contain;
  }

  .lightbox-close {
    position: absolute;
    top: -50px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lightbox-prev {
    left: -70px;
  }

  .lightbox-next {
    right: -70px;
  }

  .lightbox-caption {
    color: white;
    text-align: center;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .gallery--grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .gallery--masonry {
      columns: 2;
    }

    .lightbox-nav {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .gallery--grid {
      grid-template-columns: 1fr;
    }

    .gallery--masonry {
      columns: 1;
    }
  }
</style>
