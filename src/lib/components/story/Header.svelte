<script>
  export let title = '';
  export let subtitle = '';
  export let author = '';
  export let date = '';
  export let backgroundImage = '';
  export let backgroundImageMobile = '';
  export let backgroundVideo = '';
  export let backgroundVideoMobile = '';
  export let overlay = true;
  export let variant = 'default'; // 'default', 'minimal', 'hero'

  // Verificações de mídia mais rigorosas
  $: hasDesktopMedia = !!(backgroundImage?.trim() || backgroundVideo?.trim());
  $: hasMobileMedia = !!(backgroundImageMobile?.trim() || backgroundVideoMobile?.trim());
  $: hasMedia = hasDesktopMedia || hasMobileMedia;

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const [day, month, year] = dateStr.split('/');
      if (!day || !month || !year) return dateStr; // Retorna original se o formato for inesperado
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      });
    } catch (e) {
      return dateStr; // Retorna o texto original se houver erro
    }
  }
</script>

<header 
  class="story-header story-header--{variant}"
  class:has-media={hasMedia}
>
  {#if hasMedia}
  <div class="story-header__media-container">
    {#if backgroundImageMobile?.trim()}
      <div class="story-header__background story-header__background--mobile" style="background-image: url({backgroundImageMobile})"></div>
    {/if}
    {#if backgroundVideoMobile?.trim()}
      <video class="story-header__video story-header__video--mobile" autoplay muted loop playsinline src={backgroundVideoMobile}></video>
    {/if}

    {#if backgroundImage?.trim()}
      <div class="story-header__background story-header__background--desktop" style="background-image: url({backgroundImage})"></div>
    {/if}
    {#if backgroundVideo?.trim()}
      <video class="story-header__video story-header__video--desktop" autoplay muted loop playsinline src={backgroundVideo}></video>
    {/if}
  </div>
  {/if}

  {#if hasMedia && overlay}
    <div class="story-header__overlay"></div>
  {/if}
  
  <div class="story-header__content">
    <div class="story-header__container">
      <h1>{title}</h1>
      
      {#if subtitle}
        <p class="story-header__subtitle">{subtitle}</p>
      {/if}
      
      {#if author || date}
        <div class="story-header__meta">
          {#if author}
            <span class="story-header__author">Por {author}</span>
          {/if}
          {#if date}
            <time class="story-header__date">{formatDate(date)}</time>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
  .story-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem; /* Padding padrão para header sem imagem */
    background-color: var(--color-background);
    color: var(--color-text);
    text-align: center;
    height: 100vh;
  }

  /* ✅ ESTILOS APLICADOS APENAS QUANDO HÁ MÍDIA */
  .story-header.has-media {
    min-height: 100vh;
    padding: 6rem 2rem;
    color: #1a1a1a;
  }

  .story-header--hero.has-media {
    min-height: 100vh;
  }
  
  .story-header--minimal {
    min-height: auto; /* Minimal não precisa de altura mínima */
    padding: 2rem 0;
  }
  
  .story-header--minimal.has-media {
     min-height: 30vh;
  }

  .story-header__media-container, .story-header__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .story-header__overlay {
     background: rgba(0, 0, 0, 0.3);
     z-index: 2;
  }
  
  .story-header__background,
  .story-header__video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  background-size: 100% auto; /* ALTERE AQUI */
    background-position: center;
    object-fit: cover;
  }

  .story-header__background--desktop,
  .story-header__video--desktop {
    display: none; /* Mobile first: esconde desktop */
  }
  
  .story-header__content {
    position: relative;
    z-index: 3;
    width: 100%;
  }

  .story-header__container {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    font-size: var(--font-size-120);
    font-weight: 800;
    color: var(--color-primary);
    margin: 0 0 1rem 0;
    line-height: 1.2;
  }
  
  .story-header.has-media h1 {
      color: #1a1a1a;
  }

  h2 {
    font-size: var(--font-size-80);
    color: var(--color-secondary);
    font-weight: 400;
    margin: 0 0 2rem 0;
    line-height: 1.4;
    opacity: 0.9;
  }
  
  .story-header.has-media h2 {
      color: #1a1a1a;
  }

  .story-header__meta {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    font-size: var(--font-size-40);
    color: var(--color-subtle-text);
    opacity: 0.8;
  }
  
  .story-header.has-media .story-header__meta {
      color: #1a1a1a;
  }

  .story-header__author {
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .story-header {
      padding: 3rem 1rem;
    }
    .story-header.has-media {
      padding: 5rem 1rem;
    }
    .story-header__meta {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  /* Lógica de exibição de mídia para Desktop */
  @media (min-width: 769px) {
    .story-header__background--mobile,
    .story-header__video--mobile {
      display: none;
    }

    .story-header__background--desktop,
    .story-header__video--desktop {
      display: block;
    }
    
    h1 {
      font-size: var(--font-size-140);
    }
    
    h2 {
      font-size: var(--font-size-90);
    }
  }
</style>