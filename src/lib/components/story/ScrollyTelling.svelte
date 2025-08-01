<script>
	import { onMount } from 'svelte';
	import Scroller from './shared/Scroller.svelte';
	import Step from './shared/Step.svelte';
	
	export let steps = [];
	export let fullWidth = false;
	export let hasHeaderBefore = false;

	let currentStepIndex = 0;
	let isMobile = false;

	// Garante que os steps sejam um array válido para evitar erros.
	$: validSteps = Array.isArray(steps) ? steps : [];

	onMount(() => {
		const checkScreenSize = () => { isMobile = window.innerWidth <= 768; };
		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);
		return () => { window.removeEventListener('resize', checkScreenSize); };
	});

	// Função que determina a fonte da mídia (imagem ou vídeo) para um step específico
	function getMediaSource(step) {
		if (!step) return { type: null, src: null };

		const useMobileVideo = isMobile && step.videoMobile;
		const useMobileImage = isMobile && step.imageMobile;

		if (useMobileVideo || step.video) {
			return { type: 'video', src: useMobileVideo || step.video };
		}
		if (useMobileImage || step.image) {
			return { type: 'image', src: useMobileImage || step.image };
		}
		return { type: null, src: null };
	}
</script>

<div class="scrolly-container" class:fullWidth>
	<Scroller top={0} bottom={0.8} threshold={0.5} bind:index={currentStepIndex}>

		<div slot="background" class="background-container-fixed">
			{#each validSteps as step, i}
				{@const media = getMediaSource(step)}
				{#if media.src}
					<div class="media-wrapper" class:active={i === currentStepIndex}>
						{#if media.type === 'image'}
							<img src={media.src} alt={step.alt || step.title || ''} loading="lazy" />
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
				<Step stepText={`<h3>${step.title || ''}</h3><div>${step.text || ''}</div>`} length={validSteps.length - 1} {i} />
			{/each}
		</div>

	</Scroller>
</div>

<style>
	.scrolly-container {
		position: relative;
	}
	.fullWidth {
		width: 100vw;
		margin-left: calc(-50vw + 50%);
	}

	/* --- ALTERAÇÃO PRINCIPAL --- */
	/* Trocamos 'position: sticky' por 'position: fixed' */
	.background-container-fixed {
		position: fixed; /* Garante que ele fique fixo na viewport */
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh; /* Para garantir, mas 100dvh é ideal se o Svelte suportar */
		height: 100dvh; /* Altura dinâmica da viewport, mais preciso */
		background: #000;
		z-index: -1; /* Joga para trás do conteúdo de texto */
	}

	.media-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 0.6s ease-in-out;
	}
	.media-wrapper.active {
		opacity: 1;
	}
	.media-wrapper img, .media-wrapper video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* O container de texto precisa de um z-index para ficar na frente */
	.steps-foreground {
		position: relative;
		z-index: 10;
	}

	/* O spacer é importante para dar espaço de rolagem inicial */
	.spacer-top {
		height: 40vh;
	}

	/* Esta parte foi adicionada para garantir que o Scroller não bloqueie o conteúdo de texto */
	:global(.scroller-foreground) {
		pointer-events: none;
	}
	:global(.scroller-foreground section) {
		pointer-events: auto;
	}
</style>