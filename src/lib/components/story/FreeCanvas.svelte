<script>
	export let minHeightDesktop = 400;
	export let maxHeightDesktop = null;
	export let minHeightMobile = 400;
	export let maxHeightMobile = null;
	export let baseWidthDesktop = 1440;
	export let baseWidthMobile = 375;
	export let backgroundSource = 'color';
	export let backgroundColor = '#000000';
	export let backgroundColorDesktop = '#000000';
	export let backgroundColorMobile = '#000000';
	export let backgroundImageDesktop = '';
	export let backgroundImageMobile = '';
	export let backgroundVideoDesktop = '';
	export let backgroundVideoMobile = '';
	export let backgroundVideoPosterDesktop = '';
	export let backgroundVideoPosterMobile = '';
	export let videoAutoplay = true;
	export let videoLoop = true;
	export let videoMuted = true;
	export let items = [];
	export let device = 'desktop';
	export let typography = {};

	let isMobile;
	$: isMobile = device === 'mobile';

	function getFrame(item) {
		return isMobile ? item.mobile : item.desktop;
	}

	function toVw(value, baseWidth) {
		if (!baseWidth || baseWidth <= 0) return '0px';
		return `${(value / baseWidth) * 100}vw`;
	}

	function selectValue(primary, fallback) {
		if (primary !== undefined && primary !== null && primary !== '') return primary;
		return fallback ?? '';
	}

	function getTypographyConfig(tag) {
		if (!tag || !typography || typeof typography !== 'object') return null;
		if (tag === 'blockquote') return typography.blockquote || null;
		if (tag === 'p') return typography.body || null;
		return typography[tag] || null;
	}

	function getTextContainerStyle(item, tag) {
		const styles = item.textStyles || {};
		const align = isMobile
			? styles.textAlignMobile || styles.textAlign || 'left'
			: styles.textAlign || 'left';
		const declarations = [
			'width:100%',
			'height:100%',
			'display:flex',
			`text-align:${align}`,
			`align-items:${styles.verticalAlign || 'flex-start'}`,
			`justify-content:${styles.horizontalAlign || 'flex-start'}`
		];

		const config = getTypographyConfig(tag || 'p');
		if (config?.background) declarations.push(`background:${config.background}`);
		if (config?.borderColor) {
			const width = config.borderWidth || '1px';
			declarations.push(`border:${width} solid ${config.borderColor}`);
		}

		return `${declarations.join(';')};`;
	}

	function getTextContentStyle(item, tag) {
		const styles = item.textStyles || {};
		const config = getTypographyConfig(tag || 'p');
		const declarations = ['margin:0'];

		const fontFamily = selectValue(styles.fontFamily, config?.fontFamily);
		const fontWeight = selectValue(styles.fontWeight, config?.fontWeight);
		const fontStyle = selectValue(styles.fontStyle, config?.fontStyle);
		const textTransform = selectValue(styles.textTransform, config?.textTransform);
		const letterSpacing = selectValue(styles.letterSpacing, config?.letterSpacing);
		const color = selectValue(styles.color, config?.color);

		if (fontFamily) declarations.push(`font-family:${fontFamily}`);
		if (fontWeight) declarations.push(`font-weight:${fontWeight}`);
		if (fontStyle) declarations.push(`font-style:${fontStyle}`);
		if (textTransform) declarations.push(`text-transform:${textTransform}`);
		if (letterSpacing) declarations.push(`letter-spacing:${letterSpacing}`);
		if (color) declarations.push(`color:${color}`);

		const desktop = config?.desktop || {};
		const mobile = config?.mobile || {};

		const fontSize = isMobile
			? selectValue(
					styles.fontSizeMobile,
					selectValue(styles.fontSize, selectValue(mobile.fontSize, desktop.fontSize))
				)
			: selectValue(styles.fontSize, selectValue(desktop.fontSize, mobile.fontSize));
		const lineHeight = isMobile
			? selectValue(
					styles.lineHeightMobile,
					selectValue(styles.lineHeight, selectValue(mobile.lineHeight, desktop.lineHeight))
				)
			: selectValue(styles.lineHeight, selectValue(desktop.lineHeight, mobile.lineHeight));

		if (fontSize) declarations.push(`font-size:${fontSize}`);
		if (lineHeight) declarations.push(`line-height:${lineHeight}`);

		if (config?.accentColor) declarations.push(`--free-canvas-accent:${config.accentColor}`);

		return `${declarations.join(';')};`;
	}

	const allowedTypographyTags = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);

	function getTypographyTag(item) {
		const raw = item.textStyles?.typography;
		if (typeof raw !== 'string') return null;
		const tag = raw.trim().toLowerCase();
		return allowedTypographyTags.has(tag) ? tag : null;
	}

	function hasHtml(content) {
		if (!content) return false;
		return /<\/?[a-z][^>]*>/i.test(content);
	}

	function getMediaSource(item) {
		if (isMobile && item.srcMobile) return item.srcMobile;
		return item.src || '';
	}

	function sanitizeUrl(url) {
		return typeof url === 'string' ? url.trim() : '';
	}

	let normalizedBackgroundSource;
	$: normalizedBackgroundSource = ['image', 'video'].includes(backgroundSource)
		? backgroundSource
		: backgroundVideoDesktop || backgroundVideoMobile
			? 'video'
			: backgroundImageDesktop || backgroundImageMobile
				? 'image'
				: 'color';

	function getBackgroundColorValue(device) {
		const fallback = backgroundColor || '#000000';
		const desktop = backgroundColorDesktop || fallback;
		const mobile = backgroundColorMobile || desktop;
		return device === 'mobile' ? mobile : desktop;
	}

	function getBackgroundImageValue(device) {
		const desktop = sanitizeUrl(backgroundImageDesktop);
		const mobile = sanitizeUrl(backgroundImageMobile) || desktop;
		return device === 'mobile' ? mobile : desktop;
	}

	function getBackgroundVideoValue(device) {
		const desktop = sanitizeUrl(backgroundVideoDesktop);
		const mobile = sanitizeUrl(backgroundVideoMobile) || desktop;
		return device === 'mobile' ? mobile : desktop;
	}

	function getBackgroundPosterValue(device) {
		const desktop = sanitizeUrl(backgroundVideoPosterDesktop);
		const mobile = sanitizeUrl(backgroundVideoPosterMobile) || desktop;
		return device === 'mobile' ? mobile : desktop;
	}

	function getContainerStyle() {
		const device = isMobile ? 'mobile' : 'desktop';
		const color = getBackgroundColorValue(device) || '#000000';
		const declarations = [
			'width:100vw',
			`height:${cssHeight}`,
			'position:relative',
			'overflow:hidden',
			'margin-left:calc(50% - 50vw)',
			'margin-right:calc(50% - 50vw)',
			`background-color:${color}`
		];
		if (normalizedBackgroundSource === 'image') {
			const image = getBackgroundImageValue(device);
			if (image) {
				const safe = image.replace(/"/g, '\\"');
				declarations.push(`background-image:url("${safe}")`);
				declarations.push('background-size:cover');
				declarations.push('background-position:center');
				declarations.push('background-repeat:no-repeat');
			} else {
				declarations.push('background-image:none');
			}
		} else {
			declarations.push('background-image:none');
		}
		return declarations.join(';');
	}

	$: shouldRenderBackgroundVideo =
		normalizedBackgroundSource === 'video' &&
		Boolean(getBackgroundVideoValue(isMobile ? 'mobile' : 'desktop'));

	let effectiveBaseWidth = baseWidthDesktop;
	let baseHeight = 0;
	let cssHeight = '0px';

	$: {
		const frames = items.map(getFrame).filter(Boolean);
		const contentWidth = frames.length
			? Math.max(...frames.map((frame) => (frame.x || 0) + (frame.width || 0)))
			: 0;
		const baseWidth = isMobile ? baseWidthMobile : baseWidthDesktop;
		effectiveBaseWidth = Math.max(baseWidth || 0, contentWidth);

		const minHeight = isMobile ? minHeightMobile : minHeightDesktop;
		const maxHeight = isMobile ? maxHeightMobile : maxHeightDesktop;
		const contentHeight = frames.length
			? Math.max(...frames.map((frame) => (frame.y || 0) + (frame.height || 0)))
			: 0;
		baseHeight = Math.max(contentHeight, minHeight || 0);
		if (typeof maxHeight === 'number' && Number.isFinite(maxHeight) && maxHeight > 0) {
			baseHeight = Math.min(baseHeight, maxHeight);
		}
		cssHeight = toVw(baseHeight, effectiveBaseWidth || baseWidth || 1);
	}

	function getStyle(item) {
		const frame = getFrame(item);
		if (!frame) return '';
		const baseWidth = effectiveBaseWidth || (isMobile ? baseWidthMobile : baseWidthDesktop) || 1;
		const { x = 0, y = 0, width = 200, height = 100, z = 1, opacity = 1 } = frame;
		const overflow = item.type === 'text' ? 'visible' : 'hidden';
		return `
		position:absolute;
		left:${toVw(x, baseWidth)};
		top:${toVw(y, baseWidth)};
		width:${toVw(width, baseWidth)};
		height:${toVw(height, baseWidth)};
		z-index:${z};
		opacity:${opacity};
		overflow:${overflow};
	`;
	}
</script>

<div class="free-canvas" style={getContainerStyle()}>
	{#if shouldRenderBackgroundVideo}
		<video
			class="free-canvas__background-video"
			src={getBackgroundVideoValue(isMobile ? 'mobile' : 'desktop')}
			poster={getBackgroundPosterValue(isMobile ? 'mobile' : 'desktop')}
			autoplay={videoAutoplay}
			loop={videoLoop}
			muted={videoMuted ?? true}
			playsinline
			preload="auto"
		></video>
	{/if}
	{#each items as item (item.id)}
		<div class="canvas-item" style={getStyle(item)}>
			{#if item.type === 'text'}
				{@const tag = getTypographyTag(item)}
				{@const contentHasHtml = hasHtml(item.content)}
				{@const textStyle = getTextContentStyle(item, tag)}
				<div class="text" style={getTextContainerStyle(item, tag)}>
					{#if contentHasHtml}
						<div class={`text-content ${tag ? `typography-${tag}` : ''}`.trim()} style={textStyle}>
							{@html item.content || ''}
						</div>
					{:else}
						<svelte:element
							this={tag || 'p'}
							class={`text-content ${tag ? `typography-${tag}` : ''}`.trim()}
							style={textStyle}
						>
							{@html item.content || ''}
						</svelte:element>
					{/if}
				</div>
			{:else if item.type === 'image'}
				{#if getMediaSource(item)}
					<img
						src={getMediaSource(item)}
						alt={item.alt || ''}
						style="width:100%;height:100%;object-fit:${item.objectFit || 'cover'};"
					/>
				{/if}
			{:else if item.type === 'video'}
				{#if getMediaSource(item)}
					<video
						src={getMediaSource(item)}
						poster={item.poster || ''}
						autoplay={item.autoplay}
						loop={item.loop}
						muted={item.muted ?? true}
						playsinline
						style="width:100%;height:100%;object-fit:${item.objectFit || 'cover'};"
					></video>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.free-canvas {
		position: relative;
	}

	.canvas-item {
		position: absolute;
		z-index: 1;
	}

	.free-canvas__background-video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		z-index: 0;
	}

	.text {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}

	.text-content {
		width: 100%;
		margin: 0;
	}

	.text-content :global(*) {
		margin: 0;
	}

	img,
	video {
		display: block;
	}
</style>
