<!-- src/lib/components/story/Carousel.svelte -->
<script>
	import { onMount } from 'svelte';

	export let items = [];
	export let autoplay = false;
	export let interval = 5000;
	export let showDots = true;
	export let showArrows = true;
	export let audioButtonBackground = 'rgba(0, 0, 0, 0.7)';
	export let audioButtonHoverBackground = 'rgba(0, 0, 0, 0.85)';
	export let audioButtonTextColor = '#fff';

	let currentIndex = 0;
	let carouselElement;
	let autoplayInterval;
	const videoElements = new Map();
	let audioEnabledStates = [];

	$: {
		const currentStates = audioEnabledStates;
		const nextStates = items.map((_, index) => currentStates[index] ?? false);
		const hasChanged =
			nextStates.length !== currentStates.length ||
			nextStates.some((state, index) => state !== currentStates[index]);

		if (hasChanged) {
			audioEnabledStates = nextStates;
		}
	}

	onMount(() => {
		if (autoplay) {
			startAutoplay();
		}

		return () => {
			if (autoplayInterval) {
				clearInterval(autoplayInterval);
			}

			pauseAllVideos();
			videoElements.clear();
			audioEnabledStates = [];
		};
	});

	function startAutoplay() {
		autoplayInterval = setInterval(() => {
			next();
		}, interval);
	}

	function stopAutoplay() {
		if (autoplayInterval) {
			clearInterval(autoplayInterval);
			autoplayInterval = null;
		}
	}

	function next() {
		currentIndex = (currentIndex + 1) % items.length;
	}

	function prev() {
		currentIndex = (currentIndex - 1 + items.length) % items.length;
	}

	function goTo(index) {
		currentIndex = index;
	}

	function updateAudioState(index, enabled) {
		const nextStates = [...audioEnabledStates];
		nextStates[index] = enabled;
		audioEnabledStates = nextStates;
	}

	function registerVideo(node, params) {
		if (!params) return;

		let { index } = params;
		videoElements.set(index, node);
		updateAudioState(index, false);

		return {
			update(newParams) {
				if (!newParams) return;
				const { index: newIndex } = newParams;
				if (newIndex === index) return;
				const wasEnabled = audioEnabledStates[index] ?? false;
				videoElements.delete(index);
				index = newIndex;
				videoElements.set(index, node);
				updateAudioState(index, wasEnabled);
			},
			destroy() {
				node.pause?.();
				node.currentTime = 0;
				videoElements.delete(index);
				updateAudioState(index, false);
			}
		};
	}

	function pauseAllVideos() {
		videoElements.forEach((video) => {
			if (!video) return;
			video.pause();
			video.currentTime = 0;
		});
	}

	function pauseInactiveVideos(activeSlide) {
		videoElements.forEach((video, index) => {
			if (index !== activeSlide && video) {
				video.pause();
				video.currentTime = 0;
				video.muted = true;
				video.autoplay = false;
				video.removeAttribute('autoplay');
				video.setAttribute('muted', '');
				updateAudioState(index, false);
			}
		});
	}

	function playActiveVideo(activeSlide) {
		const video = videoElements.get(activeSlide);
		if (!video) return;

		video.muted = true;
		video.autoplay = true;
		video.setAttribute('muted', '');
		video.setAttribute('autoplay', '');
		video.currentTime = 0;
		video.play?.().catch(() => {
			// Ignora erros de autoplay (ex.: bloqueio do navegador)
		});
		updateAudioState(activeSlide, false);
	}

	function toggleAudio(index) {
		const video = videoElements.get(index);
		if (!video) return;

		if (audioEnabledStates[index]) return;

		video.muted = false;
		video.removeAttribute('muted');
		video.volume = 1;
		video.play?.().catch(() => {});
		updateAudioState(index, true);
	}

$: audioButtonStyle = [
	audioButtonBackground ? `--carousel-audio-button-bg:${audioButtonBackground}` : '',
	audioButtonHoverBackground ? `--carousel-audio-button-bg-hover:${audioButtonHoverBackground}` : '',
	audioButtonTextColor ? `--carousel-audio-button-color:${audioButtonTextColor}` : ''
]
	.filter(Boolean)
	.join(';');

$: {
	pauseInactiveVideos(currentIndex);
	playActiveVideo(currentIndex);
}
</script>

<div
	class="carousel"
	role="region"
	aria-roledescription="carousel"
	aria-label="Galeria de slides"
	bind:this={carouselElement}
	on:mouseenter={stopAutoplay}
	on:mouseleave={() => autoplay && startAutoplay()}
>
	<div class="carousel-track" style="transform: translateX(-{currentIndex * 100}%)">
		{#each items as item, index}
			<div class="carousel-slide">
				{#if item.type === 'image'}
					<picture>
						{#if item.srcMobile}
							<source srcset={item.srcMobile} media="(max-width: 768px)" />
						{/if}
						<img src={item.src} alt={item.alt || ''} loading="lazy" />
					</picture>
			{:else if item.type === 'video'}
				<div class="carousel-video-wrapper">
					<video controls playsinline use:registerVideo={{ index }}>
						{#if item.srcMobile}
							<source src={item.srcMobile} type="video/mp4" media="(max-width: 768px)" />
						{/if}
						{#if item.src}
							<source src={item.src} type="video/mp4" />
						{/if}
					</video>
					{#if !(audioEnabledStates[index] ?? false)}
						<button
							type="button"
							class="carousel-audio-button"
							on:click={() => toggleAudio(index)}
							aria-label="Ativar áudio do vídeo"
							style={audioButtonStyle}
						>
							Ativar áudio
						</button>
					{/if}
				</div>
			{:else if item.type === 'content'}
					<div class="carousel-content">
						{@html item.content}
					</div>
				{/if}

				{#if item.caption}
					<div class="carousel-caption">
						<p>{item.caption}</p>
						{#if item.credit}
							<small>{item.credit}</small>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	{#if showArrows && items.length > 1}
		<button class="carousel-arrow carousel-prev" on:click={prev}>‹</button>
		<button class="carousel-arrow carousel-next" on:click={next}>›</button>
	{/if}

	{#if showDots && items.length > 1}
		<div class="carousel-dots">
			{#each items as _, index}
				<button
					class="carousel-dot"
					class:active={currentIndex === index}
					on:click={() => goTo(index)}
					aria-label={`Ir para slide ${index + 1}`}
				></button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.carousel {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: 12px;
		background: var(--color-background);
	}

	.carousel-track {
		display: flex;
		transition: transform 0.5s ease;
		will-change: transform;
	}

	.carousel-slide {
		min-width: 100%;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.carousel-slide img,
	.carousel-slide video {
		width: 100%;
		height: auto;
		display: block;
	}

	.carousel-video-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.carousel-audio-button {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--carousel-audio-button-bg, rgba(0, 0, 0, 0.7));
		color: var(--carousel-audio-button-color, #fff);
		border: none;
		border-radius: 999px;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background 0.2s ease;
		z-index: 2;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.carousel-audio-button:hover,
	.carousel-audio-button:focus-visible {
		background: var(
			--carousel-audio-button-bg-hover,
			var(--carousel-audio-button-bg, rgba(0, 0, 0, 0.85))
		);
		outline: none;
	}

	.carousel-audio-button:focus-visible {
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.35);
	}

	.carousel-content {
		padding: 2rem;
		text-align: center;
		min-height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.carousel-caption {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		color: white;
		padding: 2rem 1rem 1rem;
	}

	.carousel-caption p {
		margin: 0 0 0.5rem 0;
		font-size: var(--font-size-50);
	}

	.carousel-caption small {
		opacity: 0.8;
		font-size: var(--font-size-40);
	}

	.carousel-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		font-size: 1.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
		z-index: 10;
	}

	.carousel-arrow:hover {
		background: white;
		transform: translateY(-50%) scale(1.1);
	}

	.carousel-prev {
		left: 1rem;
	}

	.carousel-next {
		right: 1rem;
	}

	.carousel-dots {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
		z-index: 10;
	}

	.carousel-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.carousel-dot.active {
		background: white;
		transform: scale(1.2);
	}

	@media (max-width: 768px) {
		.carousel-arrow {
			width: 40px;
			height: 40px;
			font-size: 1.2rem;
		}

		.carousel-prev {
			left: 0.5rem;
		}

		.carousel-next {
			right: 0.5rem;
		}
	}
</style>
