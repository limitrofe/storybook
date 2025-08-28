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
    align-items: flex-start; /* 🔥 Muda para flex-start para posicionar no topo */
    justify-content: center;
    padding: 4rem 2rem;
    padding-top: 20%; /* 🔥 Mais padding-top para empurrar conteúdo para baixo do topo */
    background-color: var(--color-background);
    color: var(--color-text);
    text-align: center;
    height: 100vh;
  }

  /* ✅ ESTILOS APLICADOS APENAS QUANDO HÁ MÍDIA */
  .story-header.has-media {
    min-height: 100vh;
    padding: 20% 2rem;
    /* 🔥 REMOVIDO: color: #1a1a1a; - estava deixando texto escuro */
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
    background: rgba(255, 255, 255, 0.7); /* 🔥 Overlay BRANCO semi-transparente */
    z-index: 2; /* Overlay no meio */
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
  }

  .story-header__container {
    max-width: 800px;
    margin: 0 auto;
  }

  /* 🔥 TÍTULOS SEMPRE VISÍVEIS */
  h1 {
    font-size: var(--font-size-120);
    font-weight: 800;
    color: var(--color-primary); /* Cor padrão sem mídia */
    margin: 0 0 1rem 0;
    line-height: 1.2;
  }
  
  /* 🔥 QUANDO TEM MÍDIA: cor escura #1a1a1a */
  .story-header.has-media h1 {
    color: #1a1a1a !important; /* 🔥 COR ESCURA FORÇADA */
    text-shadow: 2px 2px 4px rgba(255,255,255,0.9); /* 🔥 Sombra BRANCA para contraste */
  }

  .story-header__subtitle {
    font-size: var(--font-size-80);
    color: var(--color-secondary);
    font-weight: 400;
    margin: 0 0 2rem 0;
    line-height: 1.4;
    opacity: 0.9;
  }
  
  .story-header.has-media .story-header__subtitle {
    color: #1a1a1a !important; /* 🔥 COR ESCURA FORÇADA */
    text-shadow: 2px 2px 4px rgba(255,255,255,0.9); /* 🔥 Sombra BRANCA */
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
    color: #1a1a1a !important; /* 🔥 COR ESCURA FORÇADA */
    text-shadow: 1px 1px 2px rgba(255,255,255,0.9); /* 🔥 Sombra BRANCA */
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
      padding-top: 6rem; /* 🔥 Mesmo padding com mídia */
    }
    .story-header__meta {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  /* Desktop - ALINHAMENTO À ESQUERDA */
  @media (min-width: 769px) {
    /* 🔥 ALINHAMENTO À ESQUERDA NO DESKTOP */
    .story-header {
      text-align: left; /* 🔥 Alinha à esquerda */
      justify-content: flex-start; /* 🔥 Justifica à esquerda */
      padding: 4rem 2rem;
    }

    .story-header.has-media {
      padding: 6rem 2rem;
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
      font-size: var(--font-size-140);
    }
    
    .story-header__subtitle {
      font-size: var(--font-size-90);
    }
  }
</style>