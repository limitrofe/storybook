<script>
	export let notes = '';
	export let sources = []; // Array de strings ou objetos para fontes
	export let additionalGraphics = []; // Array de strings para contribuidores de gráficos
	export let editedBy = []; // Array de strings para editores
	export let authors = []; // Array de strings para autores principais (caso não venha do storyData)
</script>

<footer class="final-credits">
	<div class="credits-section">
		{#if authors.length > 0}
			<h3>Créditos</h3>
			<ul class="credits-list">
				{#each authors as author}
					<li>{author}</li>
				{/each}
			</ul>
		{/if}

		{#if notes}
			<h3>Notas</h3>
			<p>{notes}</p>
		{/if}

		{#if sources.length > 0}
			<h3>Fontes</h3>
			<ul class="credits-list">
				{#each sources as source}
					<li>{source}</li>
				{/each}
			</ul>
		{/if}

		{#if additionalGraphics.length > 0}
			<h3>Contribuições Gráficas Adicionais</h3>
			<ul class="credits-list">
				{#each additionalGraphics as contributor}
					<li>{contributor}</li>
				{/each}
			</ul>
		{/if}

		{#if editedBy.length > 0}
			<h3>Edição</h3>
			<ul class="credits-list">
				{#each editedBy as editor}
					<li>{editor}</li>
				{/each}
			</ul>
		{/if}
	</div>
</footer>

<style>
	.final-credits {
		background-color: var(--color-highlight-bg);
		color: var(--color-text);
		padding: 4rem 2rem 8rem 2rem; /* 🔧 Padding bottom maior para webview */
		margin-top: 4rem;
		margin-bottom: 4rem; /* 🔧 Margem bottom garantida */
		border-top: 1px solid var(--color-border);
		text-align: left;

		/* 🔧 Garantir que sempre apareça */
		position: relative;
		z-index: 10;
		min-height: 200px; /* Altura mínima garantida */
	}

	.credits-section {
		max-width: 700px;
		margin: 0 auto;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 2rem;
	}

	h3 {
		font-size: var(--font-size-60);
		font-weight: 700;
		color: var(--color-text);
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		text-transform: none;
		letter-spacing: normal;
	}

	.credits-section > h3:first-child {
		margin-top: 0;
	}

	p {
		font-size: var(--font-size-60);
		line-height: 1.7;
		margin-bottom: 1rem;
		color: var(--color-secondary);
	}

	.credits-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.credits-list li {
		font-size: var(--font-size-60);
		line-height: 1.7;
		color: var(--color-text);
		margin-bottom: 0.5rem;
	}

	.credits-powered-by {
		max-width: 700px;
		margin: 0 auto;
		font-size: var(--font-size-40);
		color: var(--color-subtle-text);
	}

	/* Ajustes para Mobile e WebView */
	@media (max-width: 768px) {
		.final-credits {
			padding: 2.5rem 1rem 12rem 1rem; /* 🔧 Padding bottom ainda maior no mobile/webview */
			margin-bottom: 8rem; /* 🔧 Margem extra no mobile */
		}

		h3 {
			font-size: var(--font-size-50);
		}

		p,
		.credits-list li {
			font-size: var(--font-size-50);
		}
	}

	/* 🔧 FIX para telas baixas (webview comum) */
	@media screen and (max-height: 800px) {
		.final-credits {
			padding-bottom: 15rem; /* Espaço extra para telas baixas */
			margin-bottom: 10rem;
		}
	}

	/* 🔧 FIX específico para iOS WebView */
	@supports (-webkit-touch-callout: none) {
		.final-credits {
			padding-bottom: 18rem; /* Máximo espaço para iOS WebView */
			margin-bottom: 12rem;
		}
	}

	/* 🔧 Espaço invisível extra no final */
	.final-credits::after {
		content: '';
		display: block;
		height: 100px;
		width: 100%;
	}
</style>
