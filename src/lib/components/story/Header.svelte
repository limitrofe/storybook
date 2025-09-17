<script>
  export let title = '';
  export let subtitle = '';
  export let author = '';
  export let date = '';
  export let backgroundImage = '';
  export let backgroundImageMobile = '';
  export let backgroundVideo = '';
  export let backgroundVideoMobile = '';
    export let posterImage = ''; 
  export let posterImageMobile = '';

  export let overlay = true;
  export let variant = 'default'; // 'default', 'minimal', 'hero'
  export let titleFontSizeDesktop = '';
  export let titleFontSizeMobile = '';
  export let titleLineHeightDesktop = '';
  export let titleLineHeightMobile = '';
  export let subtitleFontSizeDesktop = '';
  export let subtitleFontSizeMobile = '';
  export let subtitleLineHeightDesktop = '';
  export let subtitleLineHeightMobile = '';

  // Verificações de mídia mais rigorosas
  $: hasDesktopMedia = !!(backgroundImage?.trim() || backgroundVideo?.trim());
  $: hasMobileMedia = !!(backgroundImageMobile?.trim() || backgroundVideoMobile?.trim());
  $: hasMedia = hasDesktopMedia || hasMobileMedia;

  const titleFallbackDesktop = 'var(--typography-h1-desktop-font-size, 4.5rem)';
  const titleFallbackMobile = 'var(--typography-h1-mobile-font-size, 3rem)';
  const titleLineFallbackDesktop = 'var(--typography-h1-desktop-line-height, 1.05)';
  const titleLineFallbackMobile = 'var(--typography-h1-mobile-line-height, 1.12)';
  const subtitleFallbackDesktop = 'var(--typography-lead-desktop-font-size, 1.5rem)';
  const subtitleFallbackMobile = 'var(--typography-lead-mobile-font-size, 1.3rem)';
  const subtitleLineFallbackDesktop = 'var(--typography-lead-desktop-line-height, 1.6)';
  const subtitleLineFallbackMobile = 'var(--typography-lead-mobile-line-height, 1.6)';

  $: computedTitleDesktop = titleFontSizeDesktop || titleFallbackDesktop;
  $: computedTitleMobile = titleFontSizeMobile || titleFallbackMobile;
  $: computedTitleLineDesktop = titleLineHeightDesktop || titleLineFallbackDesktop;
  $: computedTitleLineMobile = titleLineHeightMobile || titleLineFallbackMobile;
  $: computedSubtitleDesktop = subtitleFontSizeDesktop || subtitleFallbackDesktop;
  $: computedSubtitleMobile = subtitleFontSizeMobile || subtitleFallbackMobile;
  $: computedSubtitleLineDesktop = subtitleLineHeightDesktop || subtitleLineFallbackDesktop;
  $: computedSubtitleLineMobile = subtitleLineHeightMobile || subtitleLineFallbackMobile;

  $: typographyStyle = [
    `--story-header-title-size-desktop:${computedTitleDesktop}`,
    `--story-header-title-size-mobile:${computedTitleMobile}`,
    `--story-header-title-line-desktop:${computedTitleLineDesktop}`,
    `--story-header-title-line-mobile:${computedTitleLineMobile}`,
    `--story-header-subtitle-size-desktop:${computedSubtitleDesktop}`,
    `--story-header-subtitle-size-mobile:${computedSubtitleMobile}`,
    `--story-header-subtitle-line-desktop:${computedSubtitleLineDesktop}`,
    `--story-header-subtitle-line-mobile:${computedSubtitleLineMobile}`
  ].join('; ');

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
  class:has-overlay={hasMedia && overlay}
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
  
  <div class="story-header__content" style={typographyStyle}>
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
    align-items: flex-start; /* 🔥 Muda para flex-start para posicionar no topo */
    justify-content: center;
    width: 100%;
    min-height: 100vh;
    padding: 4rem 2rem;
    padding-top: 35%;
    background-color: var(--color-background, transparent);
    color: var(--color-text, #f8fafc);
    text-align: left;
  }

  /* ✅ ESTILOS APLICADOS APENAS QUANDO HÁ MÍDIA */
  .story-header.has-media {
    min-height: 100vh;
    padding: 10% 2rem;
  }

  .story-header--hero.has-media {
    min-height: 100vh;
  }
  
  .story-header--minimal {
    min-height: auto;
    padding: 2rem 0;
  }
  
  .story-header--minimal.has-media {
     min-height: 30vh;
  }

  /* 🔥 Z-INDEX CORRIGIDO */
  .story-header__media-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1; /* Mídia atrás */
  }

  .story-header__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.25));
    z-index: 2;
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

  .story-header__background--desktop,
  .story-header__video--desktop {
    display: none; /* Mobile first: esconde desktop */
  }
  
  /* 🔥 CONTENT COM Z-INDEX ALTO */
  .story-header__content {
    position: relative;
    z-index: 10; /* 🔥 Conteúdo sempre na frente */
    width: 100%;
    padding-top: 0%;
  }

  .story-header__container {
    max-width: none;
    margin: 0 auto;
  }

  /* 🔥 TÍTULOS SEMPRE VISÍVEIS */
  h1 {
    font-size: 3rem;
    font-weight: 900;
    color: var(--color-text, #f8fafc);
    margin: 0 0 1rem 0;
    line-height: 3.3rem;
  }
  
  .story-header.has-media h1 {
    color: var(--color-text, #f8fafc);
    width: 90%;
    padding-top: 5%;
  }

  .story-header__subtitle {
    font-size: var(--story-header-subtitle-size-desktop, var(--typography-lead-desktop-font-size, 1.5rem));
    color: var(--color-text, #f8fafc);
    font-weight: 600;
    margin: 0 0 2rem 0;
    line-height: var(--story-header-subtitle-line-desktop, var(--typography-lead-desktop-line-height, 1.6));
    opacity: 0.9;
  }

  .story-header.has-media .story-header__subtitle {
    color: var(--color-text, #f8fafc);
  }

  .story-header__meta {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    font-size: var(--typography-small-desktop-font-size, 0.9rem);
    color: var(--color-subtle-text, rgba(148, 157, 166, 0.9));
    opacity: 0.85;
  }

  .story-header__author {
    font-weight: 600;
  }


  @media (max-width: 768px) {
    .story-header {
      padding: 2rem 1rem; /* 🔥 Menos padding geral */
      padding-top: 12rem; /* 🔥 Conteúdo mais próximo do topo */
      align-items: flex-start; /* 🔥 Garante alinhamento no topo */
    }
    .story-header.has-media {
      padding: 2rem 1rem;
      padding-top: 3rem; /* 🔥 Mesmo padding com mídia */
    }
    .story-header__meta {
      flex-direction: column;
      gap: 0.5rem;
    }
      .story-header.has-media h1 {
    color: var(--color-text, #f8fafc);
    /* text-shadow: 2px 2px 4px rgba(255,255,255,0.9); 🔥 Sombra BRANCA para contraste */
    width: 90%;
    font-size: 3rem;
  }
      h1 {
      font-size: 2.5rem;
      padding-top: 4%;
      line-height: 3rem;
    }
  }

  /* Desktop - ALINHAMENTO À ESQUERDA */
  @media (min-width: 769px) {
    /* 🔥 ALINHAMENTO À ESQUERDA NO DESKTOP */
    .story-header {
      text-align: left; /* 🔥 Alinha à esquerda */
      justify-content: flex-start; /* 🔥 Justifica à esquerda */
      padding: 4rem 6rem;
    }

    .story-header.has-media {
      padding: 8rem 2rem;
    }

    .story-header__container {
      margin: 0; /* 🔥 Remove centralização */
      max-width: none; /* 🔥 Remove limitação de largura */
    }

    .story-header__meta {
      justify-content: flex-start; /* 🔥 Meta à esquerda também */
    }

    /* Troca mídia mobile por desktop */
    .story-header__background--mobile,
    .story-header__video--mobile {
      display: none;
    }

    .story-header__background--desktop,
    .story-header__video--desktop {
      display: block;
    }
    
    h1 {
      font-size: 6rem;
      padding-top: 4%;
      line-height: 6rem;
    }
    
    .story-header__subtitle {
        font-size: 2rem;
        width: 400px;
    }

      .story-header.has-media h1 {
    color: var(--color-text, #f8fafc);
    /* text-shadow: 2px 2px 4px rgba(255,255,255,0.9); 🔥 Sombra BRANCA para contraste */
    font-size: 6rem;
    width: 40%;
    line-height: 6rem;
  }
  }

  @media (max-width: 768px) {
    .story-header {
      padding: 3rem 1.5rem;
      padding-top: 30%;
    }

    .story-header__container h1 {
      font-size: var(--story-header-title-size-mobile, var(--typography-h1-mobile-font-size, 3rem));
      line-height: var(--story-header-title-line-mobile, var(--typography-h1-mobile-line-height, 1.12));
    }

    .story-header__subtitle {
      font-size: var(--story-header-subtitle-size-mobile, var(--typography-lead-mobile-font-size, 1.3rem));
      line-height: var(--story-header-subtitle-line-mobile, var(--typography-lead-mobile-line-height, 1.6));
    }

    .story-header__meta {
      font-size: var(--typography-small-mobile-font-size, 0.8rem);
      flex-direction: column;
      gap: 0.5rem;
    }
  }

</style>
