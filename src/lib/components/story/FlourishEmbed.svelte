<script>
	import { onMount } from 'svelte';
	import { loadFlourishScript } from '$lib/utils/flourish.js';

	export let src = '';

	onMount(async () => {
		try {
			// Agora ele espera de forma segura pelo script antes de fazer qualquer coisa.
			await loadFlourishScript();
		} catch (error) {
			console.error(error);
		}
	});
</script>

{#if src}
	<div class="flourish-embed-container">
		<div class="flourish-embed" data-src={src} data-height="600px">
			<a href={`https://public.flourish.studio/${src}`} target="_blank"
				>Ver esta visualização de dados no Flourish</a
			>
		</div>
	</div>
{:else}
	<div class="flourish-fallback">
		<p>⚠️ Componente Flourish: A propriedade 'src' não foi definida no Google Docs.</p>
	</div>
{/if}

<style>
	.flourish-embed-container {
		width: 100%;
		max-width: 800px;
		margin: 2rem auto;
		min-height: 400px;
		background-color: var(--color-highlight-bg);
		border-radius: 8px;
	}
	.flourish-embed :global(a) {
		position: absolute;
		left: -10000px;
		top: auto;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}
	.flourish-fallback {
		padding: 2rem;
		margin: 2rem;
		border: 2px dashed var(--color-border);
		background: var(--color-highlight-bg);
		border-radius: 8px;
		text-align: center;
	}
</style>