<script>
	import { onMount } from 'svelte';

	export let fullWidth = false;
	export let steps = [];
	export let backgroundImage = '';
	export let stickyHeight = '100vh';

	let currentStep = 0;
	let stepsContainer;

	onMount(() => {
		if (!steps || steps.length === 0) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						currentStep = parseInt(entry.target.dataset.step);
					}
				});
			},
			{ rootMargin: '-50% 0px -50% 0px', threshold: 0 }
		);
		const stepElements = stepsContainer.querySelectorAll('.scrolly-step');
		stepElements.forEach((step) => observer.observe(step));
		return () => observer.disconnect();
	});
</script>

{#if steps && steps.length > 0}
	<div class="scrolly-container" class:full-width={fullWidth}>
		<div class="scrolly-sticky" style:height={stickyHeight}>
			<div class="scrolly-background" style:background-image="url({backgroundImage})" />
			<div class="scrolly-content">
				{#each steps as step, index}
					<div class="scrolly-visual" class:active={currentStep === index}>
						{#if step.image}
							<picture>
								{#if step.imageMobile}
									<source media="(max-width: 768px)" srcset={step.imageMobile} />
								{/if}
								<img src={step.image} alt={step.alt || ''} loading="lazy" />
							</picture>
						{/if}
						{#if step.video}
							<video class="desktop-video" autoplay muted loop playsinline src={step.video} />
						{/if}
						{#if step.videoMobile}
							<video class="mobile-video" autoplay muted loop playsinline src={step.videoMobile} />
						{/if}
						{#if step.html}
							<div class="html-content">{@html step.html}</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="scrolly-steps" bind:this={stepsContainer}>
			{#each steps as step, index}
				<div class="scrolly-step" data-step={index}>
					<div class="scrolly-step-content">
						<h3>{step.title}</h3>
						<p>{@html step.text}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="scrolly-fallback">
		<h3>⚠️ ScrollyTelling</h3>
		<p>Nenhum "step" encontrado. Verifique a formatação no Google Docs.</p>
	</div>
{/if}

<style>
	/* ============================================== */
	/* ESTILOS BASE E MOBILE-FIRST (PADRÃO)           */
	/* ============================================== */

	.scrolly-container {
		display: grid;
		/* Layout padrão mobile: uma única coluna */
		grid-template-columns: 1fr;
		position: relative;
		margin: 4rem 0;
	}

	.scrolly-sticky,
	.scrolly-steps {
		/* No mobile, ambos ocupam a mesma célula do grid, um sobre o outro */
		grid-column: 1 / 2;
		grid-row: 1 / 2;
	}

	.scrolly-sticky {
		position: sticky;
		top: 0;
		width: 100%;
		height: var(--sticky-height, 100vh);
		z-index: 0;
	}
	
	.scrolly-background {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		opacity: 0.1;
	}

	.scrolly-content {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.scrolly-visual {
		position: absolute;
		inset: 0;
		opacity: 0;
		transform: scale(0.95);
		transition: opacity 0.5s ease, transform 0.5s ease;
		background-color: var(--color-border); /* Fallback enquanto mídia carrega */
	}

	.scrolly-visual.active {
		opacity: 1;
		transform: scale(1);
	}

	.scrolly-visual img,
	.scrolly-visual video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.desktop-video { display: none; } /* Escondido por padrão (mobile) */
	.mobile-video { display: block; }  /* Visível por padrão (mobile) */
    
	.scrolly-steps {
		z-index: 2; /* Texto fica por cima da parte visual */
	}
    
	.scrolly-step {
		min-height: var(--sticky-height, 100vh);
		/* Alinha o box de texto na parte de baixo da tela no mobile */
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: 1rem;
	}
    
	.scrolly-step-content {
		background: rgba(var(--color-background-rgb), 0.8);
		backdrop-filter: blur(10px);
		color: var(--color-text);
		padding: 1.5rem;
		border-radius: 12px;
		max-width: 500px;
		width: calc(100% - 2rem);
		text-align: center;
		margin-bottom: 20vh; /* Distância da base da tela */
	}
    
	/* ============================================== */
	/* ESTILOS PARA DESKTOP (TELAS MAIORES)           */
	/* ============================================== */

	@media (min-width: 769px) {
		/* Layout de duas colunas para desktop */
		.scrolly-container {
			grid-template-columns: 1fr 1fr;
		}

		.scrolly-sticky {
			grid-column: 1 / 2;
		}
        
		.scrolly-steps {
			grid-column: 2 / 3;
		}
        
		.scrolly-step {
			/* Centraliza o box de texto verticalmente no desktop */
			align-items: center;
			justify-content: flex-start;
			padding: 2rem;
		}
        
		.scrolly-step-content {
			text-align: left;
			margin-bottom: 0; /* Reseta a margem do mobile */
		}

		.desktop-video { display: block; }
		.mobile-video { display: none; }
		
		/* --- ESTILOS FULL-WIDTH PARA DESKTOP --- */
		.scrolly-container.full-width {
			grid-template-columns: 1fr;
		}
		.scrolly-container.full-width .scrolly-sticky,
		.scrolly-container.full-width .scrolly-steps {
			grid-column: 1 / -1;
		}
		.scrolly-container.full-width .scrolly-step {
			justify-content: flex-end; /* Alinha texto à direita no modo full-width */
			padding-right: 5vw;
		}
		.scrolly-container.full-width .scrolly-visual img,
		.scrolly-container.full-width .scrolly-visual video {
			border-radius: 0;
		}
	}
</style>