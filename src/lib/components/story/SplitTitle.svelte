<!-- src/lib/components/story/SplitTitle.svelte -->
<script>
  // Props principais
  export let text = '';
  export let image = '';
  export let underlineLines = '';

  // Imagens principais (Desktop e Mobile) 
  export let imageDesktop = '';
  export let imageMobile = '';

  // Sistema de grifo/destaque
  export let underlineImageDesktop = '';
  export let underlineImageMobile = '';
  export let underlineGif = '';

  // Dimensões do grifo
  export let underlineWidthDesktop = '250px';
  export let underlineHeightDesktop = '20px';
  export let underlineWidthMobile = '180px';
  export let underlineHeightMobile = '18px';

  // Cores
  export let backgroundColor = '#1a1a1a';
  export let textColor = '#ffffff';

  // ✅ NOVO: Controle de largura do texto
  export let textWidth = '70%';        // Desktop
  export let textWidthMobile = '100%'; // Mobile

  // Lógica para resolver as imagens
  $: finalImageDesktop = imageDesktop || image;
  $: finalImageMobile = imageMobile || image || finalImageDesktop;
  $: finalUnderlineDesktop = underlineImageDesktop || underlineGif;
  $: finalUnderlineMobile = underlineImageMobile || underlineGif || finalUnderlineDesktop;

  // Processar texto e linhas
  $: lines = text.split('<br>').map(line => line.trim());
  $: linesToUnderline = underlineLines.toString().split(',').map(n => parseInt(n.trim(), 10));
</script>

<section 
  class="split-section" 
  style="
    --bg-color: {backgroundColor}; 
    --text-color: {textColor};
    --text-width: {textWidth};
    --text-width-mobile: {textWidthMobile};
  "
>
  <!-- Imagem de fundo (fica atrás de tudo) -->
  <div class="background-image">
    <picture>
      <source 
        media="(max-width: 799px)" 
        srcset={finalImageMobile}
      >
      <source 
        media="(min-width: 800px)" 
        srcset={finalImageDesktop}
      >
      <img src={finalImageDesktop} alt="Imagem de destaque" />
    </picture>
  </div>

  <!-- Texto por cima da imagem -->
  <div class="text-overlay">
    <div class="text-wrapper">
      <h2 class="title">
        {#if text && text.trim()}
          {#each lines as line, i}
            {@const lineNumber = i + 1}
            {@const shouldUnderline = linesToUnderline.includes(lineNumber)}

            <span class="line-container" class:has-underline={shouldUnderline}>
              {@html line}

              {#if shouldUnderline && finalUnderlineDesktop}
                <picture class="underline-image">
                  <source 
                    media="(max-width: 799px)" 
                    srcset={finalUnderlineMobile}
                  >
                  <source 
                    media="(min-width: 800px)" 
                    srcset={finalUnderlineDesktop}
                  >
                  <img 
                    src={finalUnderlineDesktop} 
                    alt="Grifo decorativo"
                    style="
                      --w-desktop: {underlineWidthDesktop};
                      --h-desktop: {underlineHeightDesktop};
                      --w-mobile: {underlineWidthMobile};
                      --h-mobile: {underlineHeightMobile};
                    "
                  />
                </picture>
              {/if}
            </span>

            {#if i < lines.length - 1}<br />{/if}
          {/each}
        {/if}
      </h2>
    </div>
  </div>
</section>

<style>
  /* ================================
     CONTAINER PRINCIPAL
     ================================ */

  .split-section {
    position: relative;
    width: 100%;
    min-height: 70vh;
    background-color: var(--bg-color);
    margin: 0;
    padding: 0;
    overflow: hidden;
    display: flex;
    align-items: flex-end; /* Alinha conteúdo na base */
  }

  /* ================================
     IMAGEM DE FUNDO
     ================================ */

  .background-image {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    z-index: 1;
  }

  .background-image picture,
  .background-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: right bottom; /* Imagem alinhada direita e embaixo */
    display: block;
  }

  /* ================================
     TEXTO SOBREPOSTO
     ================================ */

  .text-overlay {
    position: relative;
    z-index: 2;
    width: var(--text-width-mobile);
    padding: 2rem 1.5rem;
    display: flex;
    align-items: center;
    min-height: 70vh;
  }

  .text-wrapper {
    width: 100%;
  }

  .title {
    font-family: 'obviously-compressed', 'Arial Black', sans-serif;
    font-size: clamp(1.8rem, 8vw, 3.2rem);
    font-weight: 900;
    line-height: 1.05;
    color: var(--text-color);
    text-align: left;
    margin: 0;
  }

  /* ================================
     SISTEMA DE GRIFO/DESTAQUE
     ================================ */

  .line-container {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .line-container.has-underline {
    padding-bottom: 30px;
  }

  .underline-image {
    position: absolute;
    bottom: -5px;
    left: 0;
    pointer-events: none;
    z-index: 3;
  }

  .underline-image img {
    width: var(--w-mobile);
    height: var(--h-mobile);
    object-fit: contain;
    display: block;
  }

  /* ================================
     DESKTOP - 800px+
     ================================ */

  @media (min-width: 800px) {
    .split-section {
      min-height: 80vh;
    }

    .text-overlay {
      width: var(--text-width);
      padding: 3rem 2rem;
      min-height: 80vh;
    }

    .title {
      font-size: clamp(2.5rem, 5vw, 4.5rem);
    }

    .line-container.has-underline {
      padding-bottom: 35px;
    }

    .underline-image img {
      width: var(--w-desktop);
      height: var(--h-desktop);
    }
  }

  /* ================================
     ULTRA WIDE - 1200px+
     ================================ */

  @media (min-width: 1200px) {
    .text-overlay {
      padding: 4rem 3rem;
    }

    .title {
      font-size: clamp(3rem, 4vw, 5rem);
    }
  }

  /* ================================
     ACESSIBILIDADE
     ================================ */

  @media (prefers-reduced-motion: reduce) {
    .underline-image img {
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