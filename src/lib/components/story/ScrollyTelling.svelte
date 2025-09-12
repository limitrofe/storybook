<script>
    import { onMount } from 'svelte';
    import Scroller from './shared/Scroller.svelte';
    import Step from './shared/Step.svelte';
    import StepEnhanced from './shared/StepEnhanced.svelte';
    
    export let steps = [];
    export let fullWidth = false;
    export let hasHeaderBefore = false;

    let currentStepIndex = 0;
    let isMobile = false;
    let scrollProgress = 0;

    $: validSteps = Array.isArray(steps) ? steps : [];

    onMount(() => {
        const checkScreenSize = () => { isMobile = window.innerWidth <= 768; };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => { window.removeEventListener('resize', checkScreenSize); };
    });

    $: activeMediaIndex = (() => {
        if (scrollProgress < 0.1) return 0;
        if (scrollProgress > 0.9) return validSteps.length - 1;
        return Math.min(currentStepIndex, validSteps.length - 1);
    })();

    // FUNÇÃO getMediaSource MAIS CLARA E EXPLÍCITA
    function getMediaSource(step) {
        if (!step) {
            return { type: null, src: null };
        }

        // Em telas mobile, prioriza a mídia mobile
        if (isMobile) {
            if (step.videoMobile) return { type: 'video', src: step.videoMobile };
            if (step.imageMobile) return { type: 'image', src: step.imageMobile };
        }

        // Como fallback (ou em telas desktop), usa a mídia padrão
        if (step.video) return { type: 'video', src: step.video };
        if (step.image) return { type: 'image', src: step.image };
        
        return { type: null, src: null };
    }

    // VARIÁVEL REATIVA para garantir que a mídia seja atualizada quando `isMobile` mudar
    $: mediaSources = validSteps.map(step => {
        console.log('🔄 Recalculando mediaSources para isMobile:', isMobile);
        return getMediaSource(step);
    });

    // 🆕 NOVA FUNÇÃO: Verifica se o step usa formato avançado
    function hasAdvancedConfig(step) {
        return step.textConfig && step.textConfig.elements && Array.isArray(step.textConfig.elements);
    }

    // Debug
    $: {
        console.log('🔍 Debug dos steps carregados:', validSteps);
        validSteps.forEach((step, index) => {
            console.log(`Step ${index}:`, {
                title: step.title,
                hasImage: !!step.image,
                hasImageMobile: !!step.imageMobile,
                image: step.image,
                imageMobile: step.imageMobile,
                hasAdvancedConfig: hasAdvancedConfig(step) // 🆕 NOVO DEBUG
            });
        });
        
        console.log('📜 ScrollyTelling Debug:', {
            isMobile,
            currentStepIndex,
            scrollProgress,
            activeMediaIndex,
            activeMediaSrc: mediaSources[activeMediaIndex]?.src,
        });
    }
</script>

<div class="scrolly-container" class:fullWidth>
    <Scroller top={0} bottom={0.8} threshold={0.5} bind:index={currentStepIndex} bind:progress={scrollProgress}>

        <div slot="background" class="background-container-fixed">
            {#each mediaSources as media, i}
                {#if media.src}
                    <div class="media-wrapper" class:active={i === activeMediaIndex}>
                        {#if media.type === 'image'}
                            <img src={media.src} alt={validSteps[i].alt || validSteps[i].title || ''} loading="lazy" />
                        {:else if media.type === 'video'}
                            <video src={media.src} autoplay loop muted playsinline key={media.src}></video>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>

        <div slot="foreground" class="steps-foreground">
    <section class="spacer-top"></section>
    {#each validSteps as step, i}
        <!-- 🆕 CONDICIONAL: Usa StepEnhanced se tem textConfig.elements, senão usa Step original -->
        {#if hasAdvancedConfig(step)}
            <StepEnhanced 
                {step} 
                {isMobile}
                stepIndex={i}
                totalSteps={validSteps.length - 1}
            />
        {:else}
            <!-- Mantém o comportamento original para compatibilidade COM POSITION -->
<Step 
    stepText={`<h3>${step.title || ''}</h3><div>${step.text || ''}</div>`} 
    length={validSteps.length - 1} 
    {i}
    position={step.position || 'right'}
    variant={step.variant || ''} 
/>
        {/if}
    {/each}
    <section class="spacer-bottom"></section>
</div>

    </Scroller>
    
    <div class="component-spacer"></div>
</div>

<style>
    /* Seu CSS continua igual */
    .scrolly-container {
        position: relative;
    }
    
    .fullWidth {
        width: 100vw;
        margin-left: calc(-50vw + 50%);
    }

    .background-container-fixed {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        height: 100dvh;
        background: #000;
        z-index: -1;
    }

    .media-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        /* transition: opacity 0.5s ease-in-out; Adicionado para suavizar a troca */
    }
    
    .media-wrapper.active {
        opacity: 1;
    }
    
    .media-wrapper img, .media-wrapper video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .steps-foreground {
        position: relative;
        z-index: 10;
    }

    .spacer-top { height: 40vh; }
    .spacer-bottom { height: 60vh; }
    .component-spacer { height: 20vh; background: transparent; position: relative; z-index: 5; }

    :global(.scroller-foreground) { pointer-events: none; }
    :global(.scroller-foreground section) { pointer-events: auto; }

    @media (max-width: 768px) {
        .spacer-top { height: 30vh; }
        .spacer-bottom { height: 40vh; }
        .component-spacer { height: 15vh; }
    }
</style>