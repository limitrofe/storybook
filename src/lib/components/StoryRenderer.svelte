<!-- StoryRenderer.svelte - COMPLETO com ScrollyFrames -->
<script>
	// Importação dos componentes da história
	import Header from './story/Header.svelte';
	import StoryText from './story/StoryText.svelte';
	import SectionTitle from './story/SectionTitle.svelte';
	import SectionWrapper from './story/SectionWrapper.svelte';
	import PhotoWithCaption from './story/PhotoWithCaption.svelte';
	import VideoPlayer from './story/VideoPlayer.svelte';
	import GloboPlayer from './story/GloboPlayer.svelte';
	import PhotoGallery from './story/PhotoGallery.svelte';
	import Carousel from './story/Carousel.svelte';
	import Parallax from './story/Parallax.svelte';
	import BeforeAfter from './story/BeforeAfter.svelte';
	import ScrollyTelling from './story/ScrollyTelling.svelte';
	// ✅ MUDANÇA: ScrollyFrames ao invés de VideoScrollytelling
	import ScrollyFrames from './story/ScrollyFrames.svelte';
	import FlourishEmbed from './story/FlourishEmbed.svelte';
	import FlourishScrolly from './story/FlourishScrolly.svelte';
	import FinalCredits from './FinalCredits.svelte';
	import AnchorPoint from './story/AnchorPoint.svelte';

	export let storyData = {};

	/**
	 * Mapeia os tipos de parágrafo para os nomes dos componentes.
	 */
	function getComponentType(paragraph) {
		const type = paragraph.type?.toLowerCase();
		
		switch (type) {
			case 'abre':
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
			case 'galeria':
			case 'gallery':
				return 'gallery';
			case 'carrossel':
			case 'carousel':
				return 'carousel';
			case 'parallax':
				return 'parallax';
			case 'antes-depois':
			case 'before-after':
				return 'before-after';
			case 'scrollytelling':
			case 'scrolly':
				return 'scrolly';
			// ✅ MUDANÇA: scrollyframes mapeado para scrollyframes
			case 'scrollyframes':
				return 'scrollyframes';
			case 'flourish':
			case 'flourish-embed':
				return 'flourish';
			case 'flourish-scrolly':
			case 'flourish-scrollytelling':
				return 'flourish-scrolly';
			case 'ancora':
			case 'anchor':
				return 'anchor';
			default:
				return 'text';
		}
	}

	/**
	 * Converte string para boolean de forma segura
	 */
	function stringToBoolean(value, defaultValue = false) {
		if (typeof value === 'boolean') return value;
		if (typeof value === 'string') {
			return value.toLowerCase() === 'true';
		}
		return defaultValue;
	}

	/**
	 * Obter props do componente de forma segura
	 */
	function getComponentProps(paragraph) {
		const { type, ...props } = paragraph;
		return props;
	}
</script>

<article class="story-content">
	<!-- Renderizar intro se existir -->
	{#if storyData.intro}
		<div class="section-content">
			<StoryText content={storyData.intro.text} variant="lead" />
		</div>
	{/if}

	<!-- Renderizar parágrafos -->
	{#if storyData.paragraphs}
		{#each storyData.paragraphs as paragraph}
			{@const componentType = getComponentType(paragraph)}
			{@const props = getComponentProps(paragraph)}

			<!-- Header -->
			{#if componentType === 'header'}
				<Header
					title={props.title}
					subtitle={props.subtitle}
					author={props.author}
					date={props.date}
					backgroundImage={props.backgroundImage}
					backgroundImageMobile={props.backgroundImageMobile}
					backgroundVideo={props.backgroundVideo}
					backgroundVideoMobile={props.backgroundVideoMobile}
					variant={props.variant || 'default'}
					overlay={stringToBoolean(props.overlay, true)}
				/>

			<!-- Text -->
			{:else if componentType === 'text'}
				<div class="section-content">
					<StoryText 
						content={props.text} 
						variant={props.variant || 'body'} 
						align={props.align}
						size={props.size}
						color={props.color}
					/>
				</div>

			<!-- Quote -->
			{:else if componentType === 'quote'}
				<div class="section-content">
					<StoryText 
						content={props.text} 
						variant="quote" 
						author={props.author} 
						role={props.role} 
					/>
				</div>

			<!-- Section Title -->
			{:else if componentType === 'section-title'}
				<SectionTitle
					title={props.text}
					backgroundImage={props.backgroundImage}
					backgroundImageMobile={props.backgroundImageMobile}
					backgroundPosition={props.backgroundPosition || 'center'}
					backgroundPositionMobile={props.backgroundPositionMobile || 'center'}
					backgroundVideo={props.backgroundVideo}
					backgroundVideoMobile={props.backgroundVideoMobile}
					variant={props.variant || 'default'}
					size={props.size || 'medium'}
					height={props.height}
					heightMobile={props.heightMobile}
					textPosition={props.textPosition || 'center'}
					textPositionMobile={props.textPositionMobile}
					textAlign={props.textAlign || 'center'}
					textAlignMobile={props.textAlignMobile}
					overlay={stringToBoolean(props.overlay, false)}
				/>

			<!-- Photo -->
			{:else if componentType === 'photo'}
				<PhotoWithCaption
					src={props.src}
					alt={props.alt || ''}
					caption={props.caption || ''}
					credit={props.credit || ''}
					fullWidth={stringToBoolean(props.fullWidth, false)}
					alignment={props.alignment || 'center'}
				/>

			<!-- Video -->
			{:else if componentType === 'video'}
				<VideoPlayer
					src={props.src}
					caption={props.caption}
					credit={props.credit}
					fullWidth={stringToBoolean(props.fullWidth, false)}
					autoplay={stringToBoolean(props.autoplay, false)}
					controls={stringToBoolean(props.controls, true)}
					loop={stringToBoolean(props.loop, false)}
					showCaption={stringToBoolean(props.showCaption, true)}
				/>

			<!-- Globo Player -->
			{:else if componentType === 'globo-player'}
				<GloboPlayer
					videoId={props.videoId}
					videosIDs={props.videosIDs}
					caption={props.caption}
					credit={props.credit}
					fullWidth={stringToBoolean(props.fullWidth, false)}
					autoplay={stringToBoolean(props.autoplay, false)}
					startMuted={stringToBoolean(props.startMuted, true)}
					skipDFP={stringToBoolean(props.skipDFP, false)}
					chromeless={stringToBoolean(props.chromeless, false)}
					showCaption={stringToBoolean(props.showCaption, true)}
				/>

			<!-- Gallery -->
			{:else if componentType === 'gallery'}
				<PhotoGallery
					images={props.images || []}
					layout={props.layout || 'grid'}
					columns={parseInt(props.columns) || 3}
					lightbox={stringToBoolean(props.lightbox, true)}
				/>

			<!-- Carousel -->
			{:else if componentType === 'carousel'}
				<Carousel
					items={props.items || []}
					autoplay={stringToBoolean(props.autoplay, false)}
					interval={parseInt(props.interval) || 3000}
					showDots={stringToBoolean(props.showDots, true)}
					showArrows={stringToBoolean(props.showArrows, true)}
				/>

			<!-- Parallax -->
			{:else if componentType === 'parallax'}
				<Parallax
					image={props.image}
					height={props.height || '60vh'}
					speed={parseFloat(props.speed) || 0.5}
					overlay={stringToBoolean(props.overlay, true)}
					content={props.content || ''}
				/>

			<!-- Before/After -->
			{:else if componentType === 'before-after'}
				<BeforeAfter
					beforeImage={props.beforeImage}
					afterImage={props.afterImage}
					beforeLabel={props.beforeLabel || 'Antes'}
					afterLabel={props.afterLabel || 'Depois'}
					orientation={props.orientation || 'vertical'}
				/>

			<!-- ScrollyTelling -->
			{:else if componentType === 'scrolly'}
				<ScrollyTelling
					steps={props.steps || []}
					fullWidth={stringToBoolean(props.fullWidth, false)}
				/>

			<!-- ✅ SCROLLY FRAMES - NOVO COMPONENTE -->
			{:else if componentType === 'scrollyframes'}
				<ScrollyFrames
					framePrefix={props.imagePrefix || ''}
					framePrefixMobile={props.imagePrefixMobile || ''}
					frameExtension={props.imageSuffix || '.jpg'}
					frameExtensionMobile={props.imageSuffixMobile || '.webp'}
					startFrame={parseInt(props.frameStart) || 1}
					endFrame={parseInt(props.frameStop) || 100}
					totalFrames={parseInt(props.frameStop) || 100}
					height={props.height || '400vh'}
					showProgress={stringToBoolean(props.showProgress, true)}
					showFrameCounter={stringToBoolean(props.showTime, false)}
					preloadRadius={parseInt(props.preloadFrames) || 8}
				/>

			<!-- Flourish Embed -->
			{:else if componentType === 'flourish'}
				<FlourishEmbed
					src={props.src}
					height={props.height || '600px'}
					caption={props.caption}
					credit={props.credit}
				/>

			<!-- Flourish Scrolly -->
			{:else if componentType === 'flourish-scrolly'}
				<FlourishScrolly src={props.src} steps={props.steps || []} />

			<!-- Anchor Point -->
			{:else if componentType === 'anchor'}
				<AnchorPoint id={props.id} />

			<!-- Fallback para tipos desconhecidos -->
			{:else}
				<div class="unknown-component">
					<p><strong>Componente desconhecido:</strong> {paragraph.type}</p>
					<pre>{JSON.stringify(paragraph, null, 2)}</pre>
				</div>
			{/if}
		{/each}
	{/if}

	<!-- Renderizar créditos finais se existir -->
	{#if storyData.credits}
		<FinalCredits credits={storyData.credits} />
	{/if}
</article>

<style>
	.story-content {
		max-width: none;
		width: 100%;
	}

	.section-content {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.unknown-component {
		background: #f3f4f6;
		border: 2px dashed #9ca3af;
		padding: 2rem;
		margin: 2rem auto;
		max-width: 800px;
		border-radius: 8px;
	}

	.unknown-component pre {
		background: #ffffff;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.875rem;
	}
</style>