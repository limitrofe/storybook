<!-- src/lib/components/StoryRenderer.svelte -->
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
  import VideoScrollytelling from './story/VideoScrollytelling.svelte'; // 🆕 NOVO COMPONENTE
  import FlourishEmbed from './story/FlourishEmbed.svelte';
  import FlourishScrolly from './story/FlourishScrolly.svelte';
  import FinalCredits from './FinalCredits.svelte';
  import AnchorPoint from './story/AnchorPoint.svelte';

  export let storyData = {};

  // ✅ DEBUG: Ver o que está chegando
  $: {
    console.log('=== DEBUG STORYDATA ===');
    console.log('storyData:', storyData);
    console.log('paragraphs:', storyData.paragraphs);
    if (storyData.paragraphs) {
      storyData.paragraphs.forEach((p, i) => {
        console.log(`Paragraph ${i}:`, p.type, p);
      });
    }
    console.log('========================');
  }

  /**
   * Mapeia os tipos de parágrafo para os nomes dos componentes.
   */
  function getComponentType(paragraph) {
    const type = paragraph.type?.toLowerCase().trim();
    switch (type) {
      case 'header':
      case 'titulo-principal':
      case 'tituloprincipal':
      case 'abre':
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
      case 'videoscrollytelling': // 🆕 NOVO TIPO
      case 'video-scrollytelling':
      case 'videoscrolly':
      case 'video-scrolly':
        return 'video-scrolly';
      case 'flourish':
      case 'grafico':
      case 'mapa':
        return 'flourish';
      case 'flourish-scrolly':
        return 'flourish-scrolly';
      case 'ancora':
      case 'anchor':
        return 'anchor';
      default:
        return 'text';
    }
  }

  /**
   * Converte uma string (vinda do JSON) para um booleano de forma segura.
   */
  function stringToBoolean(value, defaultValue = false) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      return normalized === 'true' || normalized === 'yes' || normalized === 'sim' || normalized === '1';
    }
    return defaultValue;
  }

  /**
   * Prepara as propriedades de um parágrafo para serem passadas ao componente.
   */
  function prepareProps(paragraph) {
    const props = { ...paragraph };
    
    // Converter strings para booleanos onde necessário
    const booleanFields = [
      'fullWidth', 'autoplay', 'controls', 'loop', 'showCaption', 'autoPlay',
      'overlay', 'lightbox', 'masonry', 'showControls', 'showProgress', 'showTime'
    ];
    
    booleanFields.forEach(field => {
      if (props[field] !== undefined) {
        props[field] = stringToBoolean(props[field]);
      }
    });

    return props;
  }
</script>

<article class="story-content" data-theme={storyData.theme || 'default'}>
  <!-- Renderizar o header se tiver -->
  {#if storyData.title || storyData.subtitle}
    <Header
      title={storyData.title}
      subtitle={storyData.subtitle}
      author={storyData.author}
      publishDate={storyData.publishDate || storyData.date}
      backgroundImage={storyData.backgroundImage}
      backgroundImageMobile={storyData.backgroundImageMobile}
      backgroundVideo={storyData.backgroundVideo}
      backgroundVideoMobile={storyData.backgroundVideoMobile}
      variant={storyData.variant || 'default'}
      overlay={stringToBoolean(storyData.overlay, true)}
    />
  {/if}

  <!-- Renderizar intro se existir -->
  {#if storyData.intro && storyData.intro.text}
    <StoryText content={storyData.intro.text} variant="lead" />
  {/if}

  <!-- Renderizar parágrafos -->
  {#if storyData.paragraphs && Array.isArray(storyData.paragraphs)}
    {#each storyData.paragraphs as paragraph, index}
      {@const componentType = getComponentType(paragraph)}
      {@const props = prepareProps(paragraph)}
      
      <!-- Header -->
      {#if componentType === 'header'}
        <Header
          title={props.title}
          subtitle={props.subtitle}
          author={props.author}
          publishDate={props.publishDate || props.date}
          backgroundImage={props.backgroundImage}
          backgroundImageMobile={props.backgroundImageMobile}
          backgroundVideo={props.backgroundVideo}
          backgroundVideoMobile={props.backgroundVideoMobile}
          variant={props.variant || 'default'}
          overlay={props.overlay}
        />

      <!-- Texto -->
      {:else if componentType === 'text'}
        <StoryText 
          content={props.text} 
          variant={props.variant || 'body'}
        />

      <!-- Quote -->
      {:else if componentType === 'quote'}
        <StoryText 
          content={props.text} 
          variant="quote"
          author={props.author}
          role={props.role}
        />

      <!-- Section Title -->
      {:else if componentType === 'section-title'}
        <SectionTitle
          title={props.text}
          subtitle={props.subtitle}
          backgroundImage={props.backgroundImage}
          backgroundImageMobile={props.backgroundImageMobile}
          variant={props.variant || 'default'}
          size={props.size || 'medium'}
          textPosition={props.textPosition || 'left'}
          textAlign={props.textAlign || 'left'}
          height={props.height}
          overlay={props.overlay}
        />

      <!-- Photo -->
      {:else if componentType === 'photo'}
        <PhotoWithCaption
          src={props.src}
          srcMobile={props.srcMobile}
          caption={props.caption}
          credit={props.credit}
          alt={props.alt || 'Imagem'}
          fullWidth={props.fullWidth}
          alignment={props.alignment || 'center'}
        />

      <!-- Video -->
      {:else if componentType === 'video'}
        <VideoPlayer
          src={props.src}
          srcMobile={props.srcMobile}
          caption={props.caption}
          credit={props.credit}
          fullWidth={props.fullWidth}
          autoplay={props.autoplay}
          controls={props.controls}
          loop={props.loop}
          showCaption={props.showCaption}
        />

      <!-- Globo Player -->
      {:else if componentType === 'globo-player'}
        <GloboPlayer
          videoId={props.videoId}
          caption={props.caption}
          credit={props.credit}
          fullWidth={props.fullWidth}
          autoplay={props.autoplay}
          controls={props.controls}
          showCaption={props.showCaption}
        />

      <!-- Gallery -->
      {:else if componentType === 'gallery'}
        <PhotoGallery
          images={props.images || []}
          caption={props.caption}
          credit={props.credit}
          layout={props.layout || 'grid'}
          columns={props.columns || 3}
          lightbox={props.lightbox}
          masonry={props.masonry}
        />

      <!-- Carousel -->
      {:else if componentType === 'carousel'}
        <Carousel
          items={props.items || []}
          caption={props.caption}
          credit={props.credit}
          autoplay={props.autoplay}
          showDots={props.showDots}
          showArrows={props.showArrows}
          interval={props.interval || 5000}
        />

      <!-- Parallax -->
      {:else if componentType === 'parallax'}
        <Parallax
          image={props.image}
          imageMobile={props.imageMobile}
          content={props.content}
          height={props.height || '50vh'}
          speed={props.speed || '0.5'}
          overlay={props.overlay}
        />

      <!-- Before/After -->
      {:else if componentType === 'before-after'}
        <BeforeAfter
          beforeImage={props.beforeImage}
          afterImage={props.afterImage}
          beforeImageMobile={props.beforeImageMobile}
          afterImageMobile={props.afterImageMobile}
          beforeLabel={props.beforeLabel || 'Antes'}
          afterLabel={props.afterLabel || 'Depois'}
          orientation={props.orientation || 'vertical'}
          caption={props.caption}
          credit={props.credit}
        />

      <!-- ScrollyTelling -->
      {:else if componentType === 'scrolly'}
        <ScrollyTelling
          steps={props.steps || []}
          layout={props.layout || 'split'}
          height={props.height}
          mediaType={props.mediaType || 'flourish'}
          flourishUrl={props.flourishUrl}
          flourishHeight={props.flourishHeight}
        />

      <!-- 🆕 VIDEO SCROLLYTELLING -->
      {:else if componentType === 'video-scrolly'}
        <VideoScrollytelling
          videoSrc={props.videoSrc || props.src}
          videoSrcMobile={props.videoSrcMobile || props.srcMobile}
          steps={props.steps || []}
          height={props.height || '300vh'}
          videoAspectRatio={props.videoAspectRatio || props.aspectRatio || '16/9'}
          fullWidth={props.fullWidth !== false}
          autoplay={props.autoplay}
          showControls={props.showControls}
          showProgress={props.showProgress !== false}
          showTime={props.showTime !== false}
        />

      <!-- Flourish -->
      {:else if componentType === 'flourish'}
        <FlourishEmbed
          url={props.url}
          height={props.height || '500px'}
          caption={props.caption}
          credit={props.credit}
        />

      <!-- Flourish Scrolly -->
      {:else if componentType === 'flourish-scrolly'}
        <FlourishScrolly
          steps={props.steps || []}
          flourishUrl={props.flourishUrl}
          flourishHeight={props.flourishHeight || '500px'}
          layout={props.layout || 'split'}
        />

      <!-- Anchor Point -->
      {:else if componentType === 'anchor'}
        <AnchorPoint id={props.id || props.text} />

      <!-- Fallback para tipos desconhecidos -->
      {:else}
        <div class="unknown-component">
          <p><strong>Componente desconhecido:</strong> {paragraph.type}</p>
          <pre>{JSON.stringify(paragraph, null, 2)}</pre>
        </div>
      {/if}
    {/each}
  {/if}

  <!-- Créditos finais -->
  {#if storyData.credits}
    <FinalCredits 
      notes={storyData.credits.notes}
      sources={storyData.credits.sources}
    />
  {/if}
</article>

<style>
  .story-content {
    width: 100%;
    margin: 0 auto;
    line-height: 1.6;
  }

  .unknown-component {
    background: #f5f5f5;
    border: 2px dashed #ccc;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
  }

  .unknown-component pre {
    background: #fff;
    padding: 0.5rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.8rem;
    max-height: 200px;
    overflow-y: auto;
  }
</style>