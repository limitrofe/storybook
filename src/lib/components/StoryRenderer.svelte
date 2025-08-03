<!-- src/lib/components/StoryRenderer.svelte -->
<script>
  // Importação dos componentes da história
  import Header from './story/Header.svelte';
  import StoryText from './story/StoryText.svelte';
  import SectionTitle from './story/SectionTitle.svelte';
  import SectionWrapper from './story/SectionWrapper.svelte'; // 🆕 NOVO COMPONENTE
  import PhotoWithCaption from './story/PhotoWithCaption.svelte';
  import VideoPlayer from './story/VideoPlayer.svelte';
  import GloboPlayer from './story/GloboPlayer.svelte';
  import PhotoGallery from './story/PhotoGallery.svelte';
  import Carousel from './story/Carousel.svelte';
  import Parallax from './story/Parallax.svelte';
  import BeforeAfter from './story/BeforeAfter.svelte';
  import ScrollyTelling from './story/ScrollyTelling.svelte';
  import VideoScrollytelling from './story/VideoScrollytelling.svelte';
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
    
    console.log('🔍 Debug StoryRenderer:', { originalType: paragraph.type, normalizedType: type });
    
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
      case 'section': // 🆕 NOVO TIPO
      case 'secao':
      case 'section-wrapper':
      case 'wrapper':
        return 'section-wrapper';
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
      case 'videoscrollytelling':
      case 'video-scrollytelling':
      case 'videoscrolly':
      case 'video-scrolly':
        return 'video-scrolly';
      case 'flourish':
      case 'flourish-embed':
      case 'grafico':
      case 'mapa':
        return 'flourish';
      case 'flourish-scrolly':
      case 'flourish-story':
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
          overlay={stringToBoolean(props.overlay, true)}
        />

      <!-- 🆕 SECTION WRAPPER -->
      {:else if componentType === 'section-wrapper'}
        <SectionWrapper
          id={props.id}
          backgroundImage={props.backgroundImage}
          backgroundImageMobile={props.backgroundImageMobile}
          backgroundPosition={props.backgroundPosition || 'center'}
          backgroundPositionMobile={props.backgroundPositionMobile || 'center'}
          overlay={stringToBoolean(props.overlay, false)}
          height={props.height}
          heightMobile={props.heightMobile}
          padding={props.padding}
          paddingMobile={props.paddingMobile}
          children={props.children || []}
        >
          <!-- Slot para conteúdo manual se necessário -->
          {#if props.content}
            <div class="section-content">
              {@html props.content}
            </div>
          {/if}
        </SectionWrapper>

      <!-- Text -->
      {:else if componentType === 'text'}
        <StoryText content={props.text} variant={props.variant || 'body'} />

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
          backgroundPosition={props.backgroundPosition || 'center'}
          backgroundPositionMobile={props.backgroundPositionMobile || 'center'}
          backgroundVideo={props.backgroundVideo}
          backgroundVideoMobile={props.backgroundVideoMobile}
          variant={props.variant || 'default'}
          size={props.size || 'medium'}
          height={props.height}
          heightMobile={props.heightMobile}
          textPosition={props.textPosition || 'center'}
          textPositionMobile={props.textPositionMobile}
          textAlign={props.textAlign || 'center'}
          textAlignMobile={props.textAlignMobile}
          overlay={stringToBoolean(props.overlay, false)}
        />

      <!-- Photo -->
      {:else if componentType === 'photo'}
        <PhotoWithCaption
          src={props.src}
          alt={props.alt || ''}
          caption={props.caption || ''}
          credit={props.credit || ''}
          fullWidth={stringToBoolean(props.fullWidth, false)}
          alignment={props.alignment || 'center'}
        />

      <!-- Video -->
      {:else if componentType === 'video'}
        <VideoPlayer
          src={props.src}
          caption={props.caption}
          credit={props.credit}
          fullWidth={stringToBoolean(props.fullWidth, false)}
          autoplay={stringToBoolean(props.autoplay, false)}
          controls={stringToBoolean(props.controls, true)}
          loop={stringToBoolean(props.loop, false)}
          showCaption={stringToBoolean(props.showCaption, true)}
        />

      <!-- Globo Player -->
      {:else if componentType === 'globo-player'}
        <GloboPlayer
          videoId={props.videoId}
          videosIDs={props.videosIDs}
          caption={props.caption}
          credit={props.credit}
          fullWidth={stringToBoolean(props.fullWidth, false)}
          autoplay={stringToBoolean(props.autoplay, false)}
          startMuted={stringToBoolean(props.startMuted, true)}
          skipDFP={stringToBoolean(props.skipDFP, false)}
          chromeless={stringToBoolean(props.chromeless, false)}
          showCaption={stringToBoolean(props.showCaption, true)}
        />

      <!-- Gallery -->
      {:else if componentType === 'gallery'}
        <PhotoGallery
          images={props.images || []}
          layout={props.layout || 'grid'}
          columns={parseInt(props.columns) || 3}
          lightbox={stringToBoolean(props.lightbox, true)}
        />

      <!-- Carousel -->
      {:else if componentType === 'carousel'}
        <Carousel
          items={props.items || []}
          autoplay={stringToBoolean(props.autoplay, false)}
          interval={parseInt(props.interval) || 3000}
          showDots={stringToBoolean(props.showDots, true)}
          showArrows={stringToBoolean(props.showArrows, true)}
        />

      <!-- Parallax -->
      {:else if componentType === 'parallax'}
        <Parallax
          image={props.image}
          height={props.height || '60vh'}
          speed={parseFloat(props.speed) || 0.5}
          overlay={stringToBoolean(props.overlay, true)}
          content={props.content || ''}
        />

      <!-- Before/After -->
      {:else if componentType === 'before-after'}
        <BeforeAfter
          beforeImage={props.beforeImage}
          afterImage={props.afterImage}
          beforeLabel={props.beforeLabel || 'Antes'}
          afterLabel={props.afterLabel || 'Depois'}
          orientation={props.orientation || 'vertical'}
        />

      <!-- ScrollyTelling -->
      {:else if componentType === 'scrolly'}
        <ScrollyTelling
          steps={props.steps || []}
          fullWidth={stringToBoolean(props.fullWidth, false)}
        />

      <!-- 🆕 VIDEO SCROLLYTELLING -->
      {:else if componentType === 'video-scrolly'}
        <VideoScrollytelling
          videoSrc={props.videoSrc || props.src}
          videoSrcMobile={props.videoSrcMobile || props.srcMobile}
          steps={props.steps || []}
          height={props.height || '100vh'}
          videoAspectRatio={props.videoAspectRatio || '16/9'}
          showProgress={stringToBoolean(props.showProgress, false)}
          showTime={stringToBoolean(props.showTime, false)}
          showControls={stringToBoolean(props.showControls, false)}
        />

      <!-- Flourish Embed -->
      {:else if componentType === 'flourish'}
        <FlourishEmbed
          src={props.src}
          height={props.height || '600px'}
          caption={props.caption}
          credit={props.credit}
        />

      <!-- Flourish Scrolly -->
      {:else if componentType === 'flourish-scrolly'}
        <FlourishScrolly
          src={props.src}
          steps={props.steps || []}
        />

      <!-- Anchor Point -->
      {:else if componentType === 'anchor'}
        <AnchorPoint id={props.id} />

      <!-- Fallback para tipos desconhecidos -->
      {:else}
        <div class="unknown-component">
          <p><strong>Componente desconhecido:</strong> {paragraph.type}</p>
          <pre>{JSON.stringify(paragraph, null, 2)}</pre>
        </div>
      {/if}
    {/each}
  {/if}

  <!-- Renderizar créditos finais se existir -->
  {#if storyData.credits}
    <FinalCredits credits={storyData.credits} />
  {/if}
</article>

<style>
  .story-content {
    max-width: none;
    width: 100%;
  }

  .section-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .unknown-component {
    background: #f3f4f6;
    border: 2px dashed #9ca3af;
    padding: 2rem;
    margin: 2rem auto;
    max-width: 800px;
    border-radius: 8px;
  }

  .unknown-component pre {
    background: #ffffff;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.875rem;
  }
</style>