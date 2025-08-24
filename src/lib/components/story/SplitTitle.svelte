<script>
  // Props para controle total
  export let text = '';
  export let underlineLines = '';

  // Imagem principal (Desktop e Mobile)
  export let imageDesktop = '';
  export let imageMobile = ''; // Se não for fornecida, usa a de desktop

  // Imagem do grifo (Desktop e Mobile)
  export let underlineImageDesktop = '';
  export let underlineImageMobile = ''; // Se não for fornecida, usa a de desktop

  // Dimensões do grifo (Desktop e Mobile)
  export let underlineWidthDesktop = '250px';
  export let underlineHeightDesktop = '20px';
  export let underlineWidthMobile = '180px';
  export let underlineHeightMobile = '18px';

  // Cores
  export let backgroundColor = '#1a1a1a';
  export let textColor = '#ffffff';

  // Lógica interna para processar o texto
  $: lines = text.split('<br>').map(line => line.trim());
  $: linesToUnderline = underlineLines.toString().split(',').map(n => parseInt(n.trim(), 10));
</script>

<section class="split-section" style="--bg-color: {backgroundColor};">

  <div class="column text-column">
    <div class="text-wrapper" style="--text-color: {textColor};">
      <h2 class="title">
        {#each lines as line, i}
          {@const lineNumber = i + 1}
          {@const shouldUnderline = linesToUnderline.includes(lineNumber)}

          <span class:underlined-line={shouldUnderline}>
            {@html line}

            {#if shouldUnderline && underlineImageDesktop}
              <picture class="underline-image">
                <source media="(max-width: 799px)" srcset={underlineImageMobile || underlineImageDesktop}>
                <source media="(min-width: 800px)" srcset={underlineImageDesktop}>
                <img 
                  src={underlineImageDesktop} 
                  alt="Grifo decorativo"
                  style:--w-desk="{underlineWidthDesktop}"
                  style:--h-desk="{underlineHeightDesktop}"
                  style:--w-mob="{underlineWidthMobile}"
                  style:--h-mob="{underlineHeightMobile}"
                />
              </picture>
            {/if}
          </span>

          {#if i < lines.length - 1}<br />{/if}
        {/each}
      </h2>
    </div>
  </div>

  <div class="column image-column">
    <picture>
      <source media="(max-width: 799px)" srcset={imageMobile || imageDesktop}>
      <source media="(min-width: 800px)" srcset={imageDesktop}>
      <img src={imageDesktop} alt="Imagem de destaque" />
    </picture>
  </div>
</section>

<style>
  /* Layout principal (continua o mesmo, está correto) */
  .split-section { display: flex; margin: 0; padding: 0; width: 100%; min-height: 80vh; background-color: var(--bg-color); overflow: hidden; }
  .column { width: 50%; height: auto; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
  .text-column { padding: 1.5rem; }
  .image-column { padding: 0; }
  .image-column picture, .image-column img { width: 100%; height: 100%; object-fit: cover; }

  /* Estilos do texto */
  .title { font-family: 'obviously-compressed', sans-serif; font-size: clamp(1.8rem, 7vw, 4rem); font-weight: 700; line-height: 1.1; color: var(--text-color); text-align: left; margin: 0; }
  
  /* Container da linha que terá o grifo */
  .underlined-line {
    position: relative;
    padding-bottom: 25px; 
    display: inline-block;
  }

  /* O grifo (a imagem) */
  .underline-image {
    position: absolute;
    bottom: 0;
    left: 0;
    pointer-events: none; /* Impede a imagem de ser clicável/arrastável */
    z-index: 1;
  }
  
  .underline-image img {
    /* Define as dimensões com base nas variáveis CSS vindas das props */
    width: var(--w-desk);
    height: var(--h-desk);
    object-fit: contain;
  }

  /* Regra para mobile */
  @media (max-width: 799px) {
    .underline-image img {
      width: var(--w-mob);
      height: var(--h-mob);
    }
  }
</style>