<script>
	import { onMount, onDestroy } from 'svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	// --- PROPS UNIFICADAS ---
	export let videoSrc = '';
	export let videoSrcMobile = '';
	export let frameStart = 1;
	export let frameStop = 100;
	export let imagePrefix = '';
	export let imageSuffix = '.jpg';
	export let imagePrefixMobile = '';
	export let imageSuffixMobile = '.webp';
	export let frameStartSeconds = 0;
	export let frameStopSeconds = 10;
	export let steps = [];
	export let height = '300vh';
	export let fullWidth = true;
	export let showProgress = true;
	export let preloadFrames = 8;
	export let memoryLimitMB = 50;

	// --- ESTADOS INTERNOS ---
	let containerElement;
	let videoElement;
	let isReady = false;
	let scrollProgress = 0;
	let currentStepIndex = 0;
	let useImages = false;
	let useVideo = false;
	let imageFrames = [];
	let currentFrameIndex = 0;
	let targetFrameIndex = 0;
	let loadedImages = new Map();
	let failedImages = new Set();
	let memoryUsage = 0;
	let ticking = false;
	let rafId = null;

	// 🕵️‍♂️ VALORES PARA DEBUG
	let debugValues = {
		rectTop: 0,
		containerHeight: 0,
		viewportHeight: 0,
		progress: 0
	};

	// --- LÓGICA DO COMPONENTE ---

	// 1. Detecção Robusta de Dispositivo
	if (browser) {
		const ua = navigator.userAgent;
		const width = window.innerWidth;
		const isIOS = /iPad|iPhone|iPod/.test(ua);
		const isAndroid = /Android/.test(ua);
		useImages = isIOS || isAndroid || width <= 768;
		useVideo = !useImages;
	}

	// 2. Geração da Lista de Frames (Apenas para Mobile)
	if (useImages) {
		const start = Number(frameStart);
		const stop = Number(frameStop);
		currentFrameIndex = start; // Iniciar o frame atual com o frame de início
		targetFrameIndex = start;
		const prefix = imagePrefixMobile || imagePrefix;
		const suffix = imageSuffixMobile || imageSuffix;
		for (let i = start; i <= stop; i++) {
			const paddedIndex = String(i).padStart(4, '0');
			imageFrames.push({
				index: i,
				src: `${prefix}${paddedIndex}${suffix}`,
				loaded: false,
				element: null
			});
		}
	}

	// 3. Funções de Gerenciamento de Imagens
	async function preloadImage(frame) {
		if (!frame || frame.loaded || failedImages.has(frame.index)) {
			return;
		}
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.src = frame.src;
			img.onload = () => {
				frame.loaded = true;
				frame.element = img;
				const imageSize = (img.width * img.height * 4) / (1024 * 1024);
				memoryUsage += imageSize;
				loadedImages.set(frame.index, frame);
				resolve();
			};
			img.onerror = () => {
				failedImages.add(frame.index);
				console.warn(`❌ Falha ao carregar frame: ${frame.src}`);
				reject();
			};
		});
	}

	async function updateImagePreload(centerIndex) {
		const roundedCenter = Math.round(centerIndex);
		const startIndex = Math.max(Number(frameStart), roundedCenter - preloadFrames);
		const endIndex = Math.min(Number(frameStop), roundedCenter + preloadFrames);
		const promises = [];
		for (let i = startIndex; i <= endIndex; i++) {
			const frame = imageFrames.find((f) => f.index === i);
			promises.push(preloadImage(frame));
		}
		await Promise.allSettled(promises);
		if (memoryUsage > memoryLimitMB) {
			loadedImages.forEach((frame, index) => {
				if (Math.abs(index - roundedCenter) > preloadFrames * 2) {
					const imageSize = (frame.element.width * frame.element.height * 4) / (1024 * 1024);
					memoryUsage -= imageSize;
					frame.loaded = false;
					frame.element = null;
					loadedImages.delete(index);
				}
			});
		}
	}

	// 4. Animação Suave dos Frames (LÓGICA CORRIGIDA)
	function animateFrames() {
		rafId = requestAnimationFrame(animateFrames);
		
		const diff = targetFrameIndex - currentFrameIndex;
		
		// Se não há diferença, não faz nada
		if (Math.abs(diff) < 1) {
			currentFrameIndex = targetFrameIndex;
			return;
		}

		// Move uma fração da distância (ex: 10%) a cada quadro de animação.
		// Se a distância for muito grande, o passo será maior, fazendo a animação "alcançar" mais rápido.
		// O `Math.sign(diff)` garante que o passo seja na direção correta (para frente ou para trás).
		const step = Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.1);
		
		currentFrameIndex += step;

		// Arredondar para o valor final ser um inteiro
		// Isso é importante para encontrar o frame no array
		if (Math.abs(currentFrameIndex - targetFrameIndex) < 1) {
			currentFrameIndex = targetFrameIndex;
		}
		
		updateImagePreload(currentFrameIndex);
	}

	// 5. Handler de Scroll Otimizado
	function handleScroll() {
		if (!containerElement || !browser) return;

		const rect = containerElement.getBoundingClientRect();
		const containerHeight = containerElement.offsetHeight;
		const viewportHeight = window.innerHeight;

		const rawProgress = Math.max(0, -rect.top) / (containerHeight - viewportHeight);
		scrollProgress = Math.min(1, Math.max(0, rawProgress));

		if (useImages) {
			debugValues = {
				rectTop: rect.top,
				containerHeight: containerHeight,
				viewportHeight: viewportHeight,
				progress: scrollProgress
			};
		}

		if (useVideo && videoElement?.duration) {
			const videoDuration = Number(frameStopSeconds) - Number(frameStartSeconds);
			videoElement.currentTime = Number(frameStartSeconds) + scrollProgress * videoDuration;
		} else if (useImages && imageFrames.length > 0) {
			targetFrameIndex = Number(frameStart) + Math.floor(scrollProgress * (imageFrames.length - 1));
		}
		currentStepIndex = Math.min(steps.length - 1, Math.floor(scrollProgress * steps.length));
	}

	function throttledScroll() {
		if (!ticking) {
			requestAnimationFrame(() => {
				handleScroll();
				ticking = false;
			});
			ticking = true;
		}
	}

	// --- LIFECYCLE HOOKS ---
	onMount(async () => {
		if (!browser) return;
		if (useImages) {
			await updateImagePreload(currentFrameIndex);
			rafId = requestAnimationFrame(animateFrames);
		}
		isReady = true;
		window.addEventListener('scroll', throttledScroll, { passive: true });
		handleScroll();
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('scroll', throttledScroll);
			if (rafId) {
				cancelAnimationFrame(rafId);
			}
		}
	});

	// --- ESTADOS COMPUTADOS ---
	$: actualVideoSrc = videoSrcMobile || videoSrc;
	$: currentFrameData = useImages ? imageFrames.find((f) => f.index === Math.round(currentFrameIndex)) : null;
</script>

<!-- Container Principal -->
<section 
	class="video-scrollytelling mobile-first" 
	class:full-width={fullWidth}
	class:is-mobile={useImages}
	class:is-desktop={useVideo}
	style:height
	bind:this={containerElement}
>
	<div class="media-container">
		{#if useImages}
			<div class="mobile-debug-overlay">
				<p>Top: {Math.round(debugValues.rectTop)}</p>
				<p>ContH: {debugValues.containerHeight}</p>
				<p>ViewH: {debugValues.viewportHeight}</p>
				<p>Prog: {debugValues.progress.toFixed(2)}</p>
				<p>Target: {targetFrameIndex}</p>
				<p>Current: {Math.round(currentFrameIndex)}</p>
			</div>
		{/if}

		{#if useVideo && actualVideoSrc}
			<video
				bind:this={videoElement}
				src={actualVideoSrc}
				class="media-element"
				class:visible={isReady}
				muted
				playsinline
				preload="metadata"
			></video>
		{/if}
		{#if useImages}
			{#if currentFrameData?.loaded}
				<img
					src={currentFrameData.element.src}
					alt="Frame {currentFrameData.index}"
					class="media-element visible"
				/>
			{:else if imageFrames.length > 0}
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Carregando frame {Math.round(currentFrameIndex)}...</p>
				</div>
			{/if}
		{/if}
	</div>

	<div class="steps-container">
		{#each steps as step, index}
			{@const isActive = index === currentStepIndex}
			<div class="step" class:active={isActive}>
				<div class="step-content">
					<h3>{step.title}</h3>
					<p>{@html step.text}</p>
				</div>
			</div>
		{/each}
	</div>

	{#if showProgress && isReady}
		<div class="progress-bar-container" class:hidden={scrollProgress > 0.98}>
			<div class="progress-bar-fill" style:width="{scrollProgress * 100}%" />
		</div>
	{/if}
</section>

<style>
	:root {
		--step-background: rgba(0, 0, 0, 0.8);
		--step-color: #ffffff;
		--step-max-width: 450px;
		--progress-bar-color: #ffffff;
	}
	.video-scrollytelling {
		position: relative;
		background-color: #000;
	}
	.video-scrollytelling.full-width {
		width: 100vw;
		margin-left: calc(-50vw + 50%);
	}
	.media-container {
		position: sticky;
		top: 0;
		height: 100vh;
		width: 100%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.media-element {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	.media-element.visible {
		opacity: 1;
	}
	.loading-state {
		color: white;
		text-align: center;
	}
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.steps-container {
		position: relative;
		width: 90%;
		max-width: var(--step-max-width);
		margin: 0 auto;
		z-index: 10;
		margin-top: -100vh;
	}
	.step {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--step-color);
		opacity: 0.3;
		transition: opacity 0.4s ease;
	}
	.step.active {
		opacity: 1;
	}
	.step-content {
		background: var(--step-background);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	.step-content h3 {
		margin-top: 0;
		font-size: 1.5rem;
	}
	.step-content p {
		line-height: 1.6;
	}
	.progress-bar-container {
		position: fixed;
		bottom: 2rem;
		left: 2rem;
		right: 2rem;
		height: 4px;
		background-color: rgba(255, 255, 255, 0.2);
		z-index: 20;
		transition: opacity 0.5s;
	}
	.progress-bar-container.hidden {
		opacity: 0;
	}
	.progress-bar-fill {
		height: 100%;
		background-color: var(--progress-bar-color);
		width: 0;
		transition: width 0.1s linear;
	}
	.mobile-debug-overlay {
		position: absolute;
		bottom: 10px;
		left: 10px;
		background: rgba(0, 0, 0, 0.8);
		color: #00ff00;
		padding: 8px;
		font-size: 11px;
		font-family: monospace;
		z-index: 999;
		border-radius: 4px;
		pointer-events: none;
		border: 1px solid #00ff00;
	}
	.mobile-debug-overlay p {
		margin: 2px 0;
	}
	@media (max-width: 768px) {
		:root {
			--step-max-width: 100%;
		}
		.steps-container {
			width: 85%;
		}
		.step-content {
			padding: 1.5rem;
		}
		.step-content h3 {
			font-size: 1.25rem;
		}
	}
</style>