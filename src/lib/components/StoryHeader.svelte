<script>
  // Props existentes
  export let title = '';
  export let subtitle = '';
  export let author = '';
  export let date = '';

  // ✅ Props de mídia atualizadas
  export let backgroundImage = '';
  export let backgroundImageMobile = '';
  export let backgroundVideo = '';
  export let backgroundVideoMobile = '';
  export let overlay = true;

  // Verificações de mídia
  $: hasDesktopMedia = !!(backgroundImage || backgroundVideo);
  $: hasMobileMedia = !!(backgroundImageMobile || backgroundVideoMobile);
  $: hasMedia = hasDesktopMedia || hasMobileMedia;

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    dateObj.setUTCDate(dateObj.getUTCDate() + 1);
    
    return dateObj.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<header class="story-header" class:has-media={hasMedia}>
  
  <div class="story-header__media-container">
    {#if backgroundImageMobile}
      <div class="story-header__background story-header__background--mobile" style="background-image: url({backgroundImageMobile})"></div>
    {/if}
    {#if backgroundVideoMobile}
      <video class="story-header__video story-header__video--mobile" autoplay muted loop playsinline src={backgroundVideoMobile}></video>
    {/if}

    {#if backgroundImage}
      <div class="story-header__background story-header__background--desktop" style="background-image: url({backgroundImage})"></div>
    {/if}
    {#if backgroundVideo}
      <video class="story-header__video story-header__video--desktop" autoplay muted loop playsinline src={backgroundVideo}></video>
    {/if}
  </div>

  {#if hasMedia && overlay}
    <div class="story-header__overlay"></div>
  {/if}
  
  <div class="story-header__content">
    <h1>{title}</h1>
    <h2>{subtitle}</h2>
    
    {#if author || date}
      <div class="meta">
        {#if author}<span>Por {author}</span>{/if}
        {#if date}<span>{formatDate(date)}</span>{/if}
      </div>
    {/if}
  </div>
</header>

<style>
  .story-header {
    position: relative;
    overflow: hidden; /* Garante que nada saia dos limites */
    text-align: center;
    padding: 3rem 1rem; /* Padding mobile primeiro */
    border-bottom: 2px solid var(--color-border);
    margin-bottom: 2rem;
  }

  /* ✅ Estilos quando HÁ mídia de fundo */
  .story-header.has-media {
    color: #232323;
    padding: 5rem 1rem;
    border-bottom: none;
  }

  .story-header__media-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  
  .story-header__background,
  .story-header__video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    object-fit: cover;
  }

  /* ✅ Lógica Mobile First: esconde a mídia de desktop por padrão */
  .story-header__background--desktop,
  .story-header__video--desktop {
    display: none;
  }
  
  .story-header__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2;
  }

  .story-header__content {
    position: relative;
    z-index: 3;
  }

  .story-header.has-media h1,
  .story-header.has-media h2,
  .story-header.has-media .meta {
    color: #fff;
  }
  
  h1 {
    font-size: var(--font-size-120);
    font-weight: 800;
    color: var(--color-primary);
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  
  h2 {
    font-size: var(--font-size-80);
    color: var(--color-secondary);
    font-weight: 400;
    margin-bottom: 1.5rem;
    line-height: 1.4;
  }
  
  .meta {
    color: var(--color-subtle-text);
    font-size: var(--font-size-60);
    font-weight: 500;
  }

  .meta span {
    margin: 0 1rem;
  }
  
  /* ✅ Estilos para Desktop (telas maiores que 768px) */
  @media (min-width: 769px) {
    .story-header {
      padding: 4rem 2rem;
    }

    .story-header.has-media {
      padding: 6rem 2rem;
    }

    /* Esconde mídia mobile e exibe mídia desktop */
    .story-header__background--mobile,
    .story-header__video--mobile {
      display: none;
    }

    .story-header__background--desktop,
    .story-header__video--desktop {
      display: block;
    }
    
    h1 {
      font-size: var(--font-size-130);
    }
    
    h2 {
      font-size: var(--font-size-90);
    }
  }
</style>