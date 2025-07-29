<script>
	import Scroller from './shared/Scroller.svelte';
	import FlourishScrollyEmbed from './shared/FlourishScrollyEmbed.svelte';
	import Step from './shared/Step.svelte';

	export let src = '';
export let steps = [];

	let length = steps.length - 1;
	let currentStepIndex = 0;
// Renomeado para maior clareza, representa o índice do card de texto ativo.
$: stepContent = steps.map(step => {
		let content = '';
		if (step.title) content += `<h3>${step.title}</h3>`;
		if (step.text) content += `<div>${step.text}</div>`;
		return content;
	});
// Calcula qual slide do Flourish deve ser exibido, baseado no step atual.
// Se a propriedade 'slide' não estiver definida para o step atual, usa 0 como padrão.
$: flourishSlideIndex = steps[currentStepIndex]?.slide !== undefined ? steps[currentStepIndex].slide : 0;
</script>

<div class="scrolly-wrapper">
	<Scroller top={0} bottom={1} threshold={0.5} bind:index={currentStepIndex}>
		<div slot="background" class="flourish-background-fullscreen">
			<FlourishScrollyEmbed {src} index={flourishSlideIndex} />
		</div>

		<div slot="foreground" class="steps-foreground">
			<section class="spacer-top"></section>
			
			{#each stepContent as stepText, i}
				<Step {stepText} {length} {i} />
			{/each}
		</div>
	</Scroller>
</div>

<style>
	.scrolly-wrapper {
		position: relative;
}

	.flourish-background-fullscreen {
		width: 100%;
		height: 100vh;
	}
	
	.steps-foreground {
		position: relative;
		z-index: 10;
}

	.spacer-top {
		/* This pushes the first step down so it aligns in the middle of the screen */
		height: 10vh;
}

	/* Allow clicking through the foreground container */
	:global(.scroller-foreground) {
		pointer-events: none !important;
}

	/* Re-enable pointer events for the steps themselves */
	:global(.scroller-foreground section) {
		pointer-events: auto;
	}
</style>