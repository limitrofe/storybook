<script>
	import Scroller from './shared/Scroller.svelte';
	import FlourishScrollyEmbed from './shared/FlourishScrollyEmbed.svelte';
	import AdvancedStep from './shared/AdvancedStep.svelte'; // Usando o novo Step

	export let src = '';
	export let steps = [];

	let currentStepIndex = 0;
	let offset = 0; // <- AQUI ESTÁ A MÁGICA!

	// Estilos reativos para o container do background
	$: backgroundStyle = `
		transition: transform 0.4s, opacity 0.4s;
		transform: scale(${1 + offset * 0.1});
		opacity: ${0.7 + offset * 0.3};
	`;

	$: stepContent = steps.map(step => {
		let content = '';
		if (step.title) content += `<h3>${step.title}</h3>`;
		if (step.text) content += `<div>${step.text}</div>`;
		return content;
	});

	$: flourishSlideIndex = steps[currentStepIndex]?.slide !== undefined ? steps[currentStepIndex].slide : 0;
</script>

<div class="scrolly-wrapper">
	<Scroller top={0.2} bottom={0.8} threshold={0.5} bind:index={currentStepIndex} bind:offset>
		<div slot="background" class="flourish-background-fullscreen">
			<div style={backgroundStyle}>
				<FlourishScrollyEmbed {src} index={flourishSlideIndex} />
			</div>
		</div>

		<div slot="foreground" class="steps-foreground">
			<section class="spacer-top"></section>
			
			{#each stepContent as stepText, i}
				<AdvancedStep {stepText} active={i === currentStepIndex} {offset} />
			{/each}
		</div>
	</Scroller>
</div>

<style>
	/* ... Estilos idênticos ao FlourishScrolly.svelte ... */
	.scrolly-wrapper {
		position: relative;
	}
	.flourish-background-fullscreen {
		width: 100%;
		height: 100vh;
	}
	/* O div extra precisa preencher o container */
	.flourish-background-fullscreen > div {
		width: 100%;
		height: 100%;
	}
	.steps-foreground {
		position: relative;
		z-index: 10;
	}
	.spacer-top {
		height: 30vh;
	}
	:global(.scroller-foreground) {
		pointer-events: none !important;
	}
	:global(.scroller-foreground section) {
		pointer-events: auto;
	}
</style>