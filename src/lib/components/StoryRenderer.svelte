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
        <!-- 🔧 DEBUG: Log das imagens da galeria -->
        {#if import.meta.env.DEV}
          <div class="debug-gallery">
            <p>🖼️ Debug Galeria:</p>
            <p>Images array: {JSON.stringify(paragraph.images || [], null, 2)}</p>
            <p>Layout: {paragraph.layout || 'grid'}</p>
            <p>Columns: {paragraph.columns || 3}</p>
          </div>
        {/if}

        <PhotoGallery 
          images={paragraph.images && Array.isArray(paragraph.images) && paragraph.images.length > 0 
            ? paragraph.images 
            : [
              {src: "https://cdn.pixabay.com/photo/2015/09/09/07/05/sea-931164_1280.jpg", alt: "Fallback 1", caption: "Imagem de fallback 1"},
              {src: "https://cdn.pixabay.com/photo/2017/05/22/19/50/surfer-2335088_1280.jpg", alt: "Fallback 2", caption: "Imagem de fallback 2"},
              {src: "https://cdn.pixabay.com/photo/2016/11/29/03/27/action-1867052_1280.jpg", alt: "Fallback 3", caption: "Imagem de fallback 3"}
            ]
          }
          layout={paragraph.layout || 'grid'}
          columns={parseInt(paragraph.columns) || 3}
        />
      
      {:else if componentType === 'carousel'}
        <!-- 🔧 DEBUG: Log dos items do carousel -->
        {#if import.meta.env.DEV}
          <div class="debug-carousel">
            <p>🎠 Debug Carousel:</p>
            <p>Items array: {JSON.stringify(paragraph.items || [], null, 2)}</p>
            <p>Autoplay: {paragraph.autoplay}</p>
          </div>
        {/if}

        <Carousel 
          items={paragraph.items && Array.isArray(paragraph.items) && paragraph.items.length > 0 
            ? paragraph.items 
            : [
              {type: "image", src: "https://cdn.pixabay.com/photo/2023/05/30/15/34/silver-gull-8028946_1280.jpg", caption: "Slide de fallback 1"},
              {type: "image", src: "https://cdn.pixabay.com/photo/2023/04/14/10/27/seagull-7924729_1280.jpg", caption: "Slide de fallback 2"},
              {type: "content", content: "<h2>Fallback Content</h2><p>Conteúdo de teste para carousel</p>"}
            ]
          }
          autoplay={paragraph.autoplay === 'true'}
          interval={parseInt(paragraph.interval) || 5000}
          showDots={paragraph.showDots !== 'false'}
          showArrows={paragraph.showArrows !== 'false'}
        />
      
      {:else if componentType === 'parallax'}
        <!-- 🔧 DEBUG: Log do parallax -->
        {#if import.meta.env.DEV}
          <div class="debug-parallax">
            <p>🌄 Debug Parallax:</p>
            <p>Image: {paragraph.image || 'NÃO FORNECIDA'}</p>
            <p>Content: {paragraph.content || 'VAZIO'}</p>
            <p>Height: {paragraph.height || '80vh'}</p>
            <p>Speed: {paragraph.speed || 0.5}</p>
          </div>
        {/if}

        <Parallax 
          image={paragraph.image || 'https://cdn.pixabay.com/photo/2023/10/21/11/46/sunset-8331285_1280.jpg'}
          height={paragraph.height || '80vh'}
          speed={parseFloat(paragraph.speed) || 0.5}
          content={paragraph.content || '<h2>Parallax sem conteúdo</h2><p>Configure o campo content no Google Docs</p>'}
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

  /* 🔧 DEBUG STYLES */
  .debug-gallery,
  .debug-carousel,
  .debug-parallax {
    background: #ff6b35;
    color: white;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.8rem;
  }

  .debug-gallery p,
  .debug-carousel p,
  .debug-parallax p {
    margin: 0.25rem 0;
  }

  @media (max-width: 768px) {
    .component-caption {
      padding: 0 1rem;
    }

    .debug-gallery,
    .debug-carousel, 
    .debug-parallax {
      font-size: 0.7rem;
      padding: 0.75rem;
    }
  }
</style>