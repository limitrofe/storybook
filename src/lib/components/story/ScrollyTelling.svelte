<script>
    import { onMount } from 'svelte';
    import Scroller from './shared/Scroller.svelte';
    import Step from './shared/Step.svelte';
    import StepEnhanced from './shared/StepEnhanced.svelte';
    
    export let steps = [];
    export let fullWidth = false;
    export let hasHeaderBefore = false;
    export let threshold;
    export let stickyTopDesktop;
    export let stickyTopMobile;

    let currentStepIndex = 0;
    let isMobile = false;
    let scrollProgress = 0;

    const DEFAULT_DESKTOP_STICKY = 'min(0, 0px)';
    const DEFAULT_MOBILE_STICKY = '4vh';

    const DEFAULT_STEP = {
        title: '',
        text: '',
        position: 'right',
        variant: 'default',
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        overlayColor: 'rgba(0, 0, 0, 0.35)',
        textColor: '#F9FAFB',
        accentColor: '#C4170C',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        padding: '2rem',
        maxWidth: '460px',
        maxWidthMobile: '92%',
        image: '',
        imageMobile: '',
        video: '',
        videoMobile: '',
        alt: '',
        caption: '',
        cardVisibility: 'card',
        stickyTop: undefined,
        stickyTopMobile: undefined,
        textConfig: undefined
    };

    const buildStep = (step = {}) => ({ ...DEFAULT_STEP, ...step });

    $: normalizedSteps = Array.isArray(steps) && steps.length
        ? steps.map((step) => buildStep(step))
        : [buildStep()];

    $: baseStickyTopDesktop = stickyTopDesktop ?? (hasHeaderBefore ? DEFAULT_DESKTOP_STICKY : '0px');
    $: baseStickyTopMobile = stickyTopMobile ?? (hasHeaderBefore ? DEFAULT_MOBILE_STICKY : '0px');

    $: effectiveThreshold = typeof threshold === 'number' ? threshold : 0;

    function getStickyTop(step, mobile) {
        if (!step) return mobile ? baseStickyTopMobile : baseStickyTopDesktop;
        if (mobile) {
            return step.stickyTopMobile ?? step.stickyTop ?? baseStickyTopMobile;
        }
        return step.stickyTop ?? baseStickyTopDesktop;
    }

    onMount(() => {
        const checkScreenSize = () => { isMobile = window.innerWidth <= 768; };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => { window.removeEventListener('resize', checkScreenSize); };
    });

    $: activeMediaIndex = normalizedSteps.length
        ? Math.max(0, Math.min(currentStepIndex, normalizedSteps.length - 1))
        : 0;

    function resolveMedia(step) {
        if (!step) {
            return { type: null, src: null };
        }

        if (isMobile) {
            if (step.videoMobile) return { type: 'video', src: step.videoMobile };
            if (step.imageMobile) return { type: 'image', src: step.imageMobile };
        }

        if (step.video) return { type: 'video', src: step.video };
        if (step.image) return { type: 'image', src: step.image };

        return { type: null, src: null };
    }

    $: mediaSources = normalizedSteps.map((step) => {
        const media = resolveMedia(step);
        return {
            ...media,
            backgroundColor: step.backgroundColor,
            overlayColor: step.overlayColor,
            caption: step.caption,
            alt: step.alt || step.title || '',
            textColor: step.textColor
        };
    });

    function hasAdvancedConfig(step) {
        return step?.textConfig?.elements && Array.isArray(step.textConfig.elements);
    }
</script>

<div class="scrolly-container" class:fullWidth>
    <Scroller
        top={0}
        bottom={1}
        threshold={effectiveThreshold}
        bind:index={currentStepIndex}
        bind:progress={scrollProgress}
    >

        <div slot="background" class="background-container-fixed">
            {#each mediaSources as media, i}
                <div
                    class="media-wrapper"
                    class:active={i === activeMediaIndex}
                    style={`background:${media.backgroundColor || '#000'}`}
                >
                    {#if media.type === 'image' && media.src}
                        <img src={media.src} alt={media.alt} loading="lazy" />
                    {:else if media.type === 'video' && media.src}
                        <video src={media.src} autoplay loop muted playsinline key={media.src}></video>
                    {/if}

                    {#if media.overlayColor}
                        <div class="media-overlay" style={`background:${media.overlayColor}`}></div>
                    {/if}

                    {#if media.caption}
                        <div class="media-caption" style={`color:${media.textColor || '#f4f4f5'}`}>
                            {@html media.caption}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>

        <div slot="foreground" class="steps-foreground">
    <section class="spacer-top"></section>
    {#each normalizedSteps as step, i}
        <div class="step-wrapper">
            <!-- 🆕 CONDICIONAL: Usa StepEnhanced se tem textConfig.elements, senão usa Step original -->
            {#if hasAdvancedConfig(step)}
                <StepEnhanced 
                    {step} 
                    {isMobile}
                    stepIndex={i}
                    totalSteps={normalizedSteps.length - 1}
                    active={i === currentStepIndex}
                    defaultStickyTopDesktop={getStickyTop(step, false)}
                    defaultStickyTopMobile={getStickyTop(step, true)}
                />
            {:else}
                <!-- Mantém o comportamento original para compatibilidade COM POSITION -->
                <Step 
                    stepText={`<h3>${step.title || ''}</h3><div>${step.text || ''}</div>`} 
                    length={normalizedSteps.length - 1} 
                    {i}
                    position={step.position || 'right'}
                    variant={step.variant || ''} 
                    active={i === currentStepIndex}
                    stickyTop={isMobile ? getStickyTop(step, true) : getStickyTop(step, false)}
                    backgroundColor={step.backgroundColor}
                    textColor={step.textColor}
                    accentColor={step.accentColor}
                    borderColor={step.borderColor}
                    padding={step.padding}
                    maxWidth={step.maxWidth}
                    maxWidthMobile={step.maxWidthMobile}
                    cardVisibility={step.cardVisibility}
                />
            {/if}
        </div>
    {/each}
    <section class="spacer-bottom"></section>
</div>

    </Scroller>
    
    <div class="component-spacer"></div>
</div>

<style>
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
        transition: opacity 0.45s ease-in-out;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-end;
        padding: clamp(1.25rem, 5vw, 3rem);
    }
    
    .media-wrapper.active {
        opacity: 1;
        z-index: 1;
    }
    
    .media-wrapper img,
    .media-wrapper video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
    }

    .media-wrapper video {
        background: #000;
    }

    .media-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 2;
    }

    .media-caption {
        position: relative;
        z-index: 3;
        max-width: min(420px, 38vw);
        font-size: 0.85rem;
        line-height: 1.45;
        background: rgba(15, 23, 42, 0.55);
        color: inherit;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: 0 10px 35px rgba(15, 15, 15, 0.3);
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
        .media-wrapper {
            align-items: flex-start;
            padding: 1.25rem;
        }
        .media-caption {
            max-width: min(90%, 28rem);
            font-size: 0.75rem;
            line-height: 1.35;
        }
    }
</style>
