<script>
  export let title = '';
  export let subtitle = '';
  export let backgroundImage = '';
  export let backgroundImageMobile = '';
  export let backgroundPosition = 'center';
  export let backgroundPositionMobile = 'center';
  export let backgroundVideo = '';
  export let backgroundVideoMobile = '';
  export let backgroundColor = ''; // ✅ NOVO CAMPO
  export let textColor = ''; // ✅ NOVO CAMPO
  export let variant = 'default'; // default, centered, minimal
  export let size = 'medium'; // small, medium, large
  export let height = '';
  export let heightMobile = '';
  export let textPosition = 'center'; // top, center, bottom
  export let textPositionMobile = '';
  export let textAlign = 'center'; // left, center, right
  export let textAlignMobile = '';
  export let overlay = false;
  export let fontFamily = 'Globotipo'; // ✅ NOVO: obviously, obviously-compressed, default

  // Lógica reativa para determinar se há mídia
  $: hasMedia = !!(backgroundImage || backgroundVideo);
  $: hasMobileMedia = !!(backgroundImageMobile || backgroundVideoMobile);

  // Classes CSS dinâmicas para alinhamento de texto
  $: alignClass = textAlign ? `text-align-${textAlign}` : '';
  $: alignClassMobile = textAlignMobile ? `text-align-mobile-${textAlignMobile}` : '';

  // Classes CSS dinâmicas para posição de texto
  $: positionClass = textPosition ? `text-position-${textPosition}` : '';
  $: positionClassMobile = textPositionMobile ? `text-position-mobile-${textPositionMobile}` : '';

  // Classes CSS dinâmicas para fonte
  $: fontClass = fontFamily ? `font-${fontFamily}` : '';

  // Decodificar URLs se necessário
  $: backgroundImageDecoded = backgroundImage ? decodeURIComponent(backgroundImage) : '';
  $: backgroundImageMobileDecoded = backgroundImageMobile ? decodeURIComponent(backgroundImageMobile) : '';

  // Estilos dinâmicos para desktop com !important
  $: desktopStyle = [
    height ? `min-height: ${height}` : '',
    backgroundColor ? `background-color: ${backgroundColor} !important` : '',
    backgroundImageDecoded ? `background-image: url(${backgroundImageDecoded})` : '',
    backgroundImageDecoded && backgroundPosition ? `background-position: ${backgroundPosition}` : ''
  ].filter(Boolean).join('; ');

  $: mobileStyle = [
    heightMobile ? `min-height: ${heightMobile}` : '',
    backgroundImageMobileDecoded ? `background-image: url(${backgroundImageMobileDecoded})` : '',
    backgroundImageMobileDecoded && backgroundPositionMobile ? `background-position: ${backgroundPositionMobile}` : ''
  ].filter(Boolean).join('; ');

  // Estilo do texto com !important para sobrescrever temas
  $: textStyle = [
    textColor ? `color: ${textColor} !important` : '',
    backgroundColor ? `background-color: ${backgroundColor} !important` : ''
  ].filter(Boolean).join('; ');

  $: titleSizeDesktop = titleFontSizeDesktop || 'var(--typography-h2-desktop-font-size, 3rem)';
  $: titleSizeMobile = titleFontSizeMobile || 'var(--typography-h2-mobile-font-size, 2.4rem)';
  $: titleLineDesktop = titleLineHeightDesktop || 'var(--typography-h2-desktop-line-height, 1.1)';
  $: titleLineMobile = titleLineHeightMobile || 'var(--typography-h2-mobile-line-height, 1.15)';
  $: subtitleSizeDesktop = subtitleFontSizeDesktop || 'var(--typography-lead-desktop-font-size, 1.5rem)';
  $: subtitleSizeMobile = subtitleFontSizeMobile || 'var(--typography-lead-mobile-font-size, 1.3rem)';
  $: subtitleLineDesktop = subtitleLineHeightDesktop || 'var(--typography-lead-desktop-line-height, 1.6)';
  $: subtitleLineMobile = subtitleLineHeightMobile || 'var(--typography-lead-mobile-line-height, 1.6)';

  $: typographyStyle = [
    `--section-title-title-size-desktop:${titleSizeDesktop}`,
    `--section-title-title-line-desktop:${titleLineDesktop}`,
    `--section-title-title-size-mobile:${titleSizeMobile}`,
    `--section-title-title-line-mobile:${titleLineMobile}`,
    `--section-title-subtitle-size-desktop:${subtitleSizeDesktop}`,
    `--section-title-subtitle-line-desktop:${subtitleLineDesktop}`,
    `--section-title-subtitle-size-mobile:${subtitleSizeMobile}`,
    `--section-title-subtitle-line-mobile:${subtitleLineMobile}`
  ].join('; ');

  // Debug para desenvolvimento
  $: if (import.meta.env.DEV) {
    console.log('🎨 SectionTitle Debug:', {
      title,
      hasMedia,
      backgroundColor,
      textColor,
      fontFamily,
      variant,
      size
    });
  }
</script>

<section 
  class="section-title section-title--{variant} section-title--{size} {alignClass} {positionClass} {alignClassMobile} {positionClassMobile} {fontClass}"
  class:has-media={hasMedia}
  class:has-mobile-media={hasMobileMedia}
  style={desktopStyle}
>
  {#if backgroundImage}
    <div 
      class="section-title__background section-title__background--desktop"
      style="background-image: url({backgroundImageDecoded}); background-position: {backgroundPosition};"
    ></div>
  {/if}

  {#if backgroundImageMobile}
    <div 
      class="section-title__background section-title__background--mobile"
      style="background-image: url({backgroundImageMobileDecoded}); background-position: {backgroundPositionMobile};"
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

  <div class="section-title__content" style={`${textStyle}; ${typographyStyle}`}> 
    <div class="section-title__container">
      <h2 class="section-title__title" style={textColor ? `color: ${textColor} !important` : ''}>{title}</h2>
      {#if subtitle}
        <p class="section-title__subtitle" style={textColor ? `color: ${textColor} !important` : ''}>{subtitle}</p>
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
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  /* ✅ CORES CUSTOMIZADAS COM ALTA ESPECIFICIDADE */
  .section-title[style*="background-color"] {
    background-color: inherit !important;
  }

  .section-title__title[style*="color"] {
    color: inherit !important;
  }

  .section-title__subtitle[style*="color"] {
    color: inherit !important;
  }

  .section-title__content[style*="color"] * {
    color: inherit !important;
  }
  .font-obviously .section-title__title {
    font-family: "obviously", sans-serif;
    font-weight: 600;
  }

  .font-obviously .section-title__subtitle {
    font-family: "obviously", sans-serif;
    font-weight: 400;
  }

  .font-obviously-compressed .section-title__title {
    font-family: "obviously-compressed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }

  .font-obviously-compressed .section-title__subtitle {
    font-family: "obviously", sans-serif;
    font-weight: 400;
    text-transform: none;
    letter-spacing: normal;
  }

  .font-default .section-title__title {
    font-family: var(--font-family-heading);
    font-weight: var(--font-weight-bold);
  }

  .font-default .section-title__subtitle {
    font-family: var(--font-family-body);
    font-weight: var(--font-weight-normal);
  }

  /* Cor do texto só muda se REALMENTE tiver mídia */
  .section-title.has-media,
  .section-title.has-mobile-media {
    color: white;
  }

  /* Backgrounds */
  .section-title__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    z-index: 1;
  }

  .section-title__background--desktop {
    display: block;
  }

  .section-title__background--mobile {
    display: none;
  }

  .section-title__background-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
  }

  .section-title__background-video--desktop {
    display: block;
  }

  .section-title__background-video--mobile {
    display: none;
  }

  .section-title__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.15));
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

  .section-title--minimal {
    background: none;
    border: none;
    margin: 2.5rem 0;
    padding: 0;
  }

  .section-title--minimal .section-title__container {
    position: relative;
    text-align: center;
    border: none;
    padding: 0;
    padding-top: 1.5rem;
    margin: 0 auto;
  }

  .section-title--minimal .section-title__container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30%;
    height: 2px;
    background-color: var(--color-primary);
  }

  /* Estilo para seções sem mídia (sem fundo) */
  .section-title:not(.has-media):not(.has-mobile-media):not(.section-title--minimal) {
    background: transparent;
    border: none;
    color: var(--color-text, #f8fafc);
  }

  /* Typography */
  .section-title__title {
    font-size: var(--section-title-title-size-desktop, var(--typography-h2-desktop-font-size, 3rem));
    line-height: var(--section-title-title-line-desktop, var(--typography-h2-desktop-line-height, 1.1));
    font-weight: 800;
    margin: 0 0 1rem 0;
    color: inherit;
  }

  .section-title__subtitle {
    font-size: var(--section-title-subtitle-size-desktop, var(--typography-lead-desktop-font-size, 1.5rem));
    line-height: var(--section-title-subtitle-line-desktop, var(--typography-lead-desktop-line-height, 1.6));
    font-weight: 400;
    margin: 0;
    opacity: 0.9;
    color: inherit;
  }

  /* Text positioning */
  .text-position-top {
    align-items: flex-start;
    padding-top: 2rem;
  }

  .text-position-center {
    align-items: center;
  }

  .text-position-bottom {
    align-items: flex-end;
    padding-bottom: 2rem;
  }

  /* Text alignment */
  .text-align-left .section-title__container {
    text-align: left;
  }

  .text-align-center .section-title__container {
    text-align: center;
  }

  .text-align-right .section-title__container {
    text-align: right;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .section-title__background--desktop {
      display: none;
    }

    .section-title__background--mobile {
      display: block;
    }

    .section-title__background-video--desktop {
      display: none;
    }

    .section-title__background-video--mobile {
      display: block;
    }

    .section-title__content {
      padding: 0 1rem;
    }

    .section-title__title {
      font-size: var(--section-title-title-size-mobile, var(--typography-h2-mobile-font-size, 2.4rem));
      line-height: var(--section-title-title-line-mobile, var(--typography-h2-mobile-line-height, 1.15));
    }

    .section-title__subtitle {
      font-size: var(--section-title-subtitle-size-mobile, var(--typography-lead-mobile-font-size, 1.3rem));
      line-height: var(--section-title-subtitle-line-mobile, var(--typography-lead-mobile-line-height, 1.6));
    }

    /* Mobile text positioning */
    .text-position-mobile-top {
      align-items: flex-start;
      padding-top: 1rem;
    }

    .text-position-mobile-center {
      align-items: center;
    }

    .text-position-mobile-bottom {
      align-items: flex-end;
      padding-bottom: 1rem;
    }

    /* Mobile text alignment */
    .text-align-mobile-left .section-title__container {
      text-align: left;
    }

    .text-align-mobile-center .section-title__container {
      text-align: center;
    }

    .text-align-mobile-right .section-title__container {
      text-align: right;
    }
  }
</style>
