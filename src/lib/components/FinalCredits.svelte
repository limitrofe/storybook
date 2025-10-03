<script>
	export let notes = '';
	export let sources = [];
	export let additionalGraphics = [];
	export let editedBy = [];
	export let authors = [];
	export let sections = [];

	export let layout = 'grid'; // grid, stacked
	export let columnsDesktop = 1;
	export let columnsMobile = 1;
	export let gap = '2rem';
	export let maxWidth = '900px';
	export let textAlign = 'left';

	export let backgroundColor = '';
	export let textColor = '';
	export let titleColor = '';
	export let accentColor = '';
	export let borderColor = '';
	export let paddingDesktop = '4rem 2rem 8rem 2rem';
	export let paddingMobile = '2.5rem 1rem 12rem 1rem';

	export let backgroundImage = '';
	export let backgroundImageMobile = '';
	export let backgroundVideo = '';
	export let backgroundVideoMobile = '';
	export let backgroundPosition = 'center center';
	export let backgroundPositionMobile = '';
	export let backgroundSize = 'cover';
	export let backgroundSizeMobile = '';
	export let overlay = false;
	export let overlayColor = 'rgba(0, 0, 0, 0.4)';
	export let customClass = '';

	const fallbackOrder = [
		{ key: 'authors', title: 'Créditos', type: 'list' },
		{ key: 'notes', title: 'Notas', type: 'notes' },
		{ key: 'sources', title: 'Fontes', type: 'list' },
		{ key: 'additionalGraphics', title: 'Contribuições gráficas adicionais', type: 'list' },
		{ key: 'editedBy', title: 'Edição', type: 'list' }
	];

	const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

	function buildFallbackSections() {
		const result = [];

		for (const item of fallbackOrder) {
			const value = item.type === 'notes' ? notes : toArray(getFallbackValue(item.key));

			if (item.type === 'notes' && notes) {
				result.push({ title: item.title, description: notes });
			} else if (value.length > 0) {
				result.push({ title: item.title, items: value });
			}
		}

		return result;
	}

	function getFallbackValue(key) {
		switch (key) {
			case 'authors':
				return authors;
			case 'sources':
				return sources;
			case 'additionalGraphics':
				return additionalGraphics;
			case 'editedBy':
				return editedBy;
			default:
				return [];
		}
	}

	function normalizeItem(item, sectionIndex, index) {
		if (!item) return null;

		if (typeof item === 'string') {
			return {
				id: `credits-item-${sectionIndex}-${index}`,
				primary: item.trim(),
				secondary: '',
				detail: '',
				link: ''
			};
		}

		if (typeof item === 'object') {
			const primary = item.name || item.primary || item.title || item.label || item.text || '';
			const secondary = item.role || item.secondary || item.subtitle || '';
			const detail = item.description || item.detail || item.note || '';
			const link = item.link || item.url || '';

			if (!primary && !secondary && !detail) return null;

			return {
				id: item.id || `credits-item-${sectionIndex}-${index}`,
				primary,
				secondary,
				detail,
				link
			};
		}

		return null;
	}

	function normalizeSection(section, index) {
		if (!section || typeof section !== 'object') return null;

		const normalizedItems = Array.isArray(section.items)
			? section.items
					.map((item, itemIndex) => normalizeItem(item, index, itemIndex))
					.filter(Boolean)
			: [];

		const descriptionHtml =
			typeof section.descriptionHtml === 'string' ? section.descriptionHtml : '';
		const html = typeof section.html === 'string' ? section.html : '';
		const description = section.description || section.text || '';

		return {
			id: section.id || `credits-section-${index}`,
			title: section.title || '',
			badge: section.badge || '',
			description,
			descriptionHtml: descriptionHtml || html,
			items: normalizedItems,
			layout: section.layout || 'list'
		};
	}

	$: hasCustomSections = Array.isArray(sections) && sections.length > 0;
	$: baseSections = hasCustomSections ? sections : buildFallbackSections();
	$: normalizedSections = baseSections
		.map((section, index) => normalizeSection(section, index))
		.filter(
			(section) =>
				section &&
				(section.title || section.description || section.descriptionHtml || section.items.length)
		);

	$: columnsDesktopSafe = Math.max(1, parseInt(columnsDesktop, 10) || 1);
	$: columnsMobileSafe = Math.max(1, parseInt(columnsMobile, 10) || 1);
	$: effectiveColumnsDesktop = layout === 'stacked' ? 1 : columnsDesktopSafe;
	$: effectiveColumnsMobile = layout === 'stacked' ? 1 : columnsMobileSafe;
	$: gapValue = gap || '2rem';
	$: maxWidthValue = maxWidth || '900px';
	$: paddingDesktopValue = paddingDesktop || '4rem 2rem 8rem 2rem';
	$: paddingMobileValue = paddingMobile || '2.5rem 1rem 12rem 1rem';
	$: textAlignValue = textAlign || 'left';

	$: backgroundImageDesktop = backgroundImage ? decodeURIComponent(backgroundImage) : '';
	$: backgroundImageMobileDecoded = backgroundImageMobile
		? decodeURIComponent(backgroundImageMobile)
		: '';
	$: backgroundVideoDesktop = backgroundVideo ? decodeURIComponent(backgroundVideo) : '';
	$: backgroundVideoMobileDecoded = backgroundVideoMobile
		? decodeURIComponent(backgroundVideoMobile)
		: '';

	$: hasDesktopMedia = !!(backgroundImageDesktop || backgroundVideoDesktop);
	$: hasMobileMedia = !!(backgroundImageMobileDecoded || backgroundVideoMobileDecoded);
	$: hasAnyMedia = hasDesktopMedia || hasMobileMedia;

	$: layoutClass = `final-credits--layout-${layout}`;

	$: styleTokens = [
		backgroundColor ? `--credits-bg-color:${backgroundColor}` : '',
		textColor ? `--credits-text-color:${textColor}` : '',
		titleColor ? `--credits-title-color:${titleColor}` : '',
		accentColor ? `--credits-accent-color:${accentColor}` : '',
		borderColor ? `--credits-border-color:${borderColor}` : '',
		`--credits-columns-desktop:${effectiveColumnsDesktop}`,
		`--credits-columns-mobile:${effectiveColumnsMobile}`,
		`--credits-gap:${gapValue}`,
		`--credits-max-width:${maxWidthValue}`,
		`--credits-padding-desktop:${paddingDesktopValue}`,
		`--credits-padding-mobile:${paddingMobileValue}`,
		`--credits-text-align:${textAlignValue}`
	]
		.filter(Boolean)
		.join('; ');
</script>

<footer
	class={`final-credits ${layoutClass} ${hasAnyMedia ? 'has-media' : ''} ${customClass}`}
	style={styleTokens}
>
	{#if hasDesktopMedia}
		{#if backgroundImageDesktop}
			<div
				class="final-credits__background final-credits__background--desktop"
				style={`background-image:url(${backgroundImageDesktop});background-position:${backgroundPosition};background-size:${backgroundSize};`}
			></div>
		{/if}

		{#if backgroundVideoDesktop}
			<video
				class="final-credits__video final-credits__video--desktop"
				autoplay
				loop
				muted
				playsinline
			>
				<source src={backgroundVideoDesktop} type="video/mp4" />
			</video>
		{/if}
	{/if}

	{#if hasMobileMedia}
		{#if backgroundImageMobileDecoded}
			<div
				class="final-credits__background final-credits__background--mobile"
				style={`background-image:url(${backgroundImageMobileDecoded});background-position:${backgroundPositionMobile || backgroundPosition};background-size:${backgroundSizeMobile || backgroundSize};`}
			></div>
		{/if}

		{#if backgroundVideoMobileDecoded}
			<video
				class="final-credits__video final-credits__video--mobile"
				autoplay
				loop
				muted
				playsinline
			>
				<source src={backgroundVideoMobileDecoded} type="video/mp4" />
			</video>
		{/if}
	{/if}

	{#if overlay && overlayColor}
		<div class="final-credits__overlay" style={`background:${overlayColor}`}></div>
	{/if}

	<div class="final-credits__content">
		<div class="final-credits__inner">
			{#if normalizedSections.length === 0}
				<p class="final-credits__empty">Nenhuma informação de créditos disponível.</p>
			{:else}
				<div class="final-credits__sections">
					{#each normalizedSections as section}
						<section class="credits-section credits-section--{section.layout}" data-id={section.id}>
							{#if section.title}
								<h3 class="credits-section__title">{section.title}</h3>
							{/if}

							{#if section.badge}
								<span class="credits-section__badge">{section.badge}</span>
							{/if}

							{#if section.descriptionHtml}
								<div class="credits-section__description">{@html section.descriptionHtml}</div>
							{:else if section.description}
								<p class="credits-section__description">{section.description}</p>
							{/if}

							{#if section.items.length > 0}
								<ul class="credits-list">
									{#each section.items as item}
										<li class="credits-item" data-id={item.id}>
											{#if item.primary}
												{#if item.link}
													<a
														class="credits-item__primary"
														href={item.link}
														rel="noopener noreferrer"
														target="_blank">{item.primary}</a
													>
												{:else}
													<span class="credits-item__primary">{item.primary}</span>
												{/if}
											{/if}
											{#if item.secondary}
												<span class="credits-item__secondary">{item.secondary}</span>
											{/if}
											{#if item.detail}
												<span class="credits-item__detail">{item.detail}</span>
											{/if}
										</li>
									{/each}
								</ul>
							{/if}
						</section>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</footer>

<style>
	.final-credits {
		--credits-bg-color: var(--color-highlight-bg);
		--credits-text-color: var(--color-text);
		--credits-title-color: var(--color-text);
		--credits-accent-color: var(--color-primary);
		--credits-border-color: var(--color-border);
		--credits-columns-desktop: 1;
		--credits-columns-mobile: 1;
		--credits-gap: 2rem;
		--credits-max-width: 900px;
		--credits-padding-desktop: 4rem 2rem 8rem 2rem;
		--credits-padding-mobile: 2.5rem 1rem 12rem 1rem;
		--credits-text-align: left;
		position: relative;
		overflow: hidden;
		background-color: var(--credits-bg-color);
		color: var(--credits-text-color);
		margin-top: 4rem;
		margin-bottom: 4rem;
		border-top: 1px solid var(--credits-border-color);
		z-index: 10;
	}

	.final-credits.has-media {
		color: var(--credits-text-color);
	}

	.final-credits__background,
	.final-credits__video,
	.final-credits__overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		pointer-events: none;
	}

	.final-credits__background {
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		filter: brightness(0.95);
	}

	.final-credits__video {
		object-fit: cover;
	}

	.final-credits__overlay {
		z-index: 2;
		mix-blend-mode: normal;
	}

	.final-credits__content {
		position: relative;
		z-index: 3;
		padding: var(--credits-padding-desktop);
	}

	.final-credits__inner {
		max-width: var(--credits-max-width);
		margin: 0 auto;
		text-align: var(--credits-text-align);
	}

	.final-credits__sections {
		display: grid;
		gap: var(--credits-gap);
		grid-template-columns: repeat(var(--credits-columns-desktop), minmax(0, 1fr));
	}

	.credits-section {
		padding-bottom: 1rem;
	}

	.credits-section__title {
		font-size: clamp(1.4rem, 3vw, 2rem);
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: var(--credits-title-color);
	}

	.credits-section__badge {
		display: inline-block;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--credits-accent-color);
		margin-bottom: 0.5rem;
	}

	.credits-section__description {
		margin: 0 0 1rem 0;
		font-size: clamp(1rem, 2.4vw, 1.15rem);
		line-height: 1.6;
		color: var(--credits-text-color);
		opacity: 0.85;
	}

	.credits-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.credits-item {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.credits-item__primary {
		font-size: clamp(1rem, 2.6vw, 1.2rem);
		font-weight: 600;
		color: var(--credits-title-color);
		text-decoration: none;
	}

	.credits-item__primary:hover,
	.credits-item__primary:focus {
		text-decoration: underline;
	}

	.credits-item__secondary {
		font-size: clamp(0.9rem, 2.2vw, 1.05rem);
		font-weight: 500;
		color: var(--credits-text-color);
		opacity: 0.8;
	}

	.credits-item__detail {
		font-size: clamp(0.85rem, 2vw, 1rem);
		color: var(--credits-text-color);
		opacity: 0.65;
	}

	.final-credits__empty {
		font-size: 1rem;
		opacity: 0.6;
	}

	.final-credits__video,
	.final-credits__background {
		display: none;
	}

	.final-credits__background--desktop,
	.final-credits__video--desktop {
		display: block;
	}

	@media (max-width: 768px) {
		.final-credits__content {
			padding: var(--credits-padding-mobile);
		}

		.final-credits__sections {
			grid-template-columns: repeat(var(--credits-columns-mobile), minmax(0, 1fr));
		}

		.final-credits__background--desktop,
		.final-credits__video--desktop {
			display: none;
		}

		.final-credits__background--mobile,
		.final-credits__video--mobile {
			display: block;
		}
	}

	.final-credits::after {
		content: '';
		display: block;
		height: 100px;
		width: 100%;
	}
</style>
