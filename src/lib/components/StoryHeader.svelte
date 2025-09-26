<script>
	// Props existentes
	export let title = '';
	export let subtitle = '';
	export let author = '';
	export let date = '';

	// ✅ Props de mídia atualizadas
	export let backgroundImage = '';
	export let backgroundImageMobile = '';
	export let backgroundVideo = '';
	export let backgroundVideoMobile = '';
	export let overlay = true;
	export let verticalAlign = 'center';
	export let horizontalAlign = 'center';

	// Verificações de mídia
	$: hasDesktopMedia = !!(backgroundImage || backgroundVideo);
	$: hasMobileMedia = !!(backgroundImageMobile || backgroundVideoMobile);
	$: hasMedia = hasDesktopMedia || hasMobileMedia;

	const verticalOptions = ['top', 'center', 'bottom'];
	const horizontalOptions = ['left', 'center', 'right'];

	$: normalizedVerticalAlign = verticalOptions.includes((verticalAlign || '').toLowerCase())
		? (verticalAlign || '').toLowerCase()
		: 'center';
	$: normalizedHorizontalAlign = horizontalOptions.includes((horizontalAlign || '').toLowerCase())
		? (horizontalAlign || '').toLowerCase()
		: 'center';

	function formatDate(dateStr) {
		if (!dateStr) return '';
		const dateObj = new Date(dateStr);
		dateObj.setUTCDate(dateObj.getUTCDate() + 1);

		return dateObj.toLocaleDateString('pt-BR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<header
	class="story-header"
	class:has-media={hasMedia}
	class:story-header--valign-top={normalizedVerticalAlign === 'top'}
	class:story-header--valign-center={normalizedVerticalAlign === 'center'}
	class:story-header--valign-bottom={normalizedVerticalAlign === 'bottom'}
	class:story-header--halign-left={normalizedHorizontalAlign === 'left'}
	class:story-header--halign-center={normalizedHorizontalAlign === 'center'}
	class:story-header--halign-right={normalizedHorizontalAlign === 'right'}
>
	<div class="story-header__media-container">
		{#if backgroundImageMobile}
			<div
				class="story-header__background story-header__background--mobile"
				style="background-image: url({backgroundImageMobile})"
			></div>
		{/if}
		{#if backgroundVideoMobile}
			<video
				class="story-header__video story-header__video--mobile"
				autoplay
				muted
				loop
				playsinline
				src={backgroundVideoMobile}
			></video>
		{/if}

		{#if backgroundImage}
			<div
				class="story-header__background story-header__background--desktop"
				style="background-image: url({backgroundImage})"
			></div>
		{/if}
		{#if backgroundVideo}
			<video
				class="story-header__video story-header__video--desktop"
				autoplay
				muted
				loop
				playsinline
				src={backgroundVideo}
			></video>
		{/if}
	</div>

	{#if hasMedia && overlay}
		<div class="story-header__overlay"></div>
	{/if}

	<div class="story-header__content">
		<h1>{@html title || ''}</h1>
		<h2>{@html subtitle || ''}</h2>

		{#if author || date}
			<div class="meta">
				{#if author}<span>Por {author}</span>{/if}
				{#if date}<span>{formatDate(date)}</span>{/if}
			</div>
		{/if}
	</div>
</header>

<style>
	.story-header {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 3rem 1rem;
		border-bottom: 2px solid var(--color-border);
		margin-bottom: 2rem;
		gap: 1.5rem;
	}

	.story-header--valign-top {
		justify-content: flex-start;
	}

	.story-header--valign-bottom {
		justify-content: flex-end;
	}

	.story-header--halign-left {
		align-items: flex-start;
		text-align: left;
	}

	.story-header--halign-right {
		align-items: flex-end;
		text-align: right;
	}

	.story-header__media-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}

	.story-header__background,
	.story-header__video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
		object-fit: cover;
	}

	.story-header__background--desktop,
	.story-header__video--desktop {
		display: none;
	}

	.story-header__overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 2;
	}

	.story-header__content {
		position: relative;
		z-index: 3;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: min(90vw, 1100px);
	}

	.story-header--halign-left .story-header__content {
		align-items: flex-start;
		margin-left: 0;
		margin-right: auto;
	}

	.story-header--halign-center .story-header__content {
		align-items: center;
		margin: 0 auto;
	}

	.story-header--halign-right .story-header__content {
		align-items: flex-end;
		margin-left: auto;
		margin-right: 0;
	}

	.story-header.has-media {
		color: #232323;
		padding: 5rem 1rem;
		border-bottom: none;
	}

	.story-header.has-media h1,
	.story-header.has-media h2,
	.story-header.has-media .meta {
		color: #fff;
	}

	h1 {
		font-size: var(--font-size-120);
		font-weight: 800;
		color: var(--color-primary);
		margin: 0;
		line-height: 1.2;
		width: 100%;
	}

	h2 {
		font-size: var(--font-size-80);
		color: var(--color-secondary);
		font-weight: 400;
		margin: 0;
		line-height: 1.4;
	}

	.meta {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		color: var(--color-subtle-text);
		font-size: var(--font-size-60);
		font-weight: 500;
	}

	.story-header--halign-left .meta {
		justify-content: flex-start;
	}

	.story-header--halign-right .meta {
		justify-content: flex-end;
	}

	.meta span {
		margin: 0;
	}

	@media (min-width: 769px) {
		.story-header {
			padding: 4rem 2rem;
		}

		.story-header.has-media {
			padding: 6rem 4rem;
		}

		.story-header__background--mobile,
		.story-header__video--mobile {
			display: none;
		}

		.story-header__background--desktop,
		.story-header__video--desktop {
			display: block;
		}

		h1 {
			font-size: var(--font-size-130);
		}

		h2 {
			font-size: var(--font-size-90);
		}
	}
</style>
