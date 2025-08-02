<!-- src/lib/components/story/ScrollyTelling.svelte -->
<script>
	import { onMount } from 'svelte';
	import Scroller from './shared/Scroller.svelte';
	import Step from './shared/Step.svelte';
	
	export let steps = [];
	export let fullWidth = false;
	export let hasHeaderBefore = false;

	let currentStepIndex = 0;
	let isMobile = false;
	let scrollProgress = 0; // ✨ NOVA VARIÁVEL para controlar progresso

	// Garante que os steps sejam um array válido para evitar erros.
	$: validSteps = Array.isArray(steps) ? steps : [];

	onMount(() => {
		const checkScreenSize = () => { isMobile = window.innerWidth <= 768; };
		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);
		return () => { window.removeEventListener('resize', checkScreenSize); };
	});

	// ✨ LÓGICA MELHORADA: Mantém última imagem até sair da tela
	$: activeMediaIndex = (() => {
		// Se ainda não rolou muito (primeiros 10%), mostra primeira imagem
		if (scrollProgress < 0.1) return 0;
		
		// Se chegou ao final (últimos 10%), mantém a última imagem
		if (scrollProgress > 0.9) return validSteps.length - 1;
		
		// Caso contrário, usa o índice atual baseado no step
		return Math.min(currentStepIndex, validSteps.length - 1);
	})();

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

	// ✨ NOVA FUNÇÃO: Debug para acompanhar o comportamento
	$: {
		console.log('📜 ScrollyTelling Debug:', {
			currentStepIndex,
			scrollProgress,
			activeMediaIndex,
			totalSteps: validSteps.length
		});
	}
</script>

<div class="scrolly-container" class:fullWidth>
	<!-- ✨ MUDANÇA: Adicionando bind:progress para capturar scroll progress -->
	<Scroller top={0} bottom={0.8} threshold={0.5} bind:index={currentStepIndex} bind:progress={scrollProgress}>

		<div slot="background" class="background-container-fixed">
			{#each validSteps as step, i}
				{@const media = getMediaSource(step)}
				{#if media.src}
					<!-- ✨ MUDANÇA: Agora usa activeMediaIndex ao invés de currentStepIndex -->
					<div class="media-wrapper" class:active={i === activeMediaIndex}>
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
			<!-- ✨ NOVO: Spacer final para evitar sobreposição -->
			<section class="spacer-bottom"></section>
		</div>

	</Scroller>
	
	<!-- ✨ NOVO: Spacer adicional FORA do Scroller para garantir separação -->
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
		height: 100dvh; /* Altura dinâmica da viewport */
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

	.steps-foreground {
		position: relative;
		z-index: 10;
	}

	.spacer-top {
		height: 40vh;
	}

	/* ✨ NOVO: Spacer no final dos steps */
	.spacer-bottom {
		height: 60vh; /* Espaço extra para manter última imagem visível */
	}

	/* ✨ NOVO: Spacer do componente para separar do próximo */
	.component-spacer {
		height: 20vh; /* Espaço entre este e o próximo componente */
		background: transparent;
		position: relative;
		z-index: 5;
	}

	/* Garantir que o Scroller não bloqueie interações */
	:global(.scroller-foreground) {
		pointer-events: none;
	}
	
	:global(.scroller-foreground section) {
		pointer-events: auto;
	}

	/* ✨ NOVO: Media queries para ajustar spacers em mobile */
	@media (max-width: 768px) {
		.spacer-top {
			height: 30vh;
		}
		
		.spacer-bottom {
			height: 40vh;
		}
		
		.component-spacer {
			height: 15vh;
		}
	}

	/* ✨ NOVO: Suavizar transições em dispositivos de baixa performance */
	@media (prefers-reduced-motion: reduce) {
		.media-wrapper {
			transition: opacity 0.3s ease;
		}
	}
</style>