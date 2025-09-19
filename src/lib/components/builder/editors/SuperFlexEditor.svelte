<script>
	import { createEventDispatcher } from 'svelte';
	import SuperFlex from '$lib/components/story/SuperFlex.svelte';

	export let data = {};

	const dispatch = createEventDispatcher();

	const DEVICES = ['mobile', 'tablet', 'desktop', 'wide'];
	const DEVICE_LABELS = {
		mobile: 'Mobile',
		tablet: 'Tablet',
		desktop: 'Desktop',
		wide: 'Wide'
	};

	const PREVIEW_WIDTHS = {
		mobile: 414,
		tablet: 834,
		desktop: 1280,
		wide: 1600
	};

	const FLEX_OPTIONS = [
		{ value: 'row', label: 'Linha (row)' },
		{ value: 'row-reverse', label: 'Linha invertida' },
		{ value: 'column', label: 'Coluna (column)' },
		{ value: 'column-reverse', label: 'Coluna invertida' }
	];

	const ALIGN_OPTIONS = [
		{ value: 'flex-start', label: 'Início' },
		{ value: 'center', label: 'Centro' },
		{ value: 'flex-end', label: 'Fim' },
		{ value: 'stretch', label: 'Stretch' }
	];

	const JUSTIFY_OPTIONS = [
		{ value: 'flex-start', label: 'Início' },
		{ value: 'center', label: 'Centro' },
		{ value: 'flex-end', label: 'Fim' },
		{ value: 'space-between', label: 'Space between' },
		{ value: 'space-around', label: 'Space around' }
	];

	const TEXT_ALIGN_OPTIONS = [
		{ value: 'left', label: 'Esquerda' },
		{ value: 'center', label: 'Centro' },
		{ value: 'right', label: 'Direita' },
		{ value: 'justify', label: 'Justificado' }
	];

	const POSITION_DEFAULT = {
		mode: 'relative',
		top: 'auto',
		right: 'auto',
		bottom: 'auto',
		left: 'auto',
		zIndex: 'auto',
		transform: 'none'
	};

	const ELEMENT_TYPES = [
		{ id: 'text', label: 'Texto' },
		{ id: 'title', label: 'Título' },
		{ id: 'image', label: 'Imagem' },
		{ id: 'video', label: 'Vídeo' }
	];

	const createResponsive = (value) => ({
		mobile: value,
		tablet: value,
		desktop: value,
		wide: value
	});

	const createMedia = () => ({
		mobile: '',
		tablet: '',
		desktop: '',
		wide: ''
	});

	const createBackground = (color = 'transparent') => ({
		color,
		image: createMedia(),
		video: createMedia(),
		size: createResponsive('cover'),
		position: createResponsive('center center'),
		repeat: createResponsive('no-repeat'),
		overlayColor: 'transparent',
		overlayOpacity: '0'
	});

	const defaultContainerBackground = createBackground('#0b0d17');

	const DEFAULT_CONTAINER = {
		backgroundColor: '#0b0d17',
		background: defaultContainerBackground,
		backgroundImage: defaultContainerBackground.image,
		backgroundVideo: defaultContainerBackground.video,
		width: createResponsive('100vw'),
		height: createResponsive('auto'),
		padding: createResponsive('2rem'),
		margin: createResponsive('0'),
		gap: createResponsive('1.5rem'),
		flexDirection: createResponsive('column'),
		alignItems: createResponsive('center'),
		justifyContent: createResponsive('center'),
		fullWidth: false
	};

	const clone = (value) => {
		try {
			return structuredClone(value);
		} catch (error) {
			return JSON.parse(JSON.stringify(value));
		}
	};

	const DEFAULT_TEXT = {
		type: 'text',
		tag: 'p',
		content: 'Escreva aqui o conteúdo do texto.',
		backgroundColor: 'transparent',
		background: createBackground('transparent'),
		styles: {
			margin: createResponsive('0'),
			padding: createResponsive('0'),
			width: createResponsive('auto'),
			height: createResponsive('auto'),
			textAlign: createResponsive('left'),
			color: '#f8fafc'
		},
		position: createPosition()
	};

	function createPosition() {
		return {
			mobile: { ...POSITION_DEFAULT },
			tablet: { ...POSITION_DEFAULT },
			desktop: { ...POSITION_DEFAULT },
			wide: { ...POSITION_DEFAULT }
		};
	}

	function createElement(type) {
		switch (type) {
			case 'title':
				return {
					id: createId(),
					type: 'title',
					tag: 'h2',
					content: 'Título do super flex',
					backgroundColor: 'transparent',
					background: createBackground('transparent'),
					styles: {
						margin: createResponsive('0'),
						padding: createResponsive('0'),
						width: createResponsive('auto'),
						height: createResponsive('auto'),
						textAlign: createResponsive('left'),
						color: '#f8fafc'
					},
					position: createPosition()
				};
			case 'image': {
				const background = createBackground('transparent');
				return {
					id: createId(),
					type: 'image',
					src: createMedia(),
					alt: '',
					caption: createResponsive(''),
					credit: createResponsive(''),
					backgroundColor: 'transparent',
					background,
					styles: {
						margin: createResponsive('0'),
						padding: createResponsive('0'),
						width: createResponsive('320px'),
						height: createResponsive('auto'),
						textAlign: createResponsive('center'),
						color: '#f8fafc'
					},
					position: createPosition()
				};
			}
			case 'video': {
				const background = createBackground('transparent');
				return {
					id: createId(),
					type: 'video',
					src: createMedia(),
					poster: createMedia(),
					autoplay: false,
					loop: false,
					muted: true,
					caption: createResponsive(''),
					credit: createResponsive(''),
					backgroundColor: 'transparent',
					background,
					styles: {
						margin: createResponsive('0'),
						padding: createResponsive('0'),
						width: createResponsive('640px'),
						height: createResponsive('auto'),
						textAlign: createResponsive('center'),
						color: '#f8fafc'
					},
					position: createPosition()
				};
			}
			case 'text':
			default:
				return { id: createId(), ...clone(DEFAULT_TEXT) };
		}
	}

	function createId() {
		return `el-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
	}

	function normalizeResponsive(value, fallback) {
		if (value === null || value === undefined) {
			return createResponsive(fallback);
		}
		if (typeof value === 'string' || typeof value === 'number') {
			return createResponsive(value);
		}
		if (typeof value !== 'object') {
			return createResponsive(fallback);
		}
		const responsive = { ...createResponsive(fallback), ...value };
		return {
			mobile: responsive.mobile ?? fallback,
			tablet: responsive.tablet ?? responsive.mobile ?? fallback,
			desktop: responsive.desktop ?? responsive.tablet ?? fallback,
			wide: responsive.wide ?? responsive.desktop ?? fallback
		};
	}

	function normalizeMedia(value) {
		if (!value) {
			return createMedia();
		}
		if (typeof value === 'string') {
			return {
				mobile: value,
				tablet: value,
				desktop: value,
				wide: value
			};
		}
		const media = { ...createMedia(), ...value };
		return {
			mobile: media.mobile ?? '',
			tablet: media.tablet ?? media.mobile ?? '',
			desktop: media.desktop ?? media.tablet ?? '',
			wide: media.wide ?? media.desktop ?? ''
		};
	}

	function normalizeBackground(value, fallbackColor = 'transparent') {
		const normalized = createBackground(fallbackColor);
		if (value && typeof value === 'object') {
			normalized.color = value.color ?? fallbackColor;
			normalized.overlayColor = value.overlayColor ?? 'transparent';
			normalized.overlayOpacity = value.overlayOpacity ?? '0';
			normalized.size = normalizeResponsive(
				value.size ?? { desktop: value.imageSizeDesktop, mobile: value.imageSizeMobile },
				'cover'
			);
			normalized.position = normalizeResponsive(
				value.position ?? {
					desktop: value.imagePositionDesktop,
					mobile: value.imagePositionMobile
				},
				'center center'
			);
			normalized.repeat = normalizeResponsive(
				value.repeat ?? { desktop: value.imageRepeatDesktop, mobile: value.imageRepeatMobile },
				'no-repeat'
			);

			const imageSource = value.image ?? {
				mobile: value.imageMobile,
				tablet: value.imageTablet,
				desktop: value.imageDesktop ?? value.image,
				wide: value.imageWide
			};
			const videoSource = value.video ?? {
				mobile: value.videoMobile,
				tablet: value.videoTablet,
				desktop: value.videoDesktop ?? value.video,
				wide: value.videoWide
			};
			normalized.image = normalizeMedia(imageSource);
			normalized.video = normalizeMedia(videoSource);
		}
		return normalized;
	}

	function ensureStructure() {
		if (!data || typeof data !== 'object') {
			const container = clone(DEFAULT_CONTAINER);
			data = { type: 'super-flex', container, items: [] };
			return;
		}

		if (!data.container || typeof data.container !== 'object') {
			data.container = clone(DEFAULT_CONTAINER);
		} else {
			const container = data.container;
			const background = normalizeBackground(
				container.background,
				container.backgroundColor || '#0b0d17'
			);

			if (container.backgroundImage) {
				background.image = normalizeMedia(container.backgroundImage);
			}

			if (container.backgroundVideo) {
				background.video = normalizeMedia(container.backgroundVideo);
			}

			container.background = background;
			container.backgroundColor = background.color;
			container.backgroundImage = background.image;
			container.backgroundVideo = background.video;

			container.width = normalizeResponsive(container.width, '100vw');
			container.height = normalizeResponsive(container.height, 'auto');
			container.padding = normalizeResponsive(container.padding, '2rem');
			container.margin = normalizeResponsive(container.margin, '0');
			container.gap = normalizeResponsive(container.gap, '1.5rem');
			container.flexDirection = normalizeResponsive(container.flexDirection, 'column');
			container.alignItems = normalizeResponsive(container.alignItems, 'center');
			container.justifyContent = normalizeResponsive(container.justifyContent, 'center');
			container.fullWidth = Boolean(container.fullWidth);
		}

		if (!Array.isArray(data.items)) {
			data.items = [];
		}

		data.items.forEach(ensureElementStructure);
	}

	function ensureElementStructure(element) {
		if (!element || typeof element !== 'object') return;

		element.backgroundColor =
			typeof element.backgroundColor === 'string' ? element.backgroundColor : 'transparent';

		if (!element.background || typeof element.background !== 'object') {
			element.background = createBackground(element.backgroundColor);
		}

		if (!element.styles || typeof element.styles !== 'object') {
			element.styles = {};
		}

		const styles = element.styles;
		styles.margin = normalizeResponsive(styles.margin, '0');
		styles.padding = normalizeResponsive(styles.padding, '0');
		styles.width = normalizeResponsive(styles.width, 'auto');
		styles.height = normalizeResponsive(styles.height, 'auto');
		styles.textAlign = normalizeResponsive(styles.textAlign, 'left');
		styles.color = typeof styles.color === 'string' ? styles.color : '#f8fafc';

		if (!element.position || typeof element.position !== 'object') {
			element.position = createPosition();
		} else {
			DEVICES.forEach((device) => {
				element.position[device] = {
					...POSITION_DEFAULT,
					...(element.position[device] || {})
				};
				element.position[device].mode = element.position[device].mode || 'relative';
				element.position[device].top = element.position[device].top ?? 'auto';
				element.position[device].right = element.position[device].right ?? 'auto';
				element.position[device].bottom = element.position[device].bottom ?? 'auto';
				element.position[device].left = element.position[device].left ?? 'auto';
				element.position[device].zIndex = element.position[device].zIndex ?? 'auto';
				element.position[device].transform = element.position[device].transform ?? 'none';
			});
		}

		const background = normalizeBackground(element.background, element.backgroundColor);
		element.background = background;
		element.backgroundColor = background.color;
		element.backgroundImage = background.image;
		element.backgroundVideo = background.video;

		if (element.type === 'image' || element.type === 'video') {
			const source = element.src || element.content || createMedia();
			const normalizedSource = normalizeMedia(source);
			element.src = normalizedSource;
			element.content = normalizedSource;

			element.caption = normalizeResponsive(element.caption, '');
			element.credit = normalizeResponsive(element.credit, '');
		}

		if (element.type === 'video') {
			element.poster = normalizeMedia(element.poster);
			element.autoplay = Boolean(element.autoplay);
			element.loop = Boolean(element.loop);
			element.muted = element.muted !== false;
		}
	}

	function emitUpdate() {
		dispatch('update');
	}

	ensureStructure();

	let currentDevice = 'desktop';
	let selectedElementId = null;
	let previewWidth = PREVIEW_WIDTHS[currentDevice] || 1280;

	const itemNodes = new Map();
	let dragging = null;
	let pendingUpdate = null;
	let rafHandle = null;

	$: ensureStructure();
	$: selectedElement = data.items.find((item) => item.id === selectedElementId) || null;
	$: {
		if (!selectedElementId && data.items.length) {
			selectedElementId = data.items[0].id;
		}
	}
	$: previewWidth = PREVIEW_WIDTHS[currentDevice] || 1280;

	function addElement(type) {
		ensureStructure();
		const element = createElement(type);
		data.items = [...data.items, element];
		ensureElementStructure(element);
		selectedElementId = element.id;
		emitUpdate();
	}

	function removeElement(id) {
		data.items = data.items.filter((item) => item.id !== id);
		if (selectedElementId === id) {
			selectedElementId = null;
		}
		emitUpdate();
	}

	function updateElementType(element, type) {
		const preservedId = element.id;
		const replacement = createElement(type);
		Object.assign(element, replacement, { id: preservedId });
		ensureElementStructure(element);
		emitUpdate();
	}

	function ensureMediaForElement(element) {
		if (!element) return;
		if (element.type === 'image' || element.type === 'video') {
			element.src = normalizeMedia(element.src || element.content);
			element.content = element.src;
		}
		if (element.type === 'video') {
			element.poster = normalizeMedia(element.poster);
		}
		ensureElementStructure(element);
	}

	$: ensureMediaForElement(selectedElement);

	function handlePreviewItemMount(event) {
		if (!event?.detail) return;
		itemNodes.set(event.detail.id, event.detail.node);
	}

	function handlePreviewItemUnmount(event) {
		if (!event?.detail) return;
		itemNodes.delete(event.detail.id);
	}

	function schedulePositionCommit(payload) {
		pendingUpdate = payload;
		if (!rafHandle) {
			rafHandle = requestAnimationFrame(() => {
				if (pendingUpdate) {
					commitPositionUpdate(pendingUpdate);
					pendingUpdate = null;
				}
				rafHandle = null;
			});
		}
	}

	function commitPositionUpdate({ id, device, left, top }) {
		if (!id || !device) return;

		const roundedLeft = Math.round(left);
		const roundedTop = Math.round(top);

		data = {
			...data,
			items: data.items.map((item) => {
				if (item.id !== id) return item;

				const basePosition = { ...(item.position || createPosition()) };
				const devicePosition = {
					...POSITION_DEFAULT,
					...(basePosition[device] || {}),
					mode: 'absolute',
					left: `${roundedLeft}px`,
					top: `${roundedTop}px`,
					right: 'auto',
					bottom: 'auto'
				};

				basePosition[device] = devicePosition;

				return {
					...item,
					position: basePosition
				};
			})
		};
	}

	function handlePreviewItemPointerDown(event) {
		if (!event?.detail) return;
		const { id, pointerId, clientX, clientY } = event.detail;
		if (!id) return;

		const node = itemNodes.get(id);
		if (!node) return;

		const container = node.closest('.super-flex-container');
		if (!container) return;

		selectedElementId = id;
		const containerRect = container.getBoundingClientRect();
		const itemRect = node.getBoundingClientRect();

		dragging = {
			id,
			pointerId,
			offsetX: clientX - itemRect.left,
			offsetY: clientY - itemRect.top,
			device: currentDevice,
			container
		};

		window.addEventListener('pointermove', handlePreviewPointerMove);
		window.addEventListener('pointerup', handlePreviewPointerUp);
		window.addEventListener('pointercancel', handlePreviewPointerUp);
	}

	function handlePreviewPointerMove(event) {
		if (!dragging || event.pointerId !== dragging.pointerId) return;

		const containerRect = dragging.container.getBoundingClientRect();
		const left = event.clientX - containerRect.left - dragging.offsetX;
		const top = event.clientY - containerRect.top - dragging.offsetY;

		schedulePositionCommit({
			id: dragging.id,
			device: dragging.device,
			left,
			top
		});
	}

	function handlePreviewPointerUp(event) {
		if (!dragging || event.pointerId !== dragging.pointerId) return;

		const containerRect = dragging.container.getBoundingClientRect();
		const left = event.clientX - containerRect.left - dragging.offsetX;
		const top = event.clientY - containerRect.top - dragging.offsetY;

		commitPositionUpdate({
			id: dragging.id,
			device: dragging.device,
			left,
			top
		});

		pendingUpdate = null;
		if (rafHandle) {
			cancelAnimationFrame(rafHandle);
			rafHandle = null;
		}

		dragging = null;

		window.removeEventListener('pointermove', handlePreviewPointerMove);
		window.removeEventListener('pointerup', handlePreviewPointerUp);
		window.removeEventListener('pointercancel', handlePreviewPointerUp);

		emitUpdate();
	}
</script>

<div class="superflex-simple">
	<section class="preview-panel">
		<header>
			<h2>Preview</h2>
			<div class="preview-devices">
				{#each DEVICES as device}
					<button
						type="button"
						class:active={currentDevice === device}
						on:click={() => (currentDevice = device)}
					>
						{DEVICE_LABELS[device]}
					</button>
				{/each}
			</div>
		</header>

		<div class="preview-viewport">
			<div class="preview-canvas" style={`width:${previewWidth}px`}>
				<SuperFlex
					{data}
					builderMode={true}
					builderDevice={currentDevice}
					builderSelectedId={selectedElementId}
					on:builderitemmount={handlePreviewItemMount}
					on:builderitemunmount={handlePreviewItemUnmount}
					on:builderitempointerdown={handlePreviewItemPointerDown}
				/>
			</div>
		</div>

		<p class="preview-hint">
			Arraste os elementos para ajustar posição neste breakpoint. Valores são aplicados ao soltar.
		</p>
	</section>

	<section>
		<header>
			<h2>Container</h2>
			<div class="device-switcher">
				<label for="device-select">Dispositivo:</label>
				<select id="device-select" bind:value={currentDevice}>
					{#each DEVICES as device}
						<option value={device}>{device}</option>
					{/each}
				</select>
			</div>
		</header>

		<div class="grid">
			<label>
				Largura ({currentDevice})
				<input
					type="text"
					bind:value={data.container.width[currentDevice]}
					on:input={emitUpdate}
					placeholder="100vw"
				/>
			</label>

			<label>
				Altura ({currentDevice})
				<input
					type="text"
					bind:value={data.container.height[currentDevice]}
					on:input={emitUpdate}
					placeholder="auto"
				/>
			</label>

			<label>
				Padding ({currentDevice})
				<input
					type="text"
					bind:value={data.container.padding[currentDevice]}
					on:input={emitUpdate}
					placeholder="2rem"
				/>
			</label>

			<label>
				Margem ({currentDevice})
				<input
					type="text"
					bind:value={data.container.margin[currentDevice]}
					on:input={emitUpdate}
					placeholder="0"
				/>
			</label>

			<label>
				Gap ({currentDevice})
				<input
					type="text"
					bind:value={data.container.gap[currentDevice]}
					on:input={emitUpdate}
					placeholder="1.5rem"
				/>
			</label>

			<label>
				Direção ({currentDevice})
				<select bind:value={data.container.flexDirection[currentDevice]} on:change={emitUpdate}>
					{#each FLEX_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</label>

			<label>
				Alinhar itens ({currentDevice})
				<select bind:value={data.container.alignItems[currentDevice]} on:change={emitUpdate}>
					{#each ALIGN_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</label>

			<label>
				Justificar ({currentDevice})
				<select bind:value={data.container.justifyContent[currentDevice]} on:change={emitUpdate}>
					{#each JUSTIFY_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</label>

			<label class="full-width toggle">
				<input type="checkbox" bind:checked={data.container.fullWidth} on:change={emitUpdate} />
				Container ocupa largura total?
			</label>
		</div>

		<div class="background-card">
			<h3>Fundo</h3>
			<div class="background-options">
				<label>
					Cor base
					<input type="color" bind:value={data.container.background.color} on:input={emitUpdate} />
				</label>

				<label>
					Overlay
					<input
						type="color"
						bind:value={data.container.background.overlayColor}
						on:input={emitUpdate}
					/>
				</label>

				<label>
					Opacidade overlay
					<input
						type="text"
						bind:value={data.container.background.overlayOpacity}
						on:input={emitUpdate}
						placeholder="0"
					/>
				</label>
			</div>

			<div class="background-device-grid">
				{#each DEVICES as device}
					<div class="background-device">
						<h4>{DEVICE_LABELS[device]}</h4>
						<label>
							Imagem
							<input
								type="url"
								bind:value={data.container.background.image[device]}
								on:input={emitUpdate}
								placeholder="https://exemplo.com/imagem.jpg"
							/>
						</label>
						<label>
							Vídeo
							<input
								type="url"
								bind:value={data.container.background.video[device]}
								on:input={emitUpdate}
								placeholder="https://exemplo.com/video.mp4"
							/>
						</label>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section>
		<header>
			<h2>Elementos ({data.items.length})</h2>
			<div class="actions">
				{#each ELEMENT_TYPES as item}
					<button type="button" on:click={() => addElement(item.id)}>{item.label}</button>
				{/each}
			</div>
		</header>

		{#if data.items.length === 0}
			<p class="empty">Nenhum elemento adicionado ainda. Clique em um dos botões acima.</p>
		{:else}
			<ul class="element-list">
				{#each data.items as element}
					<li class:selected={element.id === selectedElementId}>
						<button
							type="button"
							class="element-head"
							on:click={() => (selectedElementId = element.id)}
						>
							<span
								>{ELEMENT_TYPES.find((entry) => entry.id === element.type)?.label ||
									element.type}</span
							>
							<small>{element.id}</small>
						</button>
						<div class="element-actions">
							<select
								bind:value={element.type}
								on:change={(event) => updateElementType(element, event.target.value)}
							>
								{#each ELEMENT_TYPES as option}
									<option value={option.id}>{option.label}</option>
								{/each}
							</select>
							<button type="button" class="danger" on:click={() => removeElement(element.id)}
								>Remover</button
							>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	{#if selectedElement}
		<section class="element-editor">
			<h3>Edição do elemento</h3>
			{#if selectedElement.type === 'text' || selectedElement.type === 'title'}
				<label>
					Tag HTML
					<input type="text" bind:value={selectedElement.tag} on:input={emitUpdate} />
				</label>
				<label>
					Conteúdo
					<textarea rows="5" bind:value={selectedElement.content} on:input={emitUpdate}></textarea>
				</label>
			{:else if selectedElement.type === 'image'}
				<label>
					Texto alternativo
					<input type="text" bind:value={selectedElement.alt} on:input={emitUpdate} />
				</label>

				<div class="media-inputs">
					{#each DEVICES as device}
						<label>
							Imagem ({DEVICE_LABELS[device]})
							<input
								type="url"
								bind:value={selectedElement.src[device]}
								on:input={emitUpdate}
								placeholder="https://exemplo.com/imagem.jpg"
							/>
						</label>
					{/each}
				</div>
			{:else if selectedElement.type === 'video'}
				<div class="media-inputs">
					{#each DEVICES as device}
						<label>
							Vídeo ({DEVICE_LABELS[device]})
							<input
								type="url"
								bind:value={selectedElement.src[device]}
								on:input={emitUpdate}
								placeholder="https://exemplo.com/video.mp4"
							/>
						</label>
					{/each}
				</div>
				<div class="media-inputs">
					{#each DEVICES as device}
						<label>
							Poster ({DEVICE_LABELS[device]})
							<input
								type="url"
								bind:value={selectedElement.poster[device]}
								on:input={emitUpdate}
								placeholder="https://exemplo.com/poster.jpg"
							/>
						</label>
					{/each}
				</div>
				<div class="toggle-row">
					<label class="toggle">
						<input type="checkbox" bind:checked={selectedElement.autoplay} on:change={emitUpdate} />
						Autoplay
					</label>
					<label class="toggle">
						<input type="checkbox" bind:checked={selectedElement.loop} on:change={emitUpdate} />
						Repetir (loop)
					</label>
					<label class="toggle">
						<input type="checkbox" bind:checked={selectedElement.muted} on:change={emitUpdate} />
						Iniciar sem áudio (muted)
					</label>
				</div>
			{/if}

			{#if selectedElement.type === 'image' || selectedElement.type === 'video'}
				<div class="responsive-field-group">
					<h4>Legenda</h4>
					<div class="device-grid">
						{#each DEVICES as device}
							<label>
								{DEVICE_LABELS[device]}
								<input
									type="text"
									bind:value={selectedElement.caption[device]}
									on:input={emitUpdate}
									placeholder="Legenda opcional"
								/>
							</label>
						{/each}
					</div>
				</div>

				<div class="responsive-field-group">
					<h4>Crédito</h4>
					<div class="device-grid">
						{#each DEVICES as device}
							<label>
								{DEVICE_LABELS[device]}
								<input
									type="text"
									bind:value={selectedElement.credit[device]}
									on:input={emitUpdate}
									placeholder="Crédito opcional"
								/>
							</label>
						{/each}
					</div>
				</div>
			{/if}

			<div class="element-style-grid">
				<label>
					Cor do texto
					<input type="color" bind:value={selectedElement.styles.color} on:input={emitUpdate} />
				</label>

				<label>
					Largura ({currentDevice})
					<input
						type="text"
						bind:value={selectedElement.styles.width[currentDevice]}
						on:input={emitUpdate}
						placeholder="auto"
					/>
				</label>

				<label>
					Altura ({currentDevice})
					<input
						type="text"
						bind:value={selectedElement.styles.height[currentDevice]}
						on:input={emitUpdate}
						placeholder="auto"
					/>
				</label>

				<label>
					Margem ({currentDevice})
					<input
						type="text"
						bind:value={selectedElement.styles.margin[currentDevice]}
						on:input={emitUpdate}
						placeholder="0"
					/>
				</label>

				<label>
					Padding ({currentDevice})
					<input
						type="text"
						bind:value={selectedElement.styles.padding[currentDevice]}
						on:input={emitUpdate}
						placeholder="0"
					/>
				</label>

				<label>
					Alinhamento de texto ({currentDevice})
					<select
						bind:value={selectedElement.styles.textAlign[currentDevice]}
						on:change={emitUpdate}
					>
						{#each TEXT_ALIGN_OPTIONS as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</label>
			</div>

			<div class="background-card">
				<h4>Fundo do elemento</h4>
				<div class="background-options">
					<label>
						Cor base
						<input
							type="color"
							bind:value={selectedElement.background.color}
							on:input={emitUpdate}
						/>
					</label>

					<label>
						Overlay
						<input
							type="color"
							bind:value={selectedElement.background.overlayColor}
							on:input={emitUpdate}
						/>
					</label>

					<label>
						Opacidade overlay
						<input
							type="text"
							bind:value={selectedElement.background.overlayOpacity}
							on:input={emitUpdate}
							placeholder="0"
						/>
					</label>
				</div>

				<div class="background-device-grid">
					{#each DEVICES as device}
						<div class="background-device">
							<h5>{DEVICE_LABELS[device]}</h5>
							<label>
								Imagem
								<input
									type="url"
									bind:value={selectedElement.background.image[device]}
									on:input={emitUpdate}
									placeholder="https://exemplo.com/imagem.jpg"
								/>
							</label>
							<label>
								Vídeo
								<input
									type="url"
									bind:value={selectedElement.background.video[device]}
									on:input={emitUpdate}
									placeholder="https://exemplo.com/video.mp4"
								/>
							</label>
						</div>
					{/each}
				</div>
			</div>

			<div class="position-section">
				<h4>Posição X / Y / Z</h4>
				<div class="position-panels">
					{#each DEVICES as device}
						<div class="position-panel">
							<div class="position-header">
								<span>{DEVICE_LABELS[device]}</span>
								<select bind:value={selectedElement.position[device].mode} on:change={emitUpdate}>
									<option value="relative">Relative</option>
									<option value="absolute">Absolute</option>
								</select>
							</div>

							{#if selectedElement.position[device].mode === 'absolute'}
								<div class="position-grid">
									<label>
										X (Left)
										<input
											type="text"
											bind:value={selectedElement.position[device].left}
											on:input={emitUpdate}
											placeholder="auto"
										/>
									</label>
									<label>
										Y (Top)
										<input
											type="text"
											bind:value={selectedElement.position[device].top}
											on:input={emitUpdate}
											placeholder="auto"
										/>
									</label>
									<label>
										Right
										<input
											type="text"
											bind:value={selectedElement.position[device].right}
											on:input={emitUpdate}
											placeholder="auto"
										/>
									</label>
									<label>
										Bottom
										<input
											type="text"
											bind:value={selectedElement.position[device].bottom}
											on:input={emitUpdate}
											placeholder="auto"
										/>
									</label>
								</div>
							{/if}

							<label>
								Z-index
								<input
									type="text"
									bind:value={selectedElement.position[device].zIndex}
									on:input={emitUpdate}
									placeholder="auto"
								/>
							</label>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}
</div>

<style>
	.superflex-simple {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		font-family: 'Inter', system-ui, sans-serif;
		font-size: 14px;
		color: #1f2937;
	}

	section {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.preview-panel {
		background: #0f172a;
		border-color: #1f2937;
		color: #f8fafc;
	}

	.preview-panel header {
		align-items: flex-start;
	}

	.preview-devices {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.preview-devices button {
		border: 1px solid rgba(148, 163, 184, 0.4);
		background: rgba(30, 41, 59, 0.9);
		color: inherit;
		padding: 0.4rem 0.75rem;
		border-radius: 9999px;
		font-size: 12px;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			border-color 0.2s ease;
	}

	.preview-devices button.active {
		background: #2563eb;
		border-color: #2563eb;
		color: #ffffff;
	}

	.preview-devices button:hover:not(.active) {
		border-color: rgba(148, 163, 184, 0.8);
	}

	.preview-viewport {
		background: #0b1120;
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 12px;
		padding: 1.25rem;
		overflow: auto;
	}

	.preview-canvas {
		position: relative;
		margin: 0 auto;
		background: repeating-conic-gradient(#1e293b 0% 25%, #111827 0% 50%) 0 0 / 32px 32px;
		border-radius: 12px;
		padding: 2rem;
		box-sizing: border-box;
		min-height: 480px;
	}

	.preview-canvas :global(.super-flex-container) {
		margin: 0 auto;
	}

	.preview-hint {
		margin: 0;
		font-size: 12px;
		color: rgba(226, 232, 240, 0.7);
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	h2 {
		margin: 0;
		font-size: 16px;
	}

	.device-switcher {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 13px;
	}

	.device-switcher select {
		padding: 0.25rem 0.5rem;
	}

	.grid {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-weight: 500;
	}

	input[type='text'],
	input[type='url'],
	input[type='color'],
	select,
	textarea {
		border: 1px solid #cbd5f5;
		border-radius: 6px;
		padding: 0.45rem 0.6rem;
		font-size: 13px;
		font-family: inherit;
	}

	textarea {
		resize: vertical;
	}

	.background-card {
		border-top: 1px solid #e2e8f0;
		padding-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.background-card h3,
	.background-card h4,
	.background-card h5 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
	}

	.background-options {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	}

	.background-device-grid {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}

	.background-device {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		border: 1px solid #cbd5f5;
		border-radius: 6px;
		background: #f8fafc;
	}

	.background-device h4,
	.background-device h5 {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
	}

	.media-inputs {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.toggle-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.responsive-field-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.responsive-field-group h4 {
		margin: 0;
		font-size: 14px;
	}

	.device-grid {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}

	.position-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.position-section h4 {
		margin: 0;
		font-size: 14px;
	}

	.position-panels {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.position-panel {
		border: 1px solid #cbd5f5;
		border-radius: 6px;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		background: #f8fafc;
	}

	.position-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 13px;
	}

	.position-grid {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	}

	.toggle {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		font-weight: 400;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.actions button {
		background: #2563eb;
		color: #ffffff;
		border: none;
		border-radius: 6px;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		font-size: 13px;
	}

	.actions button:hover {
		background: #1d4ed8;
	}

	.empty {
		margin: 0;
		color: #64748b;
	}

	.element-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.element-list li {
		border: 1px solid #cbd5f5;
		border-radius: 6px;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: #f8fafc;
	}

	.element-list li.selected {
		border-color: #2563eb;
		background: #eff6ff;
	}

	.element-head {
		background: transparent;
		border: none;
		padding: 0;
		display: flex;
		justify-content: space-between;
		width: 100%;
		text-align: left;
		font-size: 14px;
		cursor: pointer;
		font-weight: 600;
		color: #1f2937;
	}

	.element-head small {
		color: #94a3b8;
		font-weight: 400;
	}

	.element-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.element-actions select {
		flex: 1;
	}

	.element-actions .danger {
		background: #ef4444;
		color: #ffffff;
		border: none;
		border-radius: 6px;
		padding: 0.4rem 0.75rem;
		cursor: pointer;
	}

	.element-actions .danger:hover {
		background: #dc2626;
	}

	.element-editor {
		border: 1px dashed #cbd5f5;
	}

	.element-editor h3 {
		margin: 0;
		font-size: 15px;
	}

	.element-style-grid {
		margin-top: 1rem;
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	}
</style>
