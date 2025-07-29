// src/lib/components/story/index.js
export { default as Header } from './Header.svelte';
export { default as Parallax } from './Parallax.svelte';
export { default as ScrollyTelling } from './ScrollyTelling.svelte';
export { default as PhotoGallery } from './PhotoGallery.svelte';
export { default as Carousel } from './Carousel.svelte';
export { default as StoryText } from './StoryText.svelte';
export { default as SectionTitle } from './SectionTitle.svelte';
export { default as BeforeAfter } from './BeforeAfter.svelte';
export { default as PhotoWithCaption } from './PhotoWithCaption.svelte';
export { default as VideoPlayer } from './VideoPlayer.svelte';

// Exemplo de uso no +page.svelte
/*
<script>
  import { 
    Header, 
    StoryText, 
    PhotoWithCaption, 
    SectionTitle,
    BeforeAfter,
    Parallax,
    ScrollyTelling,
    PhotoGallery,
    Carousel,
    VideoPlayer
  } from '$lib/components/story';

  // Dados de exemplo que viriam do ArchieML
  const storyData = {
    title: "Uma História Visual Incrível",
    subtitle: "Explorando as possibilidades do storytelling digital",
    author: "João Silva",
    publishDate: "23 de julho de 2025",
    backgroundImage: "https://exemplo.com/header-bg.jpg",
    
    sections: [
      {
        type: "text",
        variant: "lead",
        content: "Esta é uma introdução envolvente que vai capturar a atenção do leitor..."
      },
      {
        type: "photo",
        src: "https://exemplo.com/foto1.jpg",
        caption: "Uma foto importante para a história",
        credit: "Foto: Maria Santos"
      },
      {
        type: "section-title",
        title: "O Início da Jornada",
        backgroundImage: "https://exemplo.com/section-bg.jpg"
      },
      {
        type: "text",
        content: "Aqui continua a narrativa com mais detalhes..."
      },
      {
        type: "before-after",
        beforeImage: "https://exemplo.com/antes.jpg",
        afterImage: "https://exemplo.com/depois.jpg",
        beforeLabel: "Antes da transformação",
        afterLabel: "Depois da transformação"
      },
      {
        type: "parallax",
        image: "https://exemplo.com/parallax-bg.jpg",
        content: "<h2>Um momento de impacto</h2><p>Texto sobreposto na imagem</p>"
      },
      {
        type: "gallery",
        images: [
          {
            src: "https://exemplo.com/gal1.jpg",
            caption: "Primeira imagem da galeria",
            credit: "Foto: Ana Costa"
          },
          {
            src: "https://exemplo.com/gal2.jpg", 
            caption: "Segunda imagem da galeria"
          }
        ]
      },
      {
        type: "video",
        src: "https://exemplo.com/video.mp4",
        caption: "Vídeo explicativo sobre o processo",
        fullWidth: true
      },
      {
        type: "text",
        variant: "quote",
        content: "Esta é uma citação importante que destaca um ponto crucial da história.",
        author: "Especialista no Assunto",
        role: "Professor da Universidade"
      },
      {
        type: "scrollytelling",
        backgroundImage: "https://exemplo.com/scrolly-bg.jpg",
        steps: [
          {
            title: "Primeiro Passo",
            text: "Explicação do primeiro momento da história",
            image: "https://exemplo.com/step1.jpg"
          },
          {
            title: "Segundo Passo", 
            text: "Como as coisas evoluíram",
            image: "https://exemplo.com/step2.jpg"
          }
        ]
      },
      {
        type: "carousel",
        items: [
          {
            type: "image",
            src: "https://exemplo.com/car1.jpg",
            caption: "Primeira imagem do carrossel"
          },
          {
            type: "image",
            src: "https://exemplo.com/car2.jpg",
            caption: "Segunda imagem do carrossel"
          }
        ]
      }
    ]
  };
</script>

<!-- Header da matéria -->
<Header 
  title={storyData.title}
  subtitle={storyData.subtitle}
  author={storyData.author}
  publishDate={storyData.publishDate}
  backgroundImage={storyData.backgroundImage}
  variant="hero"
/>

<!-- Renderização dinâmica dos componentes baseada no tipo -->
{#each storyData.sections as section}
  {#if section.type === 'text'}
    <StoryText 
      content={section.content}
      variant={section.variant || 'body'}
      author={section.author}
      role={section.role}
    />
  
  {:else if section.type === 'photo'}
    <PhotoWithCaption 
      src={section.src}
      alt={section.alt}
      caption={section.caption}
      credit={section.credit}
      fullWidth={section.fullWidth || false}
    />
  
  {:else if section.type === 'section-title'}
    <SectionTitle 
      title={section.title}
      subtitle={section.subtitle}
      backgroundImage={section.backgroundImage}
      backgroundVideo={section.backgroundVideo}
      variant={section.variant || 'default'}
      size={section.size || 'medium'}
    />
  
  {:else if section.type === 'before-after'}
    <BeforeAfter 
      beforeImage={section.beforeImage}
      afterImage={section.afterImage}
      beforeLabel={section.beforeLabel}
      afterLabel={section.afterLabel}
      orientation={section.orientation || 'vertical'}
    />
  
  {:else if section.type === 'parallax'}
    <Parallax 
      image={section.image}
      content={section.content}
      height={section.height || '80vh'}
      speed={section.speed || 0.5}
    />
  
  {:else if section.type === 'gallery'}
    <PhotoGallery 
      images={section.images}
      layout={section.layout || 'grid'}
      columns={section.columns || 3}
    />
  
  {:else if section.type === 'video'}
    <VideoPlayer 
      src={section.src}
      poster={section.poster}
      caption={section.caption}
      credit={section.credit}
      fullWidth={section.fullWidth || false}
      autoplay={section.autoplay || false}
      controls={section.controls !== false}
    />
  
  {:else if section.type === 'scrollytelling'}
    <ScrollyTelling 
      steps={section.steps}
      backgroundImage={section.backgroundImage}
      stickyHeight={section.stickyHeight || '100vh'}
    />
  
  {:else if section.type === 'carousel'}
    <Carousel 
      items={section.items}
      autoplay={section.autoplay || false}
      interval={section.interval || 5000}
      showDots={section.showDots !== false}
      showArrows={section.showArrows !== false}
    />
  
  {/if}
{/each}
*/