<script>
  export let title = '';
  export let subtitle = '';
  export let backgroundImage = '';
  export let backgroundImageMobile = '';
  export let backgroundVideo = '';
  export let backgroundVideoMobile = '';
  export let backgroundPosition = 'center';
  export let backgroundPositionMobile = 'center';
  export let overlay = true;
  export let variant = 'default';
  export let size = 'medium';
  export let height = '';
  export let heightMobile = '';
  export let textPosition = 'center';
  export let textPositionMobile = '';
  export let textAlign = 'center';
  export let textAlignMobile = '';

  // Verificar se realmente tem mídia
  $: hasMedia = !!(backgroundImage || backgroundVideo);
  $: hasMobileMedia = !!(backgroundImageMobile || backgroundVideoMobile);

  // Criar classes dinâmicas seguras
  $: alignClass = textAlign === 'left' ? 'text-align-left' : 
                  textAlign === 'right' ? 'text-align-right' : 'text-align-center';
  
  $: positionClass = textPosition === 'top' ? 'text-position-top' : 
                     textPosition === 'bottom' ? 'text-position-bottom' : 'text-position-center';

  $: alignClassMobile = textAlignMobile === 'left' ? 'text-align-mobile-left' : 
                        textAlignMobile === 'right' ? 'text-align-mobile-right' : 
                        textAlignMobile === 'center' ? 'text-align-mobile-center' : '';
  
  $: positionClassMobile = textPositionMobile === 'top' ? 'text-position-mobile-top' : 
                           textPositionMobile === 'bottom' ? 'text-position-mobile-bottom' : 
                           textPositionMobile === 'center' ? 'text-position-mobile-center' : '';

  // Styles dinâmicos só se tiver imagem E com url() wrapper
  $: desktopStyle = [
    height ? `min-height: ${height}` : '',
    backgroundImage ? `background-image: url(${backgroundImage})` : '',
    backgroundImage && backgroundPosition ? `background-position: ${backgroundPosition}` : ''
  ].filter(Boolean).join('; ');

  $: mobileStyle = [
    heightMobile ? `min-height: ${heightMobile}` : '',
    backgroundImageMobile ? `background-image: url(${backgroundImageMobile})` : '',
    backgroundImageMobile && backgroundPositionMobile ? `background-position: ${backgroundPositionMobile}` : ''
  ].filter(Boolean).join('; ');

  // Debug para desenvolvimento
  $: if (import.meta.env.DEV) {
    console.log('🎨 SectionTitle Debug:', {
      title,
      hasMedia,
      backgroundImage,
      backgroundImageDecoded: backgroundImage ? decodeURIComponent(backgroundImage) : null,
      desktopStyle,
      variant,
      size,
      textPosition,
      textAlign
    });
  }
</script>

<section 
  class="section-title section-title--{variant} section-title--{size} {alignClass} {positionClass} {alignClassMobile} {positionClassMobile}"
  class:has-media={hasMedia}
  class:has-mobile-media={hasMobileMedia}
  style={desktopStyle}
>
  {#if backgroundImage}
    <div 
      class="section-title__background section-title__background--desktop"
      style="background-image: url({backgroundImage}); background-position: {backgroundPosition};"
    ></div>
  {/if}

  {#if backgroundImageMobile}
    <div 
      class="section-title__background section-title__background--mobile"
      style="background-image: url({backgroundImageMobile}); background-position: {backgroundPositionMobile};"
    ></div>
  {/if}

  {#if backgroundVideo}
    <video 
      class="section-title__background-video section-title__background-video--desktop" 
      autoplay 
      muted 
      loop 
      playsinline
    >
      <source src={backgroundVideo} type="video/mp4" />
    </video>
  {/if}

  {#if backgroundVideoMobile}
    <video 
      class="section-title__background-video section-title__background-video--mobile" 
      autoplay 
      muted 
      loop 
      playsinline
    >
      <source src={backgroundVideoMobile} type="video/mp4" />
    </video>
  {/if}

  {#if overlay && (hasMedia || hasMobileMedia)}
    <div class="section-title__overlay"></div>
  {/if}

  <div class="section-title__content">
    <div class="section-title__container">
      <h2 class="section-title__title">{title}</h2>
      {#if subtitle}
        <p class="section-title__subtitle">{subtitle}</p>
      {/if}
    </div>
  </div>
</section>

<style>
  .section-title {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    background-color: var(--color-background);
    margin: 2rem 0;
  }

  /* Cor do texto só muda se REALMENTE tiver mídia */
  .section-title.has-media,
  .section-title.has-mobile-media {
    color: white;
  }

  /* Sizes SEM imagem - espaçamentos menores */
  .section-title--small:not(.has-media):not(.has-mobile-media) {
    min-height: auto;
    padding: 1rem 0;
  }

  .section-title--medium:not(.has-media):not(.has-mobile-media) {
    min-height: auto;
    padding: 1.5rem 0;
  }

  .section-title--large:not(.has-media):not(.has-mobile-media) {
    min-height: auto;
    padding: 2rem 0;
  }

  /* Sizes COM imagem (só aplica se tiver .has-media) */
  .section-title--small.has-media,
  .section-title--small.has-mobile-media {
    min-height: 200px;
    padding: 2rem 0;
  }

  .section-title--medium.has-media,
  .section-title--medium.has-mobile-media {
    min-height: 300px;
    padding: 3rem 0;
  }

  .section-title--large.has-media,
  .section-title--large.has-mobile-media {
    min-height: 400px;
    padding: 4rem 0;
  }

  /* Posicionamento vertical do texto - DESKTOP */
  .section-title.text-position-top {
    align-items: flex-start;
    padding-top: 3rem;
  }

  .section-title.text-position-center {
    align-items: center;
  }

  .section-title.text-position-bottom {
    align-items: flex-end;
    padding-bottom: 3rem;
  }

  /* Alinhamento horizontal do texto - DESKTOP */
  .section-title.text-align-left .section-title__container {
    text-align: left;
  }

  .section-title.text-align-center .section-title__container {
    text-align: center;
  }

  .section-title.text-align-right .section-title__container {
    text-align: right;
  }

  /* Background Elements */
  .section-title__background,
  .section-title__background-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-size: cover;
    background-repeat: no-repeat;
    z-index: 1;
  }

  /* Desktop backgrounds - visíveis apenas no desktop */
  .section-title__background--desktop,
  .section-title__background-video--desktop {
    display: block;
  }

  /* Mobile backgrounds - ocultos no desktop */
  .section-title__background--mobile,
  .section-title__background-video--mobile {
    display: none;
  }

  .section-title__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2;
  }

  .section-title__content {
    position: relative;
    z-index: 3;
    width: 100%;
    padding: 0 2rem;
  }

  .section-title__container {
    max-width: 800px;
    margin: 0 auto;
  }

  /* Variants */
  .section-title--default .section-title__container {
    text-align: left;
  }

  .section-title--centered .section-title__container {
    text-align: center;
  }

  /* ▼▼▼ INÍCIO DA ALTERAÇÃO ▼▼▼ */
  .section-title--minimal {
    background: none;
    border: none;
    margin: 2.5rem 0;
    padding: 0;
    /* justify-content: center; é herdado do .section-title, o que já centraliza na horizontal */
  }

  .section-title--minimal .section-title__container {
    position: relative;
    text-align: center; /* Centraliza o texto */
    border: none;
    padding: 0;
    padding-top: 1.5rem;
    margin: 0 auto; /* Garante que o container se centralize */
  }

  /* A linha de 30% de largura, agora centralizada */
  .section-title--minimal .section-title__container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%); /* O truque para centralizar horizontalmente */
    width: 30%;
    height: 2px;
    background-color: var(--color-primary);
  }
  /* ▲▲▲ FIM DA ALTERAÇÃO ▲▲▲ */


  /* Estilo para seções sem mídia (sem fundo) */
  .section-title:not(.has-media):not(.has-mobile-media):not(.section-title--minimal) {
    background: transparent;
    border: none;
    color: var(--color-text);
  }

  /* Typography */
  .section-title__title {
    font-size: var(--font-size-120);
    font-weight: 800;
    line-height: 1.2;
    margin: 0 0 1rem 0;
  }

  .section-title--small .section-title__title {
    font-size: var(--font-size-100);
  }

  .section-title--large .section-title__title {
    font-size: var(--font-size-140);
  }

  .section-title__subtitle {
    font-size: var(--font-size-80);
    font-weight: 400;
    line-height: 1.4;
    margin: 0;
    opacity: 0.9;
  }

  /* ========== MOBILE STYLES ========== */
  @media (max-width: 768px) {
    .section-title {
      margin: 1.5rem 0;
    }

    .section-title--minimal {
      margin: 2rem 0;
    }

    /* Mobile backgrounds - visíveis apenas no mobile */
    .section-title__background--mobile,
    .section-title__background-video--mobile {
      display: block;
    }

    /* Desktop backgrounds - ocultos no mobile */
    .section-title__background--desktop,
    .section-title__background-video--desktop {
      display: none;
    }

    /* Posicionamento vertical MOBILE (sobrescreve desktop se definido) */
    .section-title.text-position-mobile-top {
      align-items: flex-start !important;
      padding-top: 2rem;
      padding-bottom: 0;
    }

    .section-title.text-position-mobile-center {
      align-items: center !important;
      padding-top: 0;
      padding-bottom: 0;
    }

    .section-title.text-position-mobile-bottom {
      align-items: flex-end !important;
      padding-bottom: 2rem;
      padding-top: 0;
    }

    /* Alinhamento horizontal MOBILE (sobrescreve desktop se definido) */
    .section-title.text-align-mobile-left .section-title__container {
      text-align: left !important;
    }

    .section-title.text-align-mobile-center .section-title__container {
      text-align: center !important;
    }

    .section-title.text-align-mobile-right .section-title__container {
      text-align: right !important;
    }

    /* Typography mobile */
    .section-title__title {
      font-size: var(--font-size-100);
    }

    .section-title--large .section-title__title {
      font-size: var(--font-size-120);
    }

    .section-title__subtitle {
      font-size: var(--font-size-70);
    }
  }

  /* Regra de debug visual em desenvolvimento */
  @media (max-width: 768px) {
    .section-title:not(.has-media):not(.has-mobile-media):not(.section-title--minimal) {
      border-left: 0px solid var(--color-primary);
    }
  }
</style>