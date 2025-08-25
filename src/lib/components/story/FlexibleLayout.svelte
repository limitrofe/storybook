<!-- VERSÃO DEBUG - FlexibleLayout.svelte -->
<script>
  // TEXTO - Controle total
  export let text = '';
  export let textAlign = 'left';
  export let textPosition = 'left';
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
  export let image1X = '0px';
  export let image1Y = '0px';
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
  export let image2Position = 'right';
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

  // 🔍 DEBUG: Verificar TUDO que está chegando
//   $: {
//     console.group('🔍 FLEXIBLE LAYOUT DEBUG');
//     console.log('Props recebidas:', {
//       image1Desktop: `"${image1Desktop}"`,
//       image2Desktop: `"${image2Desktop}"`,
//       image1Mobile: `"${image1Mobile}"`,
//       image2Mobile: `"${image2Mobile}"`,
//       image2Position: `"${image2Position}"`,
//       text: text ? 'OK' : 'VAZIO'
//     });
    
//     console.log('Condições if:', {
//       'image1Desktop': !!image1Desktop,
//       'image2Desktop': !!image2Desktop,
//       'image1Desktop.length': image1Desktop ? image1Desktop.length : 0,
//       'image2Desktop.length': image2Desktop ? image2Desktop.length : 0
//     });
    
//     console.log('Valores computados:', {
//       finalImage1Mobile: image1Mobile || image1Desktop,
//       finalImage2Mobile: image2Mobile || image2Desktop,
//       textPositionClass: `text-position-${textPosition}`,
//       textAlignClass: `text-align-${textAlign}`,
//       image2PositionClass: `image2-position-${image2Position}`
//     });
//     console.groupEnd();
//   }

  // Lógica para processar o texto
  $: lines = text.split('<br>').map(line => line.trim());

  // Resolver imagens com fallback
  $: finalImage1Mobile = image1Mobile || image1Desktop;
  $: finalImage2Mobile = image2Mobile || image2Desktop;

  // Classes para posicionamento do texto
  $: textPositionClass = `text-position-${textPosition}`;
  $: textAlignClass = `text-align-${textAlign}`;
  $: image2PositionClass = `image2-position-${image2Position}`;
</script>

<!-- 🚨 DEBUG ALERT NO TOPO -->
<!-- <div style="position: fixed; top: 0; left: 0; background: red; color: white; padding: 10px; z-index: 9999; font-size: 12px;">
  DEBUG: img1="{image1Desktop}" | img2="{image2Desktop}" | 
  Show1={!!image1Desktop} | Show2={!!image2Desktop}
</div> -->

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
  <!-- 🔍 DEBUG: SEMPRE MOSTRAR (para ver se o problema é no if) -->
  <!-- <div style="position: absolute; top: 10px; right: 10px; background: yellow; color: black; padding: 5px; font-size: 10px; z-index: 999;">
    IMG1: {image1Desktop ? 'SIM' : 'NÃO'} | 
    IMG2: {image2Desktop ? 'SIM' : 'NÃO'}
  </div> -->

  <!-- IMAGEM 2 - Principal (fica atrás) -->
  {#if image2Desktop}
    <div class="image2-container {image2PositionClass}" >
      <picture class="image2">
        {#if finalImage2Mobile && finalImage2Mobile !== image2Desktop}
          <source 
            media="(max-width: 799px)" 
            srcset="{finalImage2Mobile}"
          />
        {/if}
        <source 
          media="(min-width: 800px)" 
          srcset="{image2Desktop}"
        />
        <img 
          src="{image2Desktop}" 
          alt="Imagem principal"
          loading="lazy"
          style="border: 0;"
          on:error={(e) => {
            console.error('❌ Erro ao carregar imagem principal:', e.target.src);
            e.target.style.display = 'none';
          }}
          on:load={(e) => {
            console.log('✅ Imagem principal carregada:', e.target.src);
          }}
        />
      </picture>
    </div>
  {:else}
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
        {#if finalImage1Mobile && finalImage1Mobile !== image1Desktop}
          <source 
            media="(max-width: 799px)" 
            srcset="{finalImage1Mobile}"
          />
        {/if}
        <source 
          media="(min-width: 800px)" 
          srcset="{image1Desktop}"
        />
        <img 
          src="{image1Desktop}" 
          alt="Destaque decorativo"
          loading="lazy"
          on:error={(e) => {
            console.error('❌ Erro ao carregar grifo:', e.target.src);
            e.target.style.display = 'none';
          }}
          on:load={(e) => {
            console.log('✅ Grifo carregado:', e.target.src);
          }}
        />
      </picture>
    </div>
  {:else}
    <!-- 🚨 DEBUG: Mostrar quando NÃO tem imagem1 -->
    <!-- <div>
      ❌ IMAGEM 1 NÃO ENCONTRADA<br>
      image1Desktop = "{image1Desktop}"<br>
      Length: {image1Desktop ? image1Desktop.length : 'undefined'}
    </div> -->
  {/if}
</section>

<style>
.flexible-layout {
  position: relative;
  width: 100%;
  min-height: var(--min-height-mobile);
  background-color: var(--bg-color);
  padding: 0; /* O padding será movido para o container de texto */
  margin: 0;
  overflow: hidden;
  box-sizing: border-box;
  /* display: flex; <--- REMOVER */
  /* flex-direction: column; <--- REMOVER */
  /* align-items: flex-start; <--- REMOVER */
}

.text-container {
  /* position: relative; <--- ALTERAR */
  position: absolute;
  top: 3%;
  left: 3%;
  height: 100%; /* Para preencher a altura */
  padding: var(--padding-mobile); /* Adicionar padding aqui */
  box-sizing: border-box; /* Para o padding não aumentar o tamanho */
  z-index: var(--text-z-index);
  width: 100%;
  display: flex;
  /* order: 1; <--- REMOVER */
  /* margin-bottom: 2rem; <--- REMOVER */
}

  .text-position-left { justify-content: flex-start; }
  .text-position-center { justify-content: center; }
  .text-position-right { justify-content: flex-end; }

  .text-wrapper {
    max-width: 65%;
  }

  .title {
    font-family: 'Globotipo', 'Opensans', sans-serif;
    font-size: var(--font-size-mobile);
    font-weight: 800;
    line-height: 1.3;
    color: var(--text-color);
    margin: 0;
    top: 10%;
    padding-top: 80px; 
  }

  .text-align-left .title { text-align: left; }
  .text-align-center .title { text-align: center; }
  .text-align-right .title { text-align: right; }

  .line {
    display: inline-block;
    width: 100%;
  }

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

.image2-container {
  /* position: relative; <--- ALTERAR */
  position: absolute;
  top: var(--image2-y-mobile); /* Adicionar posicionamento */
  left: var(--image2-x-mobile); /* Adicionar posicionamento */
  z-index: var(--image2-z-index);
  /* order: 2; <--- REMOVER */
  width: var(--image2-width-mobile); /* Usar a variável de largura */
  /* max-width: 80%; <--- REMOVER */
  /* margin: 0 auto; <--- REMOVER */
}
  .image2 img {
    width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
  }

  .image2-position-right { margin: 0; }
  .image2-position-left {  margin: 0;}
  .image2-position-center {  margin: 0; }
  .image2-position-right-bottom {  margin: 0;}

  @media (min-width: 800px) {
    .flexible-layout {
  min-height: var(--min-height);
  /* padding: var(--padding); <--- REMOVER */
  /* flex-direction: row; <--- REMOVER */
  /* align-items: center; <--- REMOVER */
}


.text-container {
  /* order: 1; <--- REMOVER */
  width: 100%; /* Manter 100% ou ajustar conforme o design */
  /* margin-bottom: 0; <--- REMOVER */
  padding: var(--padding); /* Adicionar padding aqui também */
}


    .title {
      font-size: var(--font-size);
    }

    .image1-container {
      top: var(--image1-y);
      left: var(--image1-x);
    }

    .image1 img {
      width: var(--image1-width);
      height: var(--image1-height);
    }

.image2-container {
  position: absolute;
  /* order: 2; <--- REMOVER */
  width: auto;
  /* ... resto das propriedades está OK */
}

    .image2 img {
      width: var(--image2-width);
      height: var(--image2-height);
      max-height: none;
      object-fit: cover;
    }

.image2-position-right,
.image2-position-left,
.image2-position-center,
.image2-position-right-bottom {
  margin: 0; /* Reseta qualquer margem */

    }
  }
  .text-wrapper {
  max-width: 50%;
}
</style>