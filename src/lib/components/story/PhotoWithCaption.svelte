<script>
	export let src = '';
	export let srcMobile = '';
	export let alt = '';
	export let caption = '';
	export let credit = '';
	export let fullWidth = false;
	export let link = ''; // Nova prop para o link
	export let target = '_self'; // Nova prop para o target do link
</script>

<figure class="photo-with-caption" class:full-width={fullWidth}>
	<div class="photo-with-caption__image">
		{#if link}
			<a href={link} {target} class="photo-link">
				{#if srcMobile}
					<!-- Versão responsiva com picture -->
					<picture>
						<source media="(max-width: 768px)" srcset={srcMobile} />
						<source media="(min-width: 769px)" srcset={src} />
						<img {src} {alt} loading="lazy" />
					</picture>
				{:else}
					<!-- Versão simples -->
					<img {src} {alt} loading="lazy" />
				{/if}
			</a>
		{:else if srcMobile}
			<!-- Versão responsiva sem link -->
			<picture>
				<source media="(max-width: 768px)" srcset={srcMobile} />
				<source media="(min-width: 769px)" srcset={src} />
				<img {src} {alt} loading="lazy" />
			</picture>
		{:else}
			<!-- Versão simples sem link -->
			<img {src} {alt} loading="lazy" />
		{/if}
	</div>
	{#if caption || credit}
		<figcaption class="photo-with-caption__caption">
			{#if caption}<p class="photo-with-caption__text">{@html caption}</p>{/if}
			{#if credit}<small class="photo-with-caption__credit">{@html credit}</small>{/if}
		</figcaption>
	{/if}
</figure>

<style>
	.photo-with-caption {
		margin: 2rem auto;
		max-width: 800px;
	}

	.photo-with-caption.full-width {
		max-width: 100%;
		margin-left: 0;
		margin-right: 0;
	}

	.photo-with-caption__image {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
	}

	.photo-with-caption img {
		width: 100%;
		height: auto;
		display: block;
	}

	/* Estilos para o link */
	.photo-link {
		display: block;
		transition:
			transform 0.2s ease,
			opacity 0.2s ease;
	}

	.photo-link:hover {
		transform: scale(1.02);
		opacity: 0.95;
	}

	.photo-link:focus {
		outline: 2px solid var(--color-primary, #007bff);
		outline-offset: 2px;
	}

	.photo-with-caption__caption {
		padding: 1rem 0.5rem;
		text-align: center;
	}

	.photo-with-caption__text {
		font-size: var(--font-size-50);
		line-height: 1.4;
		color: var(--color-secondary);
		margin: 0 0 0.5rem 0;
		font-style: italic;
	}

	.photo-with-caption__credit {
		font-size: var(--font-size-40);
		color: var(--color-subtle-text);
		font-weight: 500;
	}
</style>
