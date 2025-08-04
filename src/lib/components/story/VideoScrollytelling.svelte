<!-- VideoScrollytelling.svelte - VERSÃO FINAL COMPLETA -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	// 🎯 Props principais
	export let videoSrc = '';
	export let videoSrcMobile = '';
	export let steps = [];
	export let height = '300vh';
	export let fullWidth = true;
	export let showProgress = true;

	// 📱 Props MOBILE (sequência de imagens) - PRIORITÁRIO
	export let frameStart = 1;
	export let frameStop = 100;
	export let imagePrefix = '';
	export let imageSuffix = '.jpg';
	export let imagePrefixMobile = '';
	export let imageSuffixMobile = '.webp';

	// 🖥️ Props DESKTOP (vídeo) - SECUNDÁRIO
	export let frameStartSeconds = 0;
	export let frameStopSeconds = 10;

	// ⚙️ Props de performance
	export let preloadFrames = 8;
	export let memoryLimit = 30; // MB
	export let imageQuality = 'medium'; // 'low' | 'medium' | 'high'

	// Estados principais
	let containerElement;
	let videoElement;
	let currentStep = 0;
	let scrollProgress = 0;
	let isReady = false;

	// 🔍 Detecção de dispositivo GARANTIDA
	let isMobile = false;
	let isIOS = false;
	let isAndroid = false;
	let useImages = false; // Mobile sempre true
	let useVideo = false;  // Desktop apenas

	// Estados para gerenciamento de imagens
	let currentFrameIndex = 0;
	let targetFrameIndex = 0;
	let imageFrames = [];
	let loadedImages = new Map();
	let preloadQueue = new Set();
	let memoryUsage = 0;

	// Performance
	let lastScrollTime = 0;
	let ticking = false;
	let rafId = null;

	// 🚨 DETECÇÃO MOBILE ULTRA-PRECISA
	$: if (browser) {
		const ua = navigator.userAgent;
		const width = window.innerWidth;
		
		isIOS = /iPad|iPhone|iPod/.test(ua);
		isAndroid = /Android/.test(ua);
		isMobile = isIOS || isAndroid || width <= 768 || 
				  /Mobile|Tablet/.test(ua) ||
				  ('ontouchstart' in window);

		// 🎯 REGRA ABSOLUTA: MOBILE = IMAGENS, DESKTOP = VÍDEO
		useImages = isMobile;
		useVideo = !isMobile;

		console.log('📱 Detecção Mobile:', {
			isMobile,
			isIOS,
			isAndroid,
			width,
			strategy: useImages ? '🖼️ IMAGENS' : '🎬 VÍDEO',
			userAgent: ua.slice(0, 50) + '...'
		});
	}

	// 🖼️ Geração da lista de imagens para mobile - PADDING CORRETO
	$: if (useImages && imagePrefix) {
		const prefix = imagePrefixMobile || imagePrefix;
		const suffix = imageSuffixMobile || imageSuffix;
		
		imageFrames = [];
		for (let i = frameStart; i <= frameStop; i++) {
			const paddedIndex = String(i).padStart(4, '0'); // 🔧 4 dígitos: 0001, 0002, etc.
			imageFrames.push({
				index: i,
				src: `${prefix}${paddedIndex}${suffix}`,
				loaded: false,
				element: null,
				size: 0
			});
		}

		console.log(`📱 Mobile: ${imageFrames.length} imagens configuradas (${frameStart}-${frameStop})`);
		console.log(`📋 Exemplo URL: ${imageFrames[0]?.src}`);
	}

	// 🚀 CLASSE: Gerenciador de Imagens Mobile - COM FALLBACK
	class MobileImageManager {
		constructor() {
			this.loadedImages = new Map();
			this.failedImages = new Set();
			this.memoryUsed = 0;
			this.preloadDistance = preloadFrames;
			this.maxRetries = 3;
		}

		async preloadImage(frameData, index) {
			if (frameData.loaded || preloadQueue.has(index) || this.failedImages.has(index)) return;
			
			preloadQueue.add(index);

			try {
				const img = new Image();
				
				// Otimizações iOS
				if (isIOS) {
					img.loading = 'eager';
					img.decoding = 'sync';
				}

				const loadPromise = new Promise((resolve, reject) => {
					// ⏰ TIMEOUT para não travar
					const timeout = setTimeout(() => {
						reject(new Error(`Timeout loading frame ${index + 1}`));
					}, 5000);

					img.onload = () => {
						clearTimeout(timeout);
						frameData.loaded = true;
						frameData.element = img;
						frameData.size = this.estimateImageSize(img);
						
						this.loadedImages.set(index, img);
						this.memoryUsed += frameData.size;
						
						preloadQueue.delete(index);
						resolve(img);
					};
					
					img.onerror = () => {
						clearTimeout(timeout);
						console.warn(`❌ Frame ${index + 1} não encontrado: ${frameData.src}`);
						this.failedImages.add(index);
						preloadQueue.delete(index);
						reject(new Error(`404: Frame ${index + 1} not found`));
					};
				});

				img.src = frameData.src;
				await loadPromise;

				console.log(`✅ Frame ${index + 1} carregado`);
				
			} catch (error) {
				console.warn(`❌ Erro no frame ${index + 1}:`, error.message);
				this.failedImages.add(index);
			}
		}

		estimateImageSize(img) {
			return (img.width * img.height * 4) / 1024;
		}

		async preloadNearbyFrames(centerIndex) {
			const startIndex = Math.max(0, centerIndex - this.preloadDistance);
			const endIndex = Math.min(imageFrames.length - 1, centerIndex + this.preloadDistance);

			const promises = [];
			for (let i = startIndex; i <= endIndex; i++) {
				const frame = imageFrames[i];
				if (frame && !frame.loaded && !this.failedImages.has(i)) {
					promises.push(this.preloadImage(frame, i));
				}
			}

			await Promise.allSettled(promises);
		}

		cleanupDistantFrames(centerIndex) {
			const cleanupDistance = this.preloadDistance * 3;

			this.loadedImages.forEach((img, index) => {
				if (Math.abs(index - centerIndex) > cleanupDistance) {
					if (img.src) img.src = '';
					this.loadedImages.delete(index);
					
					if (imageFrames[index]) {
						this.memoryUsed -= imageFrames[index].size || 0;
						imageFrames[index].loaded = false;
						imageFrames[index].element = null;
					}
				}
			});
		}

		getCurrentFrame() {
			const frame = imageFrames[currentFrameIndex];
			
			// Se frame atual falhou, tentar frames próximos
			if (frame && this.failedImages.has(currentFrameIndex)) {
				// Tentar frame anterior ou próximo que funcionou
				for (let offset = 1; offset <= 5; offset++) {
					const prevIndex = currentFrameIndex - offset;
					const nextIndex = currentFrameIndex + offset;
					
					if (prevIndex >= 0 && imageFrames[prevIndex]?.loaded) {
						return imageFrames[prevIndex].element;
					}
					if (nextIndex < imageFrames.length && imageFrames[nextIndex]?.loaded) {
						return imageFrames[nextIndex].element;
					}
				}
			}
			
			return frame?.loaded ? frame.element : null;
		}

		// 🆕 Método para verificar se tem frames válidos
		hasValidFrames() {
			return this.loadedImages.size > 0;
		}

		// 🆕 Método para forçar fallback se muitos erros
		shouldShowFallback() {
			const totalFrames = imageFrames.length;
			const failedCount = this.failedImages.size;
			const failureRate = failedCount / totalFrames;
			
			return failureRate > 0.5; // Se +50% dos frames falharam
		}
	}

	// 🎬 CLASSE: Gerenciador de Vídeo Desktop
	class DesktopVideoManager {
		constructor(video) {
			this.video = video;
			this.targetTime = 0;
			this.isTransitioning = false;
		}

		seekToTime(time) {
			if (this.isTransitioning || Math.abs(this.video.currentTime - time) < 0.1) {
				return;
			}

			this.isTransitioning = true;
			this.targetTime = time;

			requestAnimationFrame(() => {
				this.video.currentTime = time;
				this.isTransitioning = false;
			});
		}
	}

	// Instâncias dos gerenciadores
	let imageManager = null;
	let videoManager = null;

	// 🚀 Setup inicial
	async function setupPlayback() {
		if (useImages) {
			imageManager = new MobileImageManager();
			
			// Preload inicial dos primeiros frames
			await imageManager.preloadNearbyFrames(0);
			isReady = true;
			
		} else if (useVideo && videoElement) {
			videoManager = new DesktopVideoManager(videoElement);
			
			videoElement.addEventListener('canplay', () => {
				isReady = true;
			});
		}
	}

	// 📊 Update do scroll
	function updateScrollProgress() {
		if (!containerElement || !browser) return;

		const rect = containerElement.getBoundingClientRect();
		const containerHeight = containerElement.offsetHeight;
		const viewportHeight = window.innerHeight;
		
		// Verificar se o componente está visível na tela
		const isComponentVisible = rect.top < viewportHeight && rect.bottom > 0;
		
		// Calcular progresso dentro do componente
		let rawProgress = Math.max(0, -rect.top) / (containerHeight - viewportHeight);
		scrollProgress = Math.min(1, Math.max(0, rawProgress));

		// 🎯 NOVA LÓGICA: Esconder media quando scroll termina (100%)
		const shouldShowMedia = isComponentVisible && scrollProgress < 0.95; // Esconde nos últimos 5%
		
		if (useImages) {
			const mobileContainer = containerElement.querySelector('.mobile-container');
			if (mobileContainer) {
				mobileContainer.style.opacity = shouldShowMedia ? '1' : '0';
				mobileContainer.style.pointerEvents = shouldShowMedia ? 'none' : 'none';
			}
		}
		
		if (useVideo) {
			const desktopContainer = containerElement.querySelector('.desktop-container');
			if (desktopContainer) {
				desktopContainer.style.opacity = shouldShowMedia ? '1' : '0';
				desktopContainer.style.pointerEvents = shouldShowMedia ? 'none' : 'none';
			}
		}

		// Atualizar frames/video só se media está visível
		if (shouldShowMedia) {
			if (useImages) {
				updateMobileFrames();
			} else if (useVideo) {
				updateDesktopVideo();
			}
		}

		updateSteps();
	}

	// 📱 Update para Mobile (imagens)
	async function updateMobileFrames() {
		if (!imageManager || imageFrames.length === 0) return;

		const newTargetIndex = Math.floor(scrollProgress * (imageFrames.length - 1));
		
		if (newTargetIndex !== targetFrameIndex) {
			targetFrameIndex = Math.max(0, Math.min(imageFrames.length - 1, newTargetIndex));
			
			// Transição suave
			if (Math.abs(currentFrameIndex - targetFrameIndex) <= 1) {
				currentFrameIndex = targetFrameIndex;
			} else {
				// Animação gradual para mudanças grandes
				const step = currentFrameIndex < targetFrameIndex ? 1 : -1;
				currentFrameIndex += step;
			}
			
			// Preload e cleanup assíncronos
			imageManager.preloadNearbyFrames(currentFrameIndex);
			imageManager.cleanupDistantFrames(currentFrameIndex);
		}
	}

	// 🖥️ Update para Desktop (vídeo)
	function updateDesktopVideo() {
		if (!videoManager || !videoElement.duration) return;

		const videoDurationRange = frameStopSeconds - frameStartSeconds;
		const targetTime = frameStartSeconds + (scrollProgress * videoDurationRange);
		
		videoManager.seekToTime(targetTime);
	}

	// 📍 Update dos steps
	function updateSteps() {
		const totalSteps = steps.length;
		if (totalSteps === 0) return;

		currentStep = Math.floor(scrollProgress * totalSteps);
		currentStep = Math.max(0, Math.min(totalSteps - 1, currentStep));
	}

	// 🎯 Handler de scroll otimizado
	function handleScroll() {
		if (!ticking) {
			rafId = requestAnimationFrame(() => {
				updateScrollProgress();
				ticking = false;
			});
			ticking = true;
		}
	}

	// 🔧 Lifecycle
	onMount(() => {
		if (!browser) return;

		setupPlayback();

		// Event listeners
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
			
			if (rafId) cancelAnimationFrame(rafId);
		};
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
		
		// Cleanup de imagens
		if (imageManager) {
			imageManager.loadedImages.forEach(img => {
				if (img.src) img.src = '';
			});
		}
	});

	// 🎨 Estados computados
	$: actualVideoSrc = videoSrcMobile || videoSrc;
	$: currentFrame = imageManager?.getCurrentFrame();
	$: memoryUsageMB = imageManager ? Math.round(imageManager.memoryUsed / 1024) : 0;
	$: currentStepData = steps[currentStep] || {};

	// 🐛 Debug info
	$: if (browser && currentFrameIndex !== undefined) {
		console.log('🎯 Status:', {
			device: useImages ? 'Mobile (Imagens)' : 'Desktop (Vídeo)',
			progress: Math.round(scrollProgress * 100) + '%',
			currentFrame: useImages ? `${currentFrameIndex + 1}/${imageFrames.length}` : 'N/A',
			memoryMB: memoryUsageMB,
			step: currentStep + 1
		});
	}
</script>

<!-- Container Principal -->
<section 
	class="video-scrollytelling mobile-first" 
	class:full-width={fullWidth}
	class:mobile-mode={useImages}
	class:desktop-mode={useVideo}
	style="height: {height};"
	bind:this={containerElement}
>
	<!-- 📱 MOBILE: Display de Imagens COM FALLBACK -->
	{#if useImages}
		<div class="mobile-container">
			<div class="image-display">
				{#if currentFrame}
					<img 
						src={currentFrame.src} 
						alt="Frame {currentFrameIndex + 1}"
						class="current-frame"
					/>
				{:else if imageManager?.shouldShowFallback()}
					<!-- FALLBACK: Quando muitas imagens falharam -->
					<div class="fallback-message">
						<h3>⚠️ Problema ao carregar frames</h3>
						<p>Verifique se as URLs das imagens estão corretas:</p>
						<code>{imagePrefix}0001{imageSuffix}</code>
						<p>Frames que falharam: {imageManager?.failedImages.size || 0}/{imageFrames.length}</p>
					</div>
				{:else if imageFrames[currentFrameIndex]}
					<div class="frame-loading">
						<div class="loading-spinner"></div>
						<p>Carregando frame {currentFrameIndex + 1}...</p>
						<small>Se travar aqui, verifique se as URLs das imagens existem</small>
					</div>
				{/if}
			</div>
		</div>

	<!-- 🖥️ DESKTOP: Display de Vídeo -->
	{:else if useVideo}
		<div class="desktop-container">
			<video
				bind:this={videoElement}
				src={actualVideoSrc}
				class="desktop-video"
				class:ready={isReady}
				muted
				playsinline
				preload="metadata"
			>
				Seu navegador não suporta vídeo.
			</video>
		</div>
	{/if}

	<!-- Loading State -->
	{#if !isReady}
		<div class="loading-overlay">
			<div class="loading-spinner"></div>
			<p>
				{#if useImages}
					📱 Preparando imagens para mobile...
				{:else}
					🖥️ Carregando vídeo para desktop...
				{/if}
			</p>
		</div>
	{/if}

	<!-- Steps Container -->
	<div class="steps-container">
		{#each steps as step, index}
			{@const totalSteps = steps.length}
			
			<!-- Cada step tem sua fatia do scroll total -->
			{@const stepStart = index / totalSteps}
			{@const stepEnd = (index + 1) / totalSteps}
			
			<!-- SÓ MOSTRA se está na faixa deste step -->
			{@const showStep = scrollProgress >= stepStart && scrollProgress < stepEnd}
			
			<!-- Progresso dentro da faixa do step (0 a 1) -->
			{@const localProgress = showStep ? (scrollProgress - stepStart) / (stepEnd - stepStart) : 0}
			
			<!-- Posição Y: DIRETO do bottom pro top -->
			{@const startY = browser ? window.innerHeight : 800} <!-- Bottom da tela -->
			{@const endY = -300} <!-- Fora da tela por cima -->
			{@const currentY = startY + (endY - startY) * localProgress}
			
			{#if showStep}
				<div 
					class="step active"
					style="transform: translateY({currentY}px);"
				>
					<div class="step-content">
						<div class="step-number">{index + 1}</div>
						<h3>{step.title || `Step ${index + 1}`}</h3>
						<div class="step-text">{@html step.text || ''}</div>
						
						<!-- Debug -->
						<small style="opacity: 0.5;">
							Step {index + 1} | Progress: {Math.round(localProgress * 100)}% | Y: {Math.round(currentY)}
						</small>
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Progress Bar - COM ANIMAÇÃO DE SAÍDA -->
	{#if showProgress && isReady}
		<div 
			class="progress-bar"
			class:exiting={scrollProgress >= 0.95}
			style="
				opacity: {scrollProgress >= 0.95 ? 0 : 1};
				transform: translateY({scrollProgress >= 0.95 ? '100px' : '0px'});
			"
		>
			<div class="progress-fill" style="width: {Math.min(scrollProgress, 0.95) * (100/0.95)}%"></div>
			<div class="progress-info">
				{#if useImages}
					<span>📱 Frame {currentFrameIndex + 1}/{imageFrames.length}</span>
					<span class="memory-info">{memoryUsageMB}MB</span>
				{:else}
					<span>🖥️ {Math.round(scrollProgress * 100)}%</span>
				{/if}
			</div>
		</div>
	{/if}
</section>

<style>
	/* Container Principal - DEVE PERMITIR SCROLL NORMAL */
	.video-scrollytelling {
		position: relative; /* RELATIVE para ocupar espaço normal */
		width: 100%;
		background: transparent;
		overflow: visible;
		z-index: 1;
		/* ALTURA REAL para permitir scroll */
		min-height: 100vh; /* Pelo menos uma tela */
	}

	.video-scrollytelling.full-width {
		width: 100vw;
		margin-left: calc(-50vw + 50%);
	}

	/* Mobile Container - COM TRANSIÇÃO DE SAÍDA */
	.mobile-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		background: #000;
		pointer-events: none;
		opacity: 1;
		transition: opacity 0.8s ease-out; /* Transição suave de saída */
	}

	.image-display {
		width: 100%;
		height: 100%;
		position: relative;
		background: #000;
		pointer-events: none;
	}

	.current-frame {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	/* Desktop Container - COM TRANSIÇÃO DE SAÍDA */
	.desktop-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		height: 100dvh;
		z-index: 2;
		background: #000;
		pointer-events: none;
		opacity: 1;
		transition: opacity 0.8s ease-out; /* Transição suave de saída */
	}

	.desktop-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.5s ease;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	.desktop-video.ready {
		opacity: 1;
	}

	/* Loading States - Z-INDEX ALTO */
	.loading-overlay {
		position: fixed; /* Fixed para ficar sempre visível */
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.95);
		color: white;
		z-index: 100; /* Muito alto para ficar acima de tudo */
	}

	.frame-loading {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		color: white;
		text-align: center;
		z-index: 10;
		background: rgba(0, 0, 0, 0.8);
		padding: 2rem;
		border-radius: 8px;
		max-width: 300px;
	}

	.fallback-message {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		color: white;
		text-align: center;
		z-index: 10;
		background: rgba(20, 20, 20, 0.95);
		padding: 2rem;
		border-radius: 12px;
		border: 2px solid #ff6b6b;
		max-width: 400px;
	}

	.fallback-message h3 {
		margin: 0;
		color: #ff6b6b;
	}

	.fallback-message code {
		background: rgba(255, 255, 255, 0.1);
		padding: 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		word-break: break-all;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top: 3px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	/* Steps - POSICIONAMENTO CORRETO */
	.steps-container {
		position: relative;
		z-index: 10;
		pointer-events: none;
		/* Container precisa ter altura para o scroll funcionar */
		height: 0; /* Não ocupa espaço */
	}

	.step {
		position: fixed; /* FIXED para não interferir no layout */
		top: 0; /* Posição inicial fixa */
		right: 2rem;
		max-width: 350px;
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		transition: none; /* SEM transição para evitar conflitos */
		pointer-events: auto;
		z-index: 20;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
	}

	.step.active {
		background: rgba(0, 0, 0, 0.95);
		border-color: rgba(255, 255, 255, 0.4);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
	}

	.step.in-center {
		background: rgba(0, 0, 0, 0.98);
		border-color: rgba(102, 126, 234, 0.6);
		box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
		transform-origin: center;
		scale: 1.02; /* Ligeiramente maior quando no centro */
	}

	.step-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.step-number {
		width: 32px;
		height: 32px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 0.9rem;
		color: white;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
	}

	.step h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.step-text {
		font-size: 0.9rem;
		line-height: 1.4;
		opacity: 0.9;
	}

	/* Progress Bar - COM ANIMAÇÃO DE SAÍDA */
	.progress-bar {
		position: fixed;
		bottom: 2rem;
		left: 2rem;
		right: 2rem;
		height: 4px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
		z-index: 25;
		backdrop-filter: blur(10px);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
		transition: opacity 0.8s ease-out, transform 0.8s ease-out; /* Animação suave */
	}

	.progress-bar.exiting {
		/* Estado de saída - move para baixo e desaparece */
		opacity: 0;
		transform: translateY(100px);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
		border-radius: 2px;
		transition: width 0.1s ease-out;
		box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
	}

	.progress-info {
		position: absolute;
		top: -2.5rem;
		right: 0;
		display: flex;
		gap: 1rem;
		color: white;
		font-size: 0.8rem;
		font-family: monospace;
		background: rgba(0, 0, 0, 0.8);
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
	}

	.memory-info {
		color: #4ade80;
	}

	/* Mobile Optimizations */
	@media (max-width: 768px) {
		.step {
			right: 1rem;
			left: 1rem;
			max-width: none;
			/* Remover bottom fixo - agora usa transform */
		}

		.progress-bar {
			bottom: 1rem;
			left: 1rem;
			right: 1rem;
			z-index: 25;
		}

		/* Remove backdrop-filter no mobile para performance */
		.mobile-mode .step {
			backdrop-filter: none;
			background: rgba(0, 0, 0, 0.95);
		}

		.mobile-mode .progress-bar {
			backdrop-filter: none;
			background: rgba(0, 0, 0, 0.8);
		}

		/* Container media - garantir que não interfira */
		.mobile-container {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			width: 100vw;
			height: 100vh;
			height: 100dvh;
			z-index: 2;
			pointer-events: none;
		}

		.desktop-container {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			width: 100vw;
			height: 100vh;
			height: 100dvh;
			z-index: 2;
			pointer-events: none;
		}
	}

	/* iOS Specific Optimizations */
	@supports (-webkit-touch-callout: none) {
		.current-frame {
			-webkit-backface-visibility: hidden;
			backface-visibility: hidden;
		}
	}

	/* Animations */
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Performance optimizations */
	.video-scrollytelling {
		will-change: scroll-position;
	}

	.current-frame,
	.desktop-video {
		will-change: transform;
	}

	.step {
		will-change: opacity, transform;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.current-frame,
		.desktop-video,
		.step,
		.progress-fill {
			transition: none;
		}
		
		.loading-spinner {
			animation: none;
		}
	}
</style>