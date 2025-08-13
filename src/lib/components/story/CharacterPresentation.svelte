<script>
  import { onMount, onDestroy } from 'svelte';

  export let personagens = [];
  export let shapeColor = '#b51207';
  export let nameColor = '#000000';
  export let textColor = '#ffffff';
  export let backgroundColor = '#000000';

  // Processar personagens
  $: processedPersonagens = (() => {
    if (!personagens) return [];
    
    if (typeof personagens === 'string') {
      try {
        return JSON.parse(personagens);
      } catch {
        return [];
      }
    }
    
    if (Array.isArray(personagens)) {
      return personagens;
    }
    
    // Se for objeto, tenta extrair o array
    return personagens.personagens || personagens.characters || personagens.lista || [];
  })();

  let scrollY = 0;
  let containerElement;
  let characterSections = [];
  let animationStates = [];

  onMount(() => {
    // Inicializar estados
    animationStates = processedPersonagens.map(() => ({
      inView: false,
      nameProgress: 0,
      shapeProgress: 0,
      textProgress: 0,
      isPinned: false
    }));

    const handleScroll = () => {
      scrollY = window.scrollY;
      updateAnimations();
    };

    window.addEventListener('scroll', handleScroll);

    // Um pequeno delay para garantir que o DOM foi totalmente renderizado
    setTimeout(() => {
      if (containerElement) {
        characterSections = Array.from(containerElement.querySelectorAll('.character-wrapper'));
        updateAnimations(); // Chame uma vez para definir o estado inicial (que agora será 0 para o primeiro item)
      }
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  function updateAnimations() {
    if (!characterSections || !window) return;

    const windowHeight = window.innerHeight;

    characterSections.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const elementHeight = rect.height;
      const elementTop = rect.top;

      // Definimos que a animação completa ocorrerá durante 200vh (2x a altura da tela) de scroll.
      // Isso dá um bom ritmo para a animação.
      const animationScrollDuration = windowHeight * 2;

      // O progresso da animação (de 0.0 a 1.0) é calculado com base em quanto o usuário
      // já rolou para baixo DEPOIS que a seção ficou fixa no topo.
      // `elementTop` se torna negativo ao rolar para baixo, por isso `-elementTop`.
      const scrollProgress = Math.max(0, Math.min(1, -elementTop / animationScrollDuration));

      const state = animationStates[index];

      // Atualiza o estado de "pinado"
      state.isPinned = elementTop <= 0 && elementTop > -elementHeight + windowHeight;

      // Com o novo `scrollProgress`, as animações só começarão quando o usuário rolar a página,
      // mesmo para o primeiro personagem.

      // Fase 1: Nome se move (ocorre nos primeiros 20% da animação)
      state.nameProgress = Math.min(1, scrollProgress / 0.2);

      // Fase 2: Tarja entra (começa em 10% e termina em 30%)
      state.shapeProgress = scrollProgress > 0.1 ? Math.min(1, (scrollProgress - 0.1) / 0.2) : 0;

      // Fase 3: Texto aparece (começa em 30% e vai até o final)
      state.textProgress = scrollProgress > 0.3 ? (scrollProgress - 0.3) / 0.7 : 0;
      
      animationStates[index] = { ...state };
    });

    animationStates = [...animationStates];
  }
</script>

<div class="container" bind:this={containerElement} style="background: {backgroundColor};">
  {#if processedPersonagens && processedPersonagens.length > 0}
    {#each processedPersonagens as personagem, index}
      <div class="character-wrapper">
        <div class="character-section">
          <div class="character-container">
            <!-- Foto responsiva com background-image -->
            <div class="photo-background" style="
              background-image: url('{personagem.foto}');
              --mobile-bg: url('{personagem.fotoMobile || personagem.foto}');
            "></div>
            
            <div
              class="character-name"
              style="
                color: {nameColor};
                transform: 
                  translate(
                    {index % 2 === 0 ? -10 : -90}%, 
                    {index % 2 === 0 ? 20 : 20}%
                  ) 
                  translateX(
                    {(animationStates[index]?.nameProgress || 0) * (index % 2 === 0 ? -40 : 40)}vw
                  );
              "
            >
              {#if personagem.sobrenome}
                <h5>{personagem.sobrenome}</h5>
              {/if}
              <h2>{personagem.nome}</h2>
            </div>
            
            <div 
              class="shape-overlay"
              style="
                background: {shapeColor};
                transform: translateX({
                  index % 2 === 0 
                    ? 100 - (animationStates[index]?.shapeProgress || 0) * 100
                    : -100 + (animationStates[index]?.shapeProgress || 0) * 100
                }%);
              "
            ></div>
            
            <div class="text-container {index % 2 === 0 ? 'text-right' : 'text-left'}">
              <div class="text-wrapper {index % 2 === 0 ? 'align-left' : 'align-right'}">
                <p class="description-text" style="color: {textColor};">
                  {#each (personagem.descricao || '').split('. ') as linha, lineIndex}
                    {#if linha.trim()}
                      {@const totalLines = personagem.descricao.split('. ').filter(l => l.trim()).length}
                      {@const lineProgress = (animationStates[index]?.textProgress || 0) * totalLines}
                      <span 
                        class="text-line"
                        class:visible={lineIndex < lineProgress}
                        style="transition-delay: {lineIndex * 0.15}s"
                      >
                        {linha.replace(/\.+$/, '')}.
                      </span>
                    {/if}
                  {/each}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/each}
  {:else}
    <div class="character-section">
      <p style="color: white; text-align: center;">Nenhum personagem encontrado</p>
    </div>
  {/if}
</div>

<style>
  .container {
    width: 100%;
    position: relative;
  }
  
  .character-wrapper {
    height: 400vh;
    position: relative;
  }
  
  .character-section {
    height: 100vh;
    width: 100%;
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .character-container {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }
  
  .photo-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  /* Responsivo com CSS custom properties */
  @media (max-width: 768px) {
    .photo-background {
      background-image: var(--mobile-bg) !important;
    }
  }

  .background-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  
  .photo-placeholder {
    width: 100%;
    height: 100%;
    background: #b51207;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 2rem;
  }
  
  .character-name {
    position: absolute;
    left: 50%;
    top: 20%;
    transform: translate(-50%, -50%);
    font-size: clamp(8rem, 15vw, 15rem);
    font-weight: 700;
    letter-spacing: -0.01em;
    z-index: 10;
    text-transform: uppercase;
    font-family: "obviously-compressed", sans-serif;
    white-space: nowrap;
    transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    text-shadow: 0 0 5px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .character-name h2 {
    margin: 0;
    line-height: 0.9;
    font-size: inherit;
    font-family: "obviously-compressed", sans-serif;
    font-weight: 700;
  }
  
  .character-name h5 {
    font-size: 1.5rem;
    font-family: "obviously", sans-serif;
    font-weight: 400;
    letter-spacing: normal;
    line-height: 0.8;
    margin: 0;
    margin-bottom: 0.3rem;
    opacity: 0.9;
    text-transform: none;
  }

  .shape-overlay {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    will-change: transform;
    transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .text-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 8;
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  
  .text-container.text-right {
    justify-content: flex-end;
    padding-right: 5%;
  }
  
  .text-container.text-left {
    justify-content: flex-start;
    padding-left: 5%;
  }
  
  .text-wrapper {
    width: 85%;
    max-width: 700px;
  }
  
  .text-wrapper.align-left {
    text-align: right;
    padding-right: 5%;
  }
  
  .text-wrapper.align-right {
    text-align: left;
  }
  
  .description-text {
    font-size: 1.5rem;
    line-height: 1.5;
    font-weight: 300;
  }
  
  .text-line {
    display: block;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease-out;
    margin-bottom: 1em;
  }
  
  .text-line.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .character-wrapper:nth-child(even) .character-section {
    background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  }
  
  .character-wrapper:nth-child(odd) .character-section {
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  }
  
  @media (max-width: 768px) {
    .character-name {
      font-size: clamp(6rem, 16vw, 4rem);
      top: 80%;
    }

    .character-name h5 {
      font-size: 1rem;
    }
    
    .description-text {
      font-size: 1rem;
      text-align: left;
      width: 80%;
    }
    
    .text-container {
      align-items: start;
      top: 5%;
    }
    
    .text-container.text-right,
    .text-container.text-left {
      justify-content: center;
      padding: 0 5%;
    }
    
    .text-wrapper {
      width: 90%;
      text-align: center !important;
      top: 10%;
    }
    
    .text-wrapper.align-left,
    .text-wrapper.align-right {
      text-align: left !important;
    }
    
    .character-name {
      align-items: start;
      margin-bottom: 0px;
      text-shadow: none;
    }
  }
</style>