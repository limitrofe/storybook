<script>
	import { onMount } from 'svelte';

	// Props que o componente recebe do JSON
	export let image = ''; // URL da imagem de fundo desktop
	export let imageMobile = ''; // ✅ NOVO: URL da imagem de fundo mobile
	export let height = '80vh'; // Altura do container do parallax
	export let speed = 0.5; // Velocidade do efeito (0 a 1)
	export let overlay = true; // Se deve aplicar um overlay escuro
	export let content = ''; // Conteúdo HTML a ser exibido sobre a imagem

	let parallaxContainer; // Referência ao elemento container do parallax
	let parallaxImage; // Referência ao elemento da imagem
	let mounted = false; // Flag para aplicar animações de entrada

	// ✅ NOVO: Determinar qual imagem usar baseado no tamanho da tela
	$: currentImage = (() => {
		if (typeof window !== 'undefined') {
			return window.innerWidth <= 768 && imageMobile ? imageMobile : image;
		}
		return image;
	})();

	onMount(() => {
		mounted = true;

		const handleScroll = () => {
			// Se o elemento da imagem ainda não foi renderizado, não faz nada.
			if (!parallaxImage) return;
			
			// Pega as dimensões e a posição do container principal na tela.
			const rect = parallaxContainer.getBoundingClientRect();

			// O efeito só é executado quando o container está visível.
			if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
				// O deslocamento vertical (offset) da imagem é calculado
				// com base na posição do topo do container (rect.top)
				// multiplicado pela velocidade. Isso cria um movimento
				// relativo e suave, em vez de um movimento absoluto
				// que empurrava a imagem para fora da tela.
				const offset = rect.top * parseFloat(speed);
				parallaxImage.style.transform = `translateY(${offset}px)`;
			}
		};

		// ✅ NOVO: Listener para mudanças de tamanho da tela
		const handleResize = () => {
			// Forçar re-renderização quando a tela muda de tamanho
			if (parallaxImage) {
				parallaxImage.style.backgroundImage = `url(${currentImage})`;
			}
		};

		// Adiciona os listeners
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleResize, { passive: true });

		// Remove os listeners quando o componente for destruído para evitar memory leaks
		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<div
	class="parallax-container"
	bind:this={parallaxContainer}
	style:height
	class:mounted
>
	<!-- ✅ ATUALIZADO: Agora usa currentImage que é reativo -->
	<div
		class="parallax-image"
		bind:this={parallaxImage}
		style:background-image="url({currentImage})"
	/>

	{#if overlay}
		<div class="parallax-overlay" />
	{/if}

	<div class="parallax-content">
		{@html content}
	</div>
</div>

<style>
	.parallax-container {
		position: relative;
		width: 100%;
		overflow: hidden; /* Essencial para o efeito funcionar */
		display: flex;
		justify-content: center;
		align-items: center;
		opacity: 0;
		transform: translateY(20px);
		transition: opacity 0.6s ease-out, transform 0.6s ease-out;
	}

	.parallax-container.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	.parallax-image {
		position: absolute;
		top: -100%;
		left: 0;
		width: 100%;
		height: 200%;
		background-size: cover;
		background-position: center;
		will-change: transform;
		z-index: 1;
		background-color: var(--color-background); /* Usa a cor de fundo do tema atual */
		/* ✅ NOVO: Transição suave para mudança de imagem */
		transition: background-image 0.3s ease-in-out;
	}

	.parallax-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.4); /* Overlay padrão com 40% de opacidade */
		z-index: 2;
	}

	.parallax-content {
		position: relative;
		z-index: 3;
		color: white;
		text-align: center;
		padding: 2rem;
		/* Adiciona uma sombra no texto para melhorar a legibilidade */
		text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
	}

	/* Estilos padrão para o conteúdo injetado via @html, caso não venham do Docs */
	.parallax-content :global(h2) {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		font-weight: bold;
	}

	.parallax-content :global(p) {
		font-size: 1.2rem;
		max-width: 600px;
		margin: 0 auto;
	}

	/* ✅ NOVO: Ajustes específicos para mobile */
	@media (max-width: 768px) {
		.parallax-content :global(h2) {
			font-size: 1.8rem;
		}

		.parallax-content :global(p) {
			font-size: 1rem;
		}

		.parallax-content {
			padding: 1rem;
		}
	}
</style>