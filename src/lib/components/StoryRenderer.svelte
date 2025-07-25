<!-- src/lib/components/StoryRenderer.svelte -->
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

  export let storyData = {};

  // Mapeia os tipos que vêm do ArchieML para os componentes
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
      // 🆕 ADICIONADOS NOVOS TIPOS PARA GLOBOPLAYER
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
      default:
        return 'text';
    }
  }
</script>

<!-- Header se tiver title -->
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

<!-- Container principal -->
<main class="story-container">
  <!-- Intro se existir -->
  {#if storyData.intro && storyData.intro.text}
    <StoryText 
      content={storyData.intro.text}
      variant="lead"
      maxWidth="800px"
    />
  {/if}

  <!-- Renderiza cada parágrafo do ArchieML -->
  {#if storyData.paragraphs}
    {#each storyData.paragraphs as paragraph, index}
      {@const componentType = getComponentType(paragraph)}
      
      {#if componentType === 'text'}
        <StoryText 
          content={paragraph.text}
          variant={paragraph.variant || 'body'}
          maxWidth="700px"
        />
      
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
      
      <!-- 🆕 NOVO COMPONENTE GLOBOPLAYER -->
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
        
        <!-- Caption/legenda separada para manter o layout -->
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
          images={paragraph.images && paragraph.images.length > 0 ? paragraph.images : [
            {src: "https://images.unsplash.com/photo-1593941707874-ef36c1e51e84?w=800&q=80", alt: "Fallback 1", caption: "Imagem de fallback 1"},
            {src: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&q=80", alt: "Fallback 2", caption: "Imagem de fallback 2"},
            {src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80", alt: "Fallback 3", caption: "Imagem de fallback 3"}
          ]}
          layout={paragraph.layout || 'grid'}
          columns={parseInt(paragraph.columns) || 3}
        />
      
      {:else if componentType === 'carousel'}
        <Carousel 
          items={paragraph.items && paragraph.items.length > 0 ? paragraph.items : [
            {type: "image", src: "https://images.unsplash.com/photo-1593941707874-ef36c1e51e84?w=1200&q=80", caption: "Slide de fallback 1"},
            {type: "image", src: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=1200&q=80", caption: "Slide de fallback 2"},
            {type: "content", content: "<h2>Fallback Content</h2><p>Conteúdo de teste para carousel</p>"}
          ]}
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
          content={paragraph.content || ''}
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
          steps={paragraph.steps && paragraph.steps.length > 0 ? paragraph.steps : [
            {title: "Step 1", text: "Primeiro passo do fallback", image: "https://images.unsplash.com/photo-1593941707874-ef36c1e51e84?w=800&q=80"},
            {title: "Step 2", text: "Segundo passo do fallback", image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&q=80"}
          ]}
          backgroundImage={paragraph.backgroundImage || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80"}
          stickyHeight={paragraph.stickyHeight || '100vh'}
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

  /* 🆕 ESTILOS PARA CAPTION DO GLOBOPLAYER */
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