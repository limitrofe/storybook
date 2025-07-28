<script>
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
  // ▼▼▼ 1. IMPORTAR OS NOVOS COMPONENTES ▼▼▼
  import FlourishEmbed from './story/FlourishEmbed.svelte';
  import FlourishScrolly from './story/FlourishScrolly.svelte';

  export let storyData = {};

  function getComponentType(paragraph) {
    const type = paragraph.type?.toLowerCase();
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
      // ▼▼▼ 2. ADICIONAR OS NOVOS CASES ▼▼▼
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
    {#each storyData.paragraphs as paragraph, index}
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
          backgroundImageMobile={paragraph.backgroundImageMobile}
          backgroundVideo={paragraph.backgroundVideo}
          backgroundVideoMobile={paragraph.backgroundVideoMobile}
          backgroundPosition={paragraph.backgroundPosition}
          backgroundPositionMobile={paragraph.backgroundPositionMobile}
          variant={paragraph.variant || 'default'}
          size={paragraph.size || 'medium'}
          height={paragraph.height}
          heightMobile={paragraph.heightMobile}
          textPosition={paragraph.textPosition || 'center'}
          textPositionMobile={paragraph.textPositionMobile}
          textAlign={paragraph.textAlign || 'center'}
          textAlignMobile={paragraph.textAlignMobile}
          overlay={paragraph.overlay !== 'false'}
        />
      {:else if componentType === 'photo'}
        <PhotoWithCaption
          src={paragraph.src || paragraph.url || paragraph.image}
          alt={paragraph.alt || paragraph.text}
          caption={paragraph.caption || paragraph.legenda}
          credit={paragraph.credit || paragraph.credito}
          fullWidth={paragraph.fullWidth === 'true' || paragraph.full === 'true'}
          alignment={paragraph.alignment || 'center'}
        />
      {:else if componentType === 'video'}
        <VideoPlayer
          src={paragraph.src || paragraph.url || paragraph.video}
          poster={paragraph.poster}
          caption={paragraph.caption || paragraph.legenda}
          credit={paragraph.credit || paragraph.credito}
          fullWidth={paragraph.fullWidth === 'true' || paragraph.full === 'true'}
          autoplay={paragraph.autoplay === 'true'}
          controls={paragraph.controls !== 'false'}
          loop={paragraph.loop === 'true'}
          showCaption={paragraph.showCaption !== 'false'}
          alignment={paragraph.alignment || 'center'}
        />
      {:else if componentType === 'globo-player'}
        <GloboPlayer
          videosIDs={paragraph.videoId || paragraph.videosIDs || paragraph.id}
          width={paragraph.width || '100%'}
          height={parseInt(paragraph.height) || 450}
          autoPlay={paragraph.autoplay === 'true' || paragraph.autoPlay === 'true'}
          startMuted={paragraph.startMuted !== 'false'}
          maxQualityLevel={paragraph.maxQuality || paragraph.quality || 'high'}
          chromeless={paragraph.chromeless === 'true'}
          isLiveContent={paragraph.isLive === 'true' || paragraph.live === 'true'}
          skipDFP={paragraph.skipDFP === 'true' || paragraph.skipdfp === 'true'}
          allowRestrictedContent={paragraph.allowRestrictedContent === 'true'}
          preventBlackBars={paragraph.preventBlackBars !== 'false'}
          globoId={paragraph.globoId}
          token={paragraph.token}
          adAccountId={paragraph.adAccountId}
          adCmsId={paragraph.adCmsId}
          siteName={paragraph.siteName}
        />
        {#if paragraph.caption || paragraph.legenda}
          <div class="component-caption">
            <p>{@html paragraph.caption || paragraph.legenda}</p>
            {#if paragraph.credit || paragraph.credito}
              <small class="credit">{paragraph.credit || paragraph.credito}</small>
            {/if}
          </div>
        {/if}
      {:else if componentType === 'gallery'}
        <PhotoGallery
          images={paragraph.images && Array.isArray(paragraph.images) && paragraph.images.length > 0 ? paragraph.images : []}
          layout={paragraph.layout || 'grid'}
          columns={parseInt(paragraph.columns) || 3}
        />
      {:else if componentType === 'carousel'}
        <Carousel
          items={paragraph.items && Array.isArray(paragraph.items) && paragraph.items.length > 0 ? paragraph.items : []}
          autoplay={paragraph.autoplay === 'true'}
          interval={parseInt(paragraph.interval) || 5000}
          showDots={paragraph.showDots !== 'false'}
          showArrows={paragraph.showArrows !== 'false'}
        />
      {:else if componentType === 'parallax'}
        <Parallax
          image={paragraph.image}
          height={paragraph.height || '80vh'}
          speed={parseFloat(paragraph.speed) || 0.5}
          content={paragraph.content}
          overlay={paragraph.overlay !== 'false'}
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
          steps={paragraph.steps && paragraph.steps.length > 0 ? paragraph.steps : []}
          backgroundImage={paragraph.backgroundImage}
          stickyHeight={paragraph.stickyHeight || '100vh'}
          fullWidth={paragraph.fullWidth === 'true'}
        />
      {:else if componentType === 'flourish'}
        <FlourishEmbed src={paragraph.src} />
      {:else if componentType === 'flourish-scrolly'}
        <FlourishScrolly
          src={paragraph.src}
          steps={paragraph.steps && paragraph.steps.length > 0 ? paragraph.steps : []}
        />
      {/if}
    {/each}
  {/if}
</main>

<style>
  .story-container {
    background: var(--color-background);
    color: var(--color-text);
    min-height: 100vh;
  }
  .component-caption {
    max-width: 800px;
    margin: 1rem auto 2rem auto;
    padding: 0 2rem;
    text-align: center;
  }
  .component-caption p {
    color: var(--color-text-muted, #666);
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0 0 0.5rem 0;
  }
  .component-caption .credit {
    color: var(--color-text-light, #999);
    font-size: 0.8rem;
    display: block;
  }
  @media (max-width: 768px) {
    .component-caption {
      padding: 0 1rem;
    }
  }
</style>