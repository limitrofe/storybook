<!-- src/lib/components/EnhancedStoryRenderer.svelte -->
<script>
	import { onMount } from 'svelte';

	// Importar componentes existentes
	import StoryHeader from './StoryHeader.svelte';
	import StoryText from './StoryText.svelte';
	import SectionTitle from './story/SectionTitle.svelte';
	import PhotoWithCaption from './story/PhotoWithCaption.svelte';
	import VideoPlayer from './story/VideoPlayer.svelte';
	import GloboPlayer from './story/GloboPlayer.svelte';
	import { getSectionStyling } from './story/sectionStyle.js';

	// Importar novos componentes (com fallback)
	let ReadingProgress;
	// let SocialShare;

	export let storyData = {};
	export let enableAnalytics = true;
	// export let enableSharing = false;
	export let enableReadingProgress = true;
	export let enableThemeSwitcher = true;
	export let autoOptimize = true;

	let mounted = false;
	let progress = 0;
	let scrollY = 0;
	let innerHeight = 0;

	// Função para mapear tipos (igual ao StoryRenderer original)
	function getComponentType(paragraph) {
		const type = paragraph.type?.toLowerCase();

		switch (type) {
			case 'header':
			case 'titulo-principal':
				return 'header';
			case 'texto':
			case 'paragrafo':
				return 'text';
			case 'intertitulo':
			case 'titulo':
				return 'section-title';
			case 'frase':
			case 'citacao':
			case 'quote':
				return 'quote';
			case 'foto':
			case 'imagem':
				return 'photo';
			case 'video':
			case 'mp4':
				return 'video';
			case 'globovideo':
			case 'globo-video':
			case 'globoplayer':
			case 'globo-player':
			case 'globo':
				return 'globo-player';
			default:
				return 'text';
		}
	}

	// Calcular tempo de leitura estimado
	function calculateReadTime(story) {
		const wordsPerMinute = 200;
		let words = 0;

		if (story.title) words += story.title.split(' ').length;
		if (story.subtitle) words += story.subtitle.split(' ').length;
		if (story.intro?.text) words += story.intro.text.split(' ').length;

		story.paragraphs?.forEach((p) => {
			if (p.text) {
				const cleanText = p.text.replace(/<[^>]*>/g, '');
				words += cleanText.split(' ').length;
			}
		});

		return Math.ceil(words / wordsPerMinute);
	}

	// Calcular progresso de leitura
	function updateProgress() {
		if (innerHeight === 0) return;
		const documentHeight = document.documentElement.scrollHeight - innerHeight;
		if (documentHeight > 0) {
			progress = Math.min(100, (scrollY / documentHeight) * 100);
		}
	}

	// Analytics simplificado
	function trackEvent(eventName, data = {}) {
		if (enableAnalytics) {
			console.log(`📊 Analytics: ${eventName}`, data);

			// Integração com Google Analytics se disponível
			if (typeof gtag !== 'undefined') {
				gtag('event', eventName, data);
			}
		}
	}

	// Função de compartilhamento simplificada
	async function shareStory() {
		const shareData = {
			title: storyData.title,
			text: storyData.subtitle || storyData.intro?.text,
			url: window.location.href
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
				trackEvent('story_shared', { method: 'native' });
			} catch (err) {
				console.log('Compartilhamento cancelado');
			}
		} else {
			// Fallback para copiar link
			try {
				await navigator.clipboard.writeText(window.location.href);
				alert('Link copiado para a área de transferência!');
				trackEvent('story_shared', { method: 'clipboard' });
			} catch (err) {
				console.error('Erro ao copiar link:', err);
			}
		}
	}

	onMount(async () => {
		mounted = true;

		// Track story start
		trackEvent('story_start', {
			title: storyData.title,
			readTime: calculateReadTime(storyData)
		});

		// Tentar carregar componentes avançados
		try {
			const readingProgressModule = await import('./ReadingProgress.svelte');
			ReadingProgress = readingProgressModule.default;
		} catch (err) {
			console.log('ReadingProgress não disponível:', err.message);
		}

		// try {
		//   const socialShareModule = await import('./SocialShare.svelte');
		//   SocialShare = socialShareModule.default;
		// } catch (err) {
		//   console.log('SocialShare não disponível:', err.message);
		// }
	});

	// Reativo
	$: if (mounted) updateProgress();
</script>

<svelte:window bind:scrollY bind:innerHeight />

<svelte:head>
	<title>{storyData.title || 'Sistema de Jornalismo'}</title>
	{#if storyData.subtitle}
		<meta name="description" content={storyData.subtitle} />
	{/if}

	<!-- Open Graph -->
	<meta property="og:title" content={storyData.title || 'Sistema de Jornalismo'} />
	{#if storyData.subtitle}
		<meta property="og:description" content={storyData.subtitle} />
	{/if}
	<meta property="og:type" content="article" />
</svelte:head>

<!-- Barra de progresso simples -->
{#if enableReadingProgress && progress > 5}
	<div class="reading-progress-bar">
		<div class="progress-fill" style="width: {progress}%"></div>
		<div class="progress-info">
			<span>{Math.round(progress)}% lida</span>
			<span>{calculateReadTime(storyData)} min</span>
		</div>
	</div>
{/if}

<!-- Botão de compartilhamento flutuante -->
<!-- {#if enableSharing}
  <button class="share-button" on:click={shareStory} title="Compartilhar história">
    📤 Compartilhar
  </button>
{/if} -->

<!-- Conteúdo principal -->
<main class="enhanced-story" data-theme={storyData.theme}>
	<!-- Informações da story -->
	{#if mounted}
		<div class="story-meta">
			<div class="meta-info">
				<span class="reading-time">📖 {calculateReadTime(storyData)} min de leitura</span>
				{#if storyData.author}
					<span class="author">✍️ {storyData.author}</span>
				{/if}
				{#if storyData.theme}
					<span class="theme">🎨 {storyData.theme}</span>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Header se tiver title -->
	{#if storyData.title}
		<StoryHeader
			title={storyData.title}
			subtitle={storyData.subtitle}
			author={storyData.author}
			date={storyData.date}
		/>
	{/if}

	<!-- Intro se existir -->
	{#if storyData.intro && storyData.intro.text}
		<StoryText content={storyData.intro.text} variant="lead" maxWidth="800px" />
	{/if}

	<!-- Renderização dos parágrafos -->
	{#if storyData.paragraphs}
	{#if storyData.paragraphs}
		{#each storyData.paragraphs as paragraph, index}
			{@const componentType = getComponentType(paragraph)}
			{@const sectionStyling = getSectionStyling(paragraph)}

			<section
				class={sectionStyling.className}
				style={sectionStyling.style}
				data-component-type={componentType}
				data-index={index}
			>
				<div class="story-section__inner">
					<div class="story-component">
				{#if componentType === 'text'}
					<StoryText
						content={paragraph.text}
						variant={paragraph.variant || 'body'}
						maxWidth="700px"
					/>
				{:else if componentType === 'quote'}
					<StoryText
						content={paragraph.text}
						variant="quote"
						author={paragraph.author}
						role={paragraph.role}
					/>
				{:else if componentType === 'section-title'}
					<SectionTitle
						title={paragraph.text}
						subtitle={paragraph.subtitle}
						backgroundImage={paragraph.backgroundImage}
						backgroundImageMobile={paragraph.backgroundImageMobile}
						variant={paragraph.variant || 'default'}
						size={paragraph.size || 'medium'}
						height={paragraph.height}
						textPosition={paragraph.textPosition || 'center'}
						textAlign={paragraph.textAlign || 'center'}
						overlay={paragraph.overlay !== 'false'}
					/>
				{:else if componentType === 'photo'}
					<PhotoWithCaption
						src={paragraph.src || paragraph.url || paragraph.image}
						alt={paragraph.alt || paragraph.text}
						caption={paragraph.caption || paragraph.legenda}
						credit={paragraph.credit || paragraph.credito}
						fullWidth={paragraph.fullWidth === 'true'}
					/>
				{:else if componentType === 'video'}
					<VideoPlayer
						src={paragraph.src || paragraph.url}
						poster={paragraph.poster}
						caption={paragraph.caption}
						credit={paragraph.credit}
						fullWidth={paragraph.fullWidth === 'true'}
						autoplay={paragraph.autoplay === 'true'}
						controls={paragraph.controls !== 'false'}
					/>
					{:else if componentType === 'globo-player'}
						<GloboPlayer
							videosIDs={paragraph.videoId || paragraph.videosIDs || paragraph.id}
							width={paragraph.width || '100%'}
							height={parseInt(paragraph.height) || 450}
							autoPlay={paragraph.autoplay === 'true'}
							startMuted={paragraph.startMuted !== 'false'}
						/>
					{/if}
					</div>
				</div>
			</section>
		{/each}
	{/if}

	<!-- Footer -->
	<footer class="story-footer">
		<div class="footer-content">
			{#if storyData.author}
				<p class="author-credit">Por <strong>{storyData.author}</strong></p>
			{/if}
			{#if storyData.date}
				<p class="publish-date">
					Publicado em {new Date(storyData.date).toLocaleDateString('pt-BR')}
				</p>
			{/if}
		</div>

		<!-- {#if enableSharing}
      <div class="footer-share">
        <button on:click={shareStory} class="share-btn">
          📤 Compartilhar esta história
        </button>
      </div>
    {/if} -->
	</footer>
</main>

<!-- Debug info (apenas em dev) -->
{#if import.meta.env.DEV}
	<div class="debug-info">
		<details>
			<summary>🔧 Debug Info</summary>
			<p>Progresso: {Math.round(progress)}%</p>
			<p>Scroll: {scrollY}px</p>
			<p>Componentes: {storyData.paragraphs?.length || 0}</p>
			<p>Tempo estimado: {calculateReadTime(storyData)} min</p>
		</details>
	</div>
{/if}

<style>
	.enhanced-story {
		background: var(--color-background);
		color: var(--color-text);
		min-height: 100vh;
	}

	/* Reading Progress Bar */
	.reading-progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: var(--color-border);
		z-index: 1000;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-primary), #ff8a65);
		transition: width 0.2s ease;
	}

	.progress-info {
		position: absolute;
		top: 4px;
		right: 1rem;
		background: var(--color-background);
		padding: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 0 0 8px 8px;
		font-size: var(--font-size-40);
		display: flex;
		gap: 1rem;
		color: var(--color-secondary);
	}

	/* Share Button */
	.share-button {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 1rem;
		border-radius: 50px;
		cursor: pointer;
		font-size: var(--font-size-50);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
		z-index: 999;
	}

	.share-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
	}

	/* Story Meta */
	.story-meta {
		max-width: 800px;
		margin: 1rem auto;
		padding: 0 2rem;
	}

	.meta-info {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 1rem;
		background: var(--color-highlight-bg);
		border-radius: 8px;
		font-size: var(--font-size-50);
		color: var(--color-secondary);
	}

	/* Story Components */
	.story-section {
		position: relative;
		width: 100%;
	}

	.story-section__inner {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding-top: var(--story-section-padding-top, 0);
		padding-bottom: var(--story-section-padding-bottom, 0);
		gap: var(--story-section-gap, 0);
	}

	.story-section--with-text-color .story-component,
	.story-section--with-text-color .story-component :global(*) {
		color: inherit;
	}

	.story-component {
		margin: 1rem 0;
	}

	/* Footer */
	.story-footer {
		max-width: 800px;
		margin: 3rem auto;
		padding: 2rem;
		border-top: 2px solid var(--color-border);
		text-align: center;
	}

	.footer-content {
		margin-bottom: 2rem;
	}

	.author-credit {
		font-size: var(--font-size-60);
		margin: 0 0 0.5rem 0;
	}

	.publish-date {
		font-size: var(--font-size-50);
		color: var(--color-secondary);
		margin: 0;
	}

	.share-btn {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 25px;
		cursor: pointer;
		font-size: var(--font-size-60);
		transition: all 0.3s ease;
	}

	.share-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	/* Debug Info */
	.debug-info {
		position: fixed;
		bottom: 1rem;
		left: 1rem;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 1rem;
		border-radius: 8px;
		font-size: 12px;
		font-family: monospace;
		z-index: 1000;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.progress-info {
			display: none;
		}

		.share-button {
			bottom: 1rem;
			right: 1rem;
			padding: 0.75rem;
			font-size: var(--font-size-45);
		}

		.story-meta {
			padding: 0 1rem;
		}

		.meta-info {
			flex-direction: column;
			gap: 0.5rem;
		}

		.story-footer {
			padding: 1rem;
		}
	}
</style>
