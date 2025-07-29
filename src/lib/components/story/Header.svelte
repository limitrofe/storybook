<!-- src/lib/components/story/Header.svelte -->
<script>
  export let title = '';
  export let subtitle = '';
  export let author = '';
  export let publishDate = '';
  export let backgroundImage = '';
  export let overlay = true;
  export let variant = 'default'; // 'default', 'minimal', 'hero'
</script>

<header 
  class="story-header story-header--{variant}"
  class:has-background={backgroundImage}
  style={backgroundImage ? `background-image: url(${backgroundImage})` : ''}
>
  {#if overlay && backgroundImage}
    <div class="story-header__overlay"></div>
  {/if}
  
  <div class="story-header__content">
    <div class="story-header__container">
      <h1 class="story-header__title">{title}</h1>
      
      {#if subtitle}
        <p class="story-header__subtitle">{subtitle}</p>
      {/if}
      
      {#if author || publishDate}
        <div class="story-header__meta">
          {#if author}
            <span class="story-header__author">{author}</span>
          {/if}
          {#if publishDate}
            <time class="story-header__date">{publishDate}</time>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
  .story-header {
    position: relative;
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-background);
    color: var(--color-text);
  }

  .story-header.has-background {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    color: white;
  }

  .story-header--hero {
    min-height: 100vh;
  }

  .story-header--minimal {
    min-height: 30vh;
    padding: 2rem 0;
  }

  .story-header__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }

  .story-header__content {
    position: relative;
    z-index: 2;
    width: 100%;
    padding: 2rem;
  }

  .story-header__container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .story-header__title {
    font-size: var(--font-size-140);
    font-weight: 800;
    line-height: 1.1;
    margin: 0 0 1rem 0;
  }

  .story-header__subtitle {
    font-size: var(--font-size-90);
    font-weight: 400;
    line-height: 1.4;
    margin: 0 0 2rem 0;
    opacity: 0.9;
  }

  .story-header__meta {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    font-size: var(--font-size-40);
    opacity: 0.8;
  }

  .story-header__author {
    font-weight: 600;
  }

  .story-header__date {
    font-weight: 400;
  }

  @media (max-width: 768px) {
    .story-header__title {
      font-size: var(--font-size-120);
    }

    .story-header__subtitle {
      font-size: var(--font-size-70);
    }

    .story-header__meta {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
