<script>
	import { onMount, tick } from 'svelte';
	import { loadFlourishScript } from '$lib/utils/flourish.js';

	export let src = '';
	export let steps = [];

	let flourishContainer;
	let stepsContainer;
	let flourishInstance;
	let isLoading = true;
	let error = null;
	let mounted = false;

	// 🔧 VALIDAÇÃO: Garantir que os dados são válidos
	$: validSteps = Array.isArray(steps) && steps.length > 0 ? steps : [];
	$: hasValidData = src && validSteps.length > 0;

	// 🔧 DEBUG: Log para desenvolvimento
	$: if (import.meta.env.DEV) {
		console.log('🌺 Flourish Scrolly Debug:', {
			src,
			steps: steps?.length || 0,
			validSteps: validSteps.length,
			hasValidData,
			mounted,
			isLoading,
			error
		});
	}

	onMount(async () => {
		if (!hasValidData) {
			error = 'Configuração inválida: src ou steps ausentes';
			isLoading = false;
			return;
		}

		try {
			console.log('🌺 Iniciando Flourish Scrolly...');
			
			// 1. Espera o script estar 100% carregado
			await loadFlourishScript();
			console.log('✅ Script Flourish carregado');

			// 2. Espera o Svelte renderizar completamente
			await tick();
			console.log('✅ DOM renderizado');

			// 3. Aguarda um pouco mais para garantir que o container existe
			await new Promise(resolve => setTimeout(resolve, 100));

			if (!flourishContainer) {
				throw new Error('Container do Flourish não encontrado no DOM');
			}

			console.log('🌺 Inicializando visualização Flourish...');
			
			// 4. Inicializa a visualização Flourish
			flourishInstance = window.Flourish.Live({
				container: flourishContainer,
				src: src,
				height: '100%',
				width: '100%'
			});

			console.log('✅ Flourish inicializado:', flourishInstance);

			// 5. Configura o observer para os steps
			setupIntersectionObserver();
			
			mounted = true;
			isLoading = false;

		} catch (err) {
			console.error('❌ Erro ao inicializar Flourish Scrolly:', err);
			error = err.message;
			isLoading = false;
		}
	});

	function setupIntersectionObserver() {
		if (!flourishInstance || !stepsContainer) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const slideNumber = parseInt(entry.target.dataset.slide, 10);
						console.log(`🌺 Mudando para slide: ${slideNumber}`);
						
						if (flourishInstance && typeof flourishInstance.update === 'function') {
							flourishInstance.update({ slide: slideNumber });
						}
						break;
					}
				}
			},
			{ 
				rootMargin: '-40% 0px -40% 0px', 
				threshold: 0.1 
			}
		);

		// Aguarda os elements estarem renderizados
		setTimeout(() => {
			const stepElements = stepsContainer?.querySelectorAll('.scrolly-step');
			if (stepElements && stepElements.length > 0) {
				stepElements.forEach((step) => observer.observe(step));
				console.log(`✅ Observer configurado para ${stepElements.length} steps`);
			}
		}, 200);

		return () => observer.disconnect();
	}
</script>

{#if !hasValidData}
	<div class="scrolly-fallback">
		<h3>⚠️ Flourish Scrolly - Configuração Incompleta</h3>
		<p>Verifique se 'src' e 'steps' estão definidos corretamente no Google Docs.</p>
		<details>
			<summary>Debug Info</summary>
			<pre>{JSON.stringify({ src, steps: steps?.length || 0, hasValidData }, null, 2)}</pre>
		</details>
	</div>
{:else if error}
	<div class="scrolly-error">
		<h3>❌ Erro no Flourish Scrolly</h3>
		<p>{error}</p>
		<button on:click={() => window.location.reload()}>Recarregar Página</button>
	</div>
{:else}
	<!-- 🔧 LAYOUT SIMPLIFICADO: Mais robusto que CSS Grid -->
	<div class="scrolly-container">
		<!-- Área Fixa com Flourish -->
		<div class="flourish-area">
			{#if isLoading}
				<div class="loading-state">
					<div class="loading-spinner"></div>
					<p>Carregando visualização Flourish...</p>
				</div>
			{:else}
				<div 
					class="flourish-interactive-container" 
					bind:this={flourishContainer}
				></div>
			{/if}
		</div>

		<!-- Área dos Steps -->
		<div class="scrolly-steps" bind:this={stepsContainer}>
			{#each validSteps as step, index}
				<div 
					class="scrolly-step" 
					data-slide={step.slide != null ? step.slide : index}
				>
					<div class="scrolly-step-content">
						{#if step.title}
							<h3 class="step-title">{step.title}</h3>
						{/if}
						{#if step.text}
							<div class="step-text">{@html step.text}</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	/* ===== FALLBACK & ERROR STYLES ===== */
	.scrolly-fallback,
	.scrolly-error {
		background: #fef7f0;
		border: 2px solid #f97316;
		border-radius: 12px;
		padding: 2rem;
		margin: 2rem auto;
		max-width: 600px;
		text-align: center;
	}

	.scrolly-fallback h3,
	.scrolly-error h3 {
		color: #ea580c;
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
	}

	.scrolly-fallback p,
	.scrolly-error p {
		color: #9a3412;
		margin: 0 0 1rem 0;
	}

	.scrolly-fallback details {
		text-align: left;
		margin-top: 1rem;
		background: white;
		padding: 1rem;
		border-radius: 6px;
	}

	.scrolly-error button {
		background: #ea580c;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
	}

	/* ===== LOADING STATE ===== */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-secondary);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-border);
		border-top: 3px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* ===== MAIN LAYOUT (SIMPLIFICADO) ===== */
	.scrolly-container {
		position: relative;
		width: 100%;
		margin: 2rem 0;
	}

	/* Área do Flourish - Sticky */
	.flourish-area {
		position: sticky;
		top: 0;
		width: 100%;
		height: 100vh;
		background: var(--color-highlight-bg);
		z-index: 1;
		overflow: hidden;
	}

	.flourish-interactive-container {
		width: 100%;
		height: 100%;
		background: var(--color-background);
	}

	/* Área dos Steps - Sobreposta */
	.scrolly-steps {
		position: relative;
		z-index: 2;
		pointer-events: none; /* Permite cliques no Flourish por baixo */
	}

	.scrolly-step {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 0 5vw;
	}

	.scrolly-step-content {
		background: rgba(var(--color-background-rgb, 255, 255, 255), 0.95);
		backdrop-filter: blur(10px);
		color: var(--color-text);
		padding: 2rem;
		border-radius: 12px;
		max-width: 450px;
		width: 100%;
		pointer-events: all; /* Permite interação com o texto */
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
		border: 1px solid var(--color-border);
	}

	.step-title {
		font-size: var(--font-size-100);
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: var(--color-primary);
		line-height: 1.2;
	}

	.step-text {
		font-size: var(--font-size-70);
		line-height: 1.6;
		margin: 0;
		color: var(--color-text);
	}

	/* Formatação do HTML dentro do step */
	.step-text :global(strong) {
		color: var(--color-primary);
		font-weight: 700;
	}

	.step-text :global(em) {
		color: var(--color-secondary);
		font-style: italic;
	}

	/* ===== RESPONSIVE ===== */
	@media (max-width: 768px) {
		.scrolly-step {
			justify-content: center;
			align-items: flex-end;
			padding: 1rem;
		}

		.scrolly-step-content {
			margin-bottom: 15vh;
			width: calc(100% - 2rem);
			max-width: 90%;
			padding: 1.5rem;
		}

		.step-title {
			font-size: var(--font-size-90);
		}

		.step-text {
			font-size: var(--font-size-60);
		}
	}

	/* ===== ANIMAÇÕES ===== */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.scrolly-step-content {
		animation: fadeInUp 0.6s ease-out;
	}

	/* Hover effect */
	.scrolly-step-content:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
	}

	/* ===== ACESSIBILIDADE ===== */
	@media (prefers-reduced-motion: reduce) {
		.scrolly-step-content {
			animation: none;
		}
		
		.scrolly-step-content:hover {
			transform: none;
		}
		
		.loading-spinner {
			animation: none;
		}
	}
</style>