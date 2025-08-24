<!-- src/lib/components/story/FlexibleLayout.svelte -->
<script>
  // TEXTO - Controle total
  export let text = '';
  export let textAlign = 'left'; // left, right, center
  export let textPosition = 'left'; // left, right, center (posição na tela)
  export let textColor = '#ffffff';
  export let fontSize = 'clamp(2rem, 5vw, 4rem)';
  export let fontSizeMobile = 'clamp(1.5rem, 8vw, 2.5rem)';
  export let textZIndex = 2;

  // IMAGEM 1 - Grifo/Destaque
  export let image1Desktop = '';
  export let image1Mobile = '';
  export let image1Width = '200px';
  export let image1Height = '20px';
  export let image1WidthMobile = '150px';
  export let image1HeightMobile = '15px';
  export let image1X = '0px'; // Posição X
  export let image1Y = '0px'; // Posição Y
  export let image1XMobile = '0px';
  export let image1YMobile = '0px';
  export let image1ZIndex = 3;

  // IMAGEM 2 - Principal
  export let image2Desktop = '';
  export let image2Mobile = '';
  export let image2Width = '400px';
  export let image2Height = '500px';
  export let image2WidthMobile = '300px';
  export let image2HeightMobile = '400px';
  export let image2Position = 'right'; // left, right, center, top, middle, bottom
  export let image2X = '0px';
  export let image2Y = '0px';
  export let image2XMobile = '0px';
  export let image2YMobile = '0px';
  export let image2ZIndex = 1;

  // LAYOUT
  export let backgroundColor = '#1a1a1a';
  export let minHeight = '80vh';
  export let minHeightMobile = '70vh';
  export let padding = '2rem';
  export let paddingMobile = '1.5rem';

  // Lógica para processar o texto
  $: lines = text.split('<br>').map(line => line.trim());

  // Resolver imagens com fallback
  $: finalImage1Mobile = image1Mobile || image1Desktop;
  $: finalImage2Mobile = image2Mobile || image2Desktop;

  // Classes para posicionamento do texto
  $: textPositionClass = `text-position-${textPosition}`;
  $: textAlignClass = `text-align-${textAlign}`;

  // Classes para posicionamento da imagem 2
  $: image2PositionClass = `image2-position-${image2Position}`;
</script>

<section 
  class="flexible-layout"
  style="
    --bg-color: {backgroundColor};
    --min-height: {minHeight};
    --min-height-mobile: {minHeightMobile};
    --padding: {padding};
    --padding-mobile: {paddingMobile};
    --text-color: {textColor};
    --font-size: {fontSize};
    --font-size-mobile: {fontSizeMobile};
    --text-z-index: {textZIndex};
    --image1-width: {image1Width};
    --image1-height: {image1Height};
    --image1-width-mobile: {image1WidthMobile};
    --image1-height-mobile: {image1HeightMobile};
    --image1-x: {image1X};
    --image1-y: {image1Y};
    --image1-x-mobile: {image1XMobile};
    --image1-y-mobile: {image1YMobile};
    --image1-z-index: {image1ZIndex};
    --image2-width: {image2Width};
    --image2-height: {image2Height};
    --image2-width-mobile: {image2WidthMobile};
    --image2-height-mobile: {image2HeightMobile};
    --image2-x: {image2X};
    --image2-y: {image2Y};
    --image2-x-mobile: {image2XMobile};
    --image2-y-mobile: {image2YMobile};
    --image2-z-index: {image2ZIndex};
  "
>
  <!-- IMAGEM 2 - Principal (fica atrás) -->
  {#if image2Desktop}
    <div class="image2-container {image2PositionClass}">
      <picture class="image2">
        <source 
          media="(max-width: 799px)" 
          srcset={finalImage2Mobile}
        >
        <source 
          media="(min-width: 800px)" 
          srcset={image2Desktop}
        >
        <img 
          src={image2Desktop} 
          alt="Imagem principal" 
        />
      </picture>
    </div>
  {/if}

  <!-- TEXTO -->
  <div class="text-container {textPositionClass} {textAlignClass}">
    <div class="text-wrapper">
      <h2 class="title">
        {#each lines as line, i}
          <span class="line">
            {@html line}
          </span>
          {#if i < lines.length - 1}<br />{/if}
        {/each}
      </h2>
    </div>
  </div>

  <!-- IMAGEM 1 - Grifo/Destaque (fica na frente) -->
  {#if image1Desktop}
    <div class="image1-container">
      <picture class="image1">
        <source 
          media="(max-width: 799px)" 
          srcset={finalImage1Mobile}
        >
        <source 
          media="(min-width: 800px)" 
          srcset={image1Desktop}
        >
        <img 
          src={image1Desktop} 
          alt="Destaque decorativo" 
        />
      </picture>
    </div>
  {/if}
</section>

<style>
  /* ================================
     CONTAINER PRINCIPAL
     ================================ */

  .flexible-layout {
    position: relative;
    width: 100%;
    min-height: var(--min-height-mobile);
    background-color: var(--bg-color);
    padding: var(--padding-mobile);
    margin: 0;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column; /* MOBILE: vertical stack */
    align-items: flex-start;
  }

  /* ================================
     TEXTO
     ================================ */

  .text-container {
    position: relative;
    z-index: var(--text-z-index);
    width: 100%;
    display: flex;
    order: 1; /* MOBILE: texto primeiro */
    margin-bottom: 2rem;
  }

  /* Posicionamento do texto na tela */
  .text-position-left {
    justify-content: flex-start;
  }

  .text-position-center {
    justify-content: center;
  }

  .text-position-right {
    justify-content: flex-end;
  }

  .text-wrapper {
    max-width: 100%;
  }

  .title {
    font-family: 'obviously-compressed', 'Arial Black', sans-serif;
    font-size: var(--font-size-mobile);
    font-weight: 900;
    line-height: 1.05;
    color: var(--text-color);
    margin: 0;
  }

  /* Alinhamento do texto dentro do wrapper */
  .text-align-left .title {
    text-align: left;
  }

  .text-align-center .title {
    text-align: center;
  }

  .text-align-right .title {
    text-align: right;
  }

  .line {
    display: inline-block;
    width: 100%;
  }

  /* ================================
     IMAGEM 1 - Grifo/Destaque
     ================================ */

  .image1-container {
    position: absolute;
    z-index: var(--image1-z-index);
    top: var(--image1-y-mobile);
    left: var(--image1-x-mobile);
    pointer-events: none;
  }

  .image1 img {
    width: var(--image1-width-mobile);
    height: var(--image1-height-mobile);
    object-fit: contain;
    display: block;
  }

  /* ================================
     IMAGEM 2 - Principal
     ================================ */

  .image2-container {
    position: relative; /* MOBILE: posição relative */
    z-index: var(--image2-z-index);
    order: 2; /* MOBILE: imagem depois */
    width: 100%;
    max-width: 80%;
    margin: 0 auto;
  }

  .image2 img {
    width: 100%;
    height: auto;
    max-height: 50vh;
    object-fit: cover;
    display: block;
  }

  /* Posições pré-definidas para imagem 2 */
  .image2-position-right {
    right: 0;
    left: auto;
  }

  .image2-position-center {
    left: 50%;
    transform: translateX(-50%);
  }

  .image2-position-top {
    top: 0;
  }

  .image2-position-middle {
    top: 50%;
    transform: translateY(-50%);
  }

  .image2-position-bottom {
    bottom: 0;
    top: auto;
  }

  /* ✅ NOVO: Posições combinadas que faltavam */
  .image2-position-right-bottom {
    right: 0;
    bottom: 0;
    top: auto;
    left: auto;
  }

  .image2-position-left-bottom {
    left: 0;
    bottom: 0;
    top: auto;
    right: auto;
  }

  .image2-position-center-middle {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  /* Combinações antigas (mantendo compatibilidade) */
  .image2-position-right.image2-position-bottom {
    right: 0;
    bottom: 0;
    top: auto;
    left: auto;
  }

  .image2-position-center.image2-position-middle {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  /* ================================
     DESKTOP - 800px+
     ================================ */

  @media (min-width: 800px) {
    .flexible-layout {
      min-height: var(--min-height);
      padding: var(--padding);
      flex-direction: row; /* DESKTOP: lado a lado */
      align-items: center;
    }

    .text-container {
      order: 1;
      width: 60%;
      margin-bottom: 0;
    }

    .title {
      font-size: var(--font-size);
    }

    /* DESKTOP: Imagem 1 absolute */
    .image1-container {
      top: var(--image1-y);
      left: var(--image1-x);
    }

    .image1 img {
      width: var(--image1-width);
      height: var(--image1-height);
    }

    /* DESKTOP: Imagem 2 absolute */
    .image2-container {
      position: absolute;
      order: 2;
      width: auto;
      max-width: none;
      margin: 0;
      top: var(--image2-y);
      left: var(--image2-x);
    }

    .image2 img {
      width: var(--image2-width);
      height: var(--image2-height);
      max-height: none;
    }
  }

  /* ================================
     ULTRA WIDE - 1200px+
     ================================ */

  @media (min-width: 1200px) {
    .flexible-layout {
      padding: calc(var(--padding) * 1.2);
    }
  }

  /* ================================
     ACESSIBILIDADE
     ================================ */

  @media (prefers-reduced-motion: reduce) {
    .image1 img {
      animation: none !important;
    }
  }

  @supports not (font-family: 'obviously-compressed') {
    .title {
      font-family: 'Arial Black', 'Helvetica', sans-serif;
      font-weight: 900;
      letter-spacing: -0.02em;
    }
  }
</style>