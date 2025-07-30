<script>
  // Importação dos componentes da história
  import Header from './story/Header.svelte';
  import StoryText from './story/StoryText.svelte';
  import SectionTitle from './story/SectionTitle.svelte';
  import PhotoWithCaption from './story/PhotoWithCaption.svelte';
  import VideoPlayer from './story/VideoPlayer.svelte';
  import GloboPlayer from './story/GloboPlayer.svelte';
  import PhotoGallery from './story/PhotoGallery.svelte';
  import Carousel from './story/Carousel.svelte';
  import Parallax from './story/Parallax.svelte';
  import BeforeAfter from './story/BeforeAfter.svelte';
  import ScrollyTelling from './story/ScrollyTelling.svelte';
  import FlourishEmbed from './story/FlourishEmbed.svelte';
  import FlourishScrolly from './story/FlourishScrolly.svelte';
  import FinalCredits from './FinalCredits.svelte';

  export let storyData = {};

  /**
   * Mapeia os tipos de parágrafo do ArchieML para os nomes dos componentes.
   */
  function getComponentType(paragraph) {
    // .trim() limpa espaços e caracteres invisíveis no início/fim
    const type = paragraph.type?.toLowerCase().trim();
    switch (type) {
      case 'header':
      case 'titulo-principal':
        return 'header';
      case 'texto':
      case 'paragrafo':
        return 'text';
      case 'intertitulo':
      case 'titulo':
        return 'section-title';
      case 'frase':
      case 'citacao':
      case 'quote':
        return 'quote';
      case 'foto':
      case 'imagem':
        return 'photo';
      case 'video':
      case 'mp4':
        return 'video';
      case 'globovideo':
      case 'globo-video':
      case 'globoplayer':
      case 'globo-player':
      case 'globo':
        return 'globo-player';
      case 'galeria':
      case 'gallery':
        return 'gallery';
      case 'carrossel':
      case 'carousel':
        return 'carousel';
      case 'parallax':
        return 'parallax';
      case 'antes-depois':
      case 'before-after':
        return 'before-after';
      case 'scrollytelling':
      case 'scrolly':
        return 'scrolly';
      case 'flourish':
      case 'grafico':
      case 'mapa':
        return 'flourish';
      case 'flourish-scrolly':
        return 'flourish-scrolly';
      default:
        return 'text';
    }
  }

  /**
   * ✅ NOVA FUNÇÃO AUXILIAR
   * Converte uma string (vinda do JSON) para um booleano de forma segura.
   * Lida com espaços em branco e caracteres invisíveis como &nbsp;
   */
  function toBoolean(value) {
    if (typeof value !== 'string') {
      return !!value; // Retorna o valor booleano se não for string
    }
    // .trim() remove espaços e .toLowerCase() torna a comparação case-insensitive
    return value.trim().toLowerCase() === 'true';
  }
</script>

{#if storyData.title}
  <Header
    title={storyData.title}
    subtitle={storyData.subtitle || storyData.intro?.text}
    author={storyData.author}
    publishDate={storyData.publishDate || storyData.date}
    backgroundImage={storyData.headerImage}
    variant="hero"
  />
{/if}

<main class="story-container">
  {#if storyData.intro && storyData.intro.text}
    <StoryText content={storyData.intro.text} variant="lead" maxWidth="800px" />
  {/if}

  {#if storyData.paragraphs}
    {#each storyData.paragraphs as paragraph}
      {@const componentType = getComponentType(paragraph)}

      {#if componentType === 'text'}
        <StoryText content={paragraph.text} variant={paragraph.variant || 'body'} maxWidth="700px" />
      {:else if componentType === 'quote'}
        <StoryText
          content={paragraph.text}
          variant="quote"
          author={paragraph.author}
          role={paragraph.role}
        />
      {:else if componentType === 'section-title'}
        <SectionTitle
          title={paragraph.text}
          subtitle={paragraph.subtitle}
          backgroundImage={paragraph.backgroundImage}
          variant={paragraph.variant || 'default'}
          size={paragraph.size || 'medium'}
          overlay={toBoolean(paragraph.overlay, true)}
        />
      {:else if componentType === 'photo'}
        <PhotoWithCaption
          src={paragraph.src || paragraph.url}
          alt={paragraph.alt}
          caption={paragraph.caption}
          credit={paragraph.credit}
          fullWidth={toBoolean(paragraph.fullWidth)}
          alignment={paragraph.alignment || 'center'}
        />
      {:else if componentType === 'video'}
        <VideoPlayer
          src={paragraph.src}
          fullWidth={toBoolean(paragraph.fullWidth)}
          autoplay={toBoolean(paragraph.autoplay)}
          controls={!toBoolean(paragraph.controls, false)}
          loop={toBoolean(paragraph.loop)}
          showCaption={toBoolean(paragraph.showCaption, true)}
        />

      {:else if componentType === 'globo-player'}
        {@const isFullWidth = toBoolean(paragraph.fullWidth)}
        
        <div class="component-wrapper globo-player-wrapper" class:full-width={isFullWidth}>
            <GloboPlayer
              videosIDs={paragraph.videoId || paragraph.videosIDs}

              width={isFullWidth ? '100%' : (paragraph.width || '100%')}
              height={'100%'}

              autoPlay={toBoolean(paragraph.autoplay)}
              startMuted={toBoolean(paragraph.startMuted)}
              skipDFP={toBoolean(paragraph.skipDFP)}
              chromeless={toBoolean(paragraph.chromeless)}
            />
        </div>

        {#if toBoolean(paragraph.showCaption, true) && (paragraph.caption || paragraph.credit)}
          <div class="component-caption" class:full-width-caption={isFullWidth}>
            <p>{@html paragraph.caption || ''}</p>
            {#if paragraph.credit}
              <small class="credit">{@html paragraph.credit}</small>
            {/if}
          </div>
        {/if}
      {:else if componentType === 'gallery'}
        <PhotoGallery
          images={paragraph.images || []}
          layout={paragraph.layout || 'grid'}
          columns={parseInt(paragraph.columns) || 3}
        />
      {:else if componentType === 'carousel'}
        <Carousel
          items={paragraph.items || []}
          autoplay={toBoolean(paragraph.autoplay)}
          interval={parseInt(paragraph.interval) || 5000}
          showDots={!toBoolean(paragraph.showDots, false)}
          showArrows={!toBoolean(paragraph.showArrows, false)}
        />
      {:else if componentType === 'parallax'}
        <Parallax
          image={paragraph.image}
          height={paragraph.height || '80vh'}
          speed={parseFloat(paragraph.speed) || 0.5}
          content={paragraph.content}
          overlay={toBoolean(paragraph.overlay, true)}
        />
      {:else if componentType === 'before-after'}
        <BeforeAfter
          beforeImage={paragraph.beforeImage}
          afterImage={paragraph.afterImage}
          beforeLabel={paragraph.beforeLabel || 'Antes'}
          afterLabel={paragraph.afterLabel || 'Depois'}
          orientation={paragraph.orientation || 'vertical'}
        />
      {:else if componentType === 'scrolly'}
        <ScrollyTelling
          steps={paragraph.steps || []}
          fullWidth={toBoolean(paragraph.fullWidth)}
        />
      {:else if componentType === 'flourish'}
        <FlourishEmbed src={paragraph.src} />
      {:else if componentType === 'flourish-scrolly'}
        <FlourishScrolly src={paragraph.src} steps={paragraph.steps || []} />
      {/if}
    {/each}
  {/if}
</main>

{#if storyData.credits}
  <FinalCredits
    notes={storyData.credits.notes || ''}
    sources={storyData.credits.sources || []}
    additionalGraphics={storyData.credits.additionalGraphics || []}
    editedBy={storyData.credits.editedBy || []}
    authors={storyData.credits.authors || (storyData.author ? [storyData.author] : [])}
  />
{/if}

<style>
  .story-container {
    background: var(--color-background);
    color: var(--color-text);
    min-height: 100vh;
  }
  .component-wrapper {
    max-width: 800px; /* Largura padrão para componentes */
    margin: 2rem auto;
    padding: 0 1rem;
  }
  .component-wrapper.full-width {
    max-width: none; /* Remove a largura máxima para o modo full-width */
    padding: 0;
  }
  
  /* ✅ AJUSTE 2: CSS QUE FORÇA A PROPORÇÃO 16:9 NO CONTÊINER DO PLAYER */
  .globo-player-wrapper {
    /* Por padrão (não full-width), o player terá no máximo 60% da largura da tela */
    max-width: 60vw;
    aspect-ratio: 16 / 9; /* A altura será calculada automaticamente */
  }

  .globo-player-wrapper.full-width {
    max-width: 100%; /* Em full-width, ele ocupa 100% */
    aspect-ratio: 16 / 9;
  }
  
  .component-caption {
    max-width: 700px;
    margin: -1rem auto 2.5rem auto; /* Margem negativa para aproximar da mídia */
    padding: 0 1rem;
    text-align: center;
  }
  /* Adicionado para centralizar a legenda do player full-width */
  .full-width-caption {
      max-width: 800px;
  }
  .component-caption p {
    color: var(--color-text-muted, #555);
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0 0 0.25rem 0;
  }
  .component-caption .credit {
    color: var(--color-text-light, #777);
    font-size: 0.8rem;
    display: block;
  }
</style>