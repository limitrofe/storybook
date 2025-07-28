<!-- src/lib/components/story/ScrollyTelling.svelte -->
<script>
  import { onMount } from 'svelte';
  
  export let steps = [];
  export let backgroundImage = '';
  export let stickyHeight = '100vh';
  export let fullWidth = false; // Nova prop para controlar se ocupa toda a largura
  
  let currentStep = 0;
  let stepsContainer;
  let stickyElement;

  // 🔧 VALIDAÇÃO: Garantir que steps é um array válido
  $: validSteps = Array.isArray(steps) && steps.length > 0 ? steps : [];
  $: hasValidSteps = validSteps.length > 0;

  // 🔧 DEBUG: Log para desenvolvimento
  $: if (import.meta.env.DEV) {
    console.log('📜 ScrollyTelling Debug:', {
      stepsReceived: steps,
      validSteps: validSteps.length,
      hasValidSteps,
      fullWidth,
      stickyHeight
    });
  }

  onMount(() => {
    if (!hasValidSteps) {
      console.warn('⚠️ ScrollyTelling: Nenhum step válido encontrado');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.dataset.step);
            if (!isNaN(stepIndex) && stepIndex < validSteps.length) {
              currentStep = stepIndex;
            }
          }
        });
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0.5
      }
    );

    // Aguardar a renderização dos elementos
    setTimeout(() => {
      const stepElements = stepsContainer?.querySelectorAll('.scrolly-step');
      if (stepElements) {
        stepElements.forEach((step) => observer.observe(step));
      }
    }, 100);

    return () => observer.disconnect();
  });

  // 🔧 FUNÇÃO: Detectar tipo de mídia do step
  function getMediaType(step) {
    if (step.video || step.videoMobile) return 'video';
    if (step.image || step.imageMobile) return 'image';
    if (step.html) return 'html';
    return null;
  }

  // 🔧 FUNÇÃO: Obter fonte da mídia com fallback responsivo
  function getMediaSource(step, type) {
    if (type === 'video') {
      // Prioriza mobile se estiver em tela pequena
      if (window.innerWidth <= 768 && step.videoMobile) {
        return step.videoMobile;
      }
      return step.video || step.videoMobile;
    }
    
    if (type === 'image') {
      // Prioriza mobile se estiver em tela pequena
      if (window.innerWidth <= 768 && step.imageMobile) {
        return step.imageMobile;
      }
      return step.image || step.imageMobile;
    }
    
    return null;
  }
</script>

<!-- 🔧 FALLBACK: Se não tem steps válidos, mostra aviso -->
{#if !hasValidSteps}
  <div class="scrolly-error">
    <div class="error-content">
      <h3>⚠️ ScrollyTelling</h3>
      <p>Nenhum "step" encontrado. Verifique a formatação no Google Docs.</p>
      <details>
        <summary>Debug Info</summary>
        <pre>{JSON.stringify({ steps, validSteps, hasValidSteps }, null, 2)}</pre>
      </details>
    </div>
  </div>
{:else}
  <!-- 🔧 COMPONENTE PRINCIPAL: ScrollyTelling funcional -->
  <div class="scrolly-container" class:scrolly-container--fullwidth={fullWidth}>
    <div class="scrolly-sticky" style="height: {stickyHeight}">
      <!-- Background padrão se definido -->
      {#if backgroundImage}
        <div 
          class="scrolly-background"
          style="background-image: url({backgroundImage})"
        ></div>
      {/if}
      
      <div class="scrolly-content" class:scrolly-content--fullwidth={fullWidth}>
        {#each validSteps as step, index}
          {@const mediaType = getMediaType(step)}
          {@const isActive = currentStep === index}
          
          <div 
            class="scrolly-visual" 
            class:active={isActive}
            class:scrolly-visual--fullwidth={fullWidth}
          >
            {#if mediaType === 'image'}
              {@const imageSrc = getMediaSource(step, 'image')}
              {#if imageSrc}
                <img 
                  src={imageSrc} 
                  alt={step.alt || step.title || `Step ${index + 1}`}
                  loading="lazy"
                />
              {/if}
              
            {:else if mediaType === 'video'}
              {@const videoSrc = getMediaSource(step, 'video')}
              {#if videoSrc}
                <video 
                  autoplay 
                  muted 
                  loop 
                  playsinline
                  src={videoSrc}
                >
                  <source src={videoSrc} type="video/mp4" />
                  Seu navegador não suporta vídeo HTML5.
                </video>
              {/if}
              
            {:else if mediaType === 'html'}
              <div class="scrolly-html-content">
                {@html step.html}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- 🔧 STEPS DE TEXTO: Layout responsivo -->
    <div 
      class="scrolly-steps" 
      class:scrolly-steps--fullwidth={fullWidth}
      bind:this={stepsContainer}
    >
      {#each validSteps as step, index}
        <div 
          class="scrolly-step"
          class:scrolly-step--fullwidth={fullWidth}
          data-step={index}
        >
          <div class="scrolly-step-content">
            {#if step.title}
              <h3 class="scrolly-step-title">{step.title}</h3>
            {/if}
            {#if step.text}
              <div class="scrolly-step-text">
                {@html step.text}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  /* ===== ERRO/FALLBACK STYLES ===== */
  .scrolly-error {
    background: #fef7f0;
    border: 2px solid #f97316;
    border-radius: 12px;
    padding: 2rem;
    margin: 2rem 0;
    text-align: center;
  }

  .error-content h3 {
    color: #ea580c;
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
  }

  .error-content p {
    color: #9a3412;
    margin: 0 0 1rem 0;
  }

  .error-content details {
    text-align: left;
    margin-top: 1rem;
    background: white;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #fed7aa;
  }

  .error-content pre {
    font-size: 0.8rem;
    overflow: auto;
    max-height: 200px;
  }

  /* ===== MAIN COMPONENT STYLES ===== */
  .scrolly-container {
    position: relative;
    margin: 2rem 0;
  }

  .scrolly-container--fullwidth {
    margin: 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
  }

  .scrolly-sticky {
    position: sticky;
    top: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    overflow: hidden;
  }

  .scrolly-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0.3;
    z-index: 1;
  }

  .scrolly-content {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scrolly-content--fullwidth {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .scrolly-visual {
    position: absolute;
    opacity: 0;
    transition: opacity 0.8s ease;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scrolly-visual--fullwidth {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
  }

  .scrolly-visual.active {
    opacity: 1;
  }

  .scrolly-visual img,
  .scrolly-visual video {
    width: 100%;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  /* FullWidth: Remove border-radius e shadow */
  .scrolly-visual--fullwidth img,
  .scrolly-visual--fullwidth video {
    border-radius: 0;
    box-shadow: none;
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  .scrolly-html-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: white;
    text-align: center;
    padding: 2rem;
  }

  /* ===== STEPS TEXT AREA ===== */
  .scrolly-steps {
    position: relative;
    z-index: 3;
  }

  .scrolly-steps--fullwidth {
    background: var(--color-background);
  }

  .scrolly-step {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 2rem;
  }

  .scrolly-step--fullwidth {
    min-height: 100vh;
    background: var(--color-background);
  }

  .scrolly-step-content {
    background: var(--color-background);
    color: var(--color-text);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    margin-left: auto;
    margin-right: 2rem;
    border: 1px solid var(--color-border);
  }

  /* FullWidth: Ajusta layout dos textos */
  .scrolly-step--fullwidth .scrolly-step-content {
    max-width: 600px;
    margin: 0 auto;
    background: rgba(var(--color-background-rgb, 255, 255, 255), 0.95);
    backdrop-filter: blur(10px);
  }

  .scrolly-step-title {
    font-size: var(--font-size-100);
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--color-primary);
    line-height: 1.2;
  }

  .scrolly-step-text {
    font-size: var(--font-size-70);
    line-height: 1.6;
    margin: 0;
    color: var(--color-text);
  }

  /* Formatação HTML dentro do texto */
  .scrolly-step-text :global(strong) {
    color: var(--color-primary);
    font-weight: 700;
  }

  .scrolly-step-text :global(em) {
    color: var(--color-secondary);
    font-style: italic;
  }

  .scrolly-step-text :global(a) {
    color: var(--color-primary);
    text-decoration: underline;
  }

  /* ===== RESPONSIVE DESIGN ===== */
  @media (max-width: 768px) {
    .scrolly-container--fullwidth {
      margin-left: 0;
      width: 100%;
    }

    .scrolly-step {
      padding: 1rem;
    }

    .scrolly-step-content {
      margin: 0 auto;
      max-width: 90%;
      padding: 1.5rem;
    }

    .scrolly-step--fullwidth .scrolly-step-content {
      max-width: 85%;
    }

    .scrolly-step-title {
      font-size: var(--font-size-90);
    }

    .scrolly-step-text {
      font-size: var(--font-size-60);
    }

    .scrolly-visual {
      max-width: 95%;
      max-height: 95%;
    }

    .scrolly-html-content {
      padding: 1rem;
      font-size: 0.9rem;
    }
  }

  /* ===== ANIMAÇÕES E TRANSIÇÕES ===== */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .scrolly-step-content {
    animation: fadeInUp 0.6s ease-out;
  }

  /* Estados de hover para interatividade */
  .scrolly-step-content:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }

  /* ===== ACESSIBILIDADE ===== */
  @media (prefers-reduced-motion: reduce) {
    .scrolly-visual {
      transition: none;
    }
    
    .scrolly-step-content {
      animation: none;
    }
    
    .scrolly-step-content:hover {
      transform: none;
    }
  }

  /* ===== TEMAS ===== */
  @media (prefers-color-scheme: dark) {
    .scrolly-error {
      background: #451a03;
      border-color: #ea580c;
    }
    
    .error-content details {
      background: #292524;
      border-color: #a16207;
    }
  }

  /* Alto contraste */
  @media (prefers-contrast: high) {
    .scrolly-step-content {
      border: 2px solid var(--color-text);
    }
    
    .scrolly-error {
      border-width: 3px;
    }
  }

  /* ===== DEBUG INFO (só em desenvolvimento) ===== */
  .scrolly-debug {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-family: monospace;
    z-index: 9999;
  }
</style>