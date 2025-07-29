<script>
	import { onMount } from 'svelte';

	// Props que o componente recebe do JSON
	export let image = ''; // URL da imagem de fundo
	export let height = '80vh'; // Altura do container do parallax
	export let speed = 0.5; // Velocidade do efeito (0 a 1)
	export let overlay = true; // Se deve aplicar um overlay escuro
	export let content = ''; // Conteúdo HTML a ser exibido sobre a imagem

	let parallaxContainer; // Referência ao elemento container do parallax
	let parallaxImage; // Referência ao elemento da imagem
	let mounted = false; // Flag para aplicar animações de entrada

	// --- CORREÇÃO PRINCIPAL ESTÁ AQUI ---
	onMount(() => {
		mounted = true;

		const handleScroll = () => {
			// Se o elemento da imagem ainda não foi renderizado, não faz nada.
			if (!parallaxImage) return;
			
			// Pega as dimensões e a posição do container principal na tela.
			const rect = parallaxContainer.getBoundingClientRect();

			// O efeito só é executado quando o container está visível.
			if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
				
				// AQUI ESTÁ A LÓGICA CORRIGIDA:
				// O deslocamento vertical (offset) da imagem é calculado
				// com base na posição do topo do container (rect.top)
				// multiplicado pela velocidade. Isso cria um movimento
				// relativo e suave, em vez de um movimento absoluto
				// que empurrava a imagem para fora da tela.
				const offset = rect.top * parseFloat(speed);
				parallaxImage.style.transform = `translateY(${offset}px)`;
			}
		};

		// Adiciona o listener de scroll na janela
		window.addEventListener('scroll', handleScroll, { passive: true });

		// Remove o listener quando o componente for destruído para evitar memory leaks
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<div
	class="parallax-container"
	bind:this={parallaxContainer}
	style:height
	class:mounted
>
	<div
		class="parallax-image"
		bind:this={parallaxImage}
		style:background-image="url({image})"
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
	/* ▼▼▼ ALTERAÇÃO AQUI ▼▼▼ */
	background-color: var(--color-background); /* Usa a cor de fundo do tema atual */
}

	.parallax-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: transparent; /* Cor e opacidade do overlay */
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
</style>