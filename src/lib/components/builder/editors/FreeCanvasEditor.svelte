<script>
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { draggable } from '@neodrag/svelte';

	export let data = {};

	const dispatch = createEventDispatcher();

	function createId() {
		if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
			return crypto.randomUUID();
		}
		return `free-${Math.random().toString(36).slice(2, 10)}`;
	}

	const TYPOGRAPHY_OPTIONS = [
		{ value: '', label: 'Parágrafo (p)' },
		{ value: 'h1', label: 'Título H1' },
		{ value: 'h2', label: 'Título H2' },
		{ value: 'h3', label: 'Título H3' },
		{ value: 'h4', label: 'Título H4' },
		{ value: 'h5', label: 'Título H5' },
		{ value: 'h6', label: 'Título H6' },
		{ value: 'blockquote', label: 'Citação (blockquote)' }
	];

	const OBJECT_FIT_OPTIONS = [
		{ value: 'cover', label: 'Preencher (cover)' },
		{ value: 'contain', label: 'Conter (contain)' },
		{ value: 'fill', label: 'Esticar (fill)' },
		{ value: 'none', label: 'Sem ajuste (none)' },
		{ value: 'scale-down', label: 'Reduzir (scale-down)' }
	];

	const ALLOWED_OBJECT_FITS = new Set(OBJECT_FIT_OPTIONS.map((option) => option.value));

	const DEFAULT_ITEM = (type = 'text') => ({
		id: createId(),
		type,
		content: 'Seu texto aqui',
		src: '',
		srcMobile: '',
		poster: '',
		posterMobile: '',
		autoplay: false,
		loop: false,
		muted: true,
		objectFit: 'cover',
		textStyles: {
			fontFamily: '',
			fontSize: '',
			fontSizeMobile: '',
			lineHeight: '',
			lineHeightMobile: '',
			textAlign: 'left',
			textAlignMobile: 'left',
			color: '',
			fontWeight: '',
			typography: ''
		},
		desktop: { x: 120, y: 100, width: 260, height: 140, z: 1, opacity: 1 },
		mobile: { x: 40, y: 80, width: 220, height: 140, z: 1, opacity: 1 },
		autoHeight: type === 'text'
	});

	const DEFAULT_DATA = {
		type: 'free-canvas',
		minHeightDesktop: 400,
		maxHeightDesktop: null,
		minHeightMobile: 400,
		maxHeightMobile: null,
		baseWidthDesktop: 1440,
		baseWidthMobile: 375,
		backgroundSource: 'color',
		backgroundColorDesktop: '#000000',
		backgroundColorMobile: '#000000',
		backgroundColor: '#000000',
		backgroundImageDesktop: '',
		backgroundImageMobile: '',
		backgroundVideoDesktop: '',
		backgroundVideoMobile: '',
		backgroundVideoPosterDesktop: '',
		backgroundVideoPosterMobile: '',
		videoAutoplay: true,
		videoLoop: true,
		videoMuted: true,
		items: []
	};

	function ensureData(value) {
		if (!value || typeof value !== 'object') return structuredClone(DEFAULT_DATA);
		const merged = { ...structuredClone(DEFAULT_DATA), ...value };
		merged.baseWidthDesktop = Number(merged.baseWidthDesktop) || 1440;
		merged.baseWidthMobile = Number(merged.baseWidthMobile) || 375;
		if (!['color', 'image', 'video'].includes(merged.backgroundSource)) {
			merged.backgroundSource = 'color';
		}
		const legacyColor = merged.backgroundColor || '#000000';
		merged.backgroundColorDesktop = merged.backgroundColorDesktop || legacyColor;
		merged.backgroundColorMobile = merged.backgroundColorMobile || merged.backgroundColorDesktop;
		merged.backgroundColor = merged.backgroundColorDesktop;
		merged.backgroundImageDesktop = merged.backgroundImageDesktop || '';
		merged.backgroundImageMobile = merged.backgroundImageMobile || '';
		merged.backgroundVideoDesktop = merged.backgroundVideoDesktop || '';
		merged.backgroundVideoMobile = merged.backgroundVideoMobile || '';
		merged.backgroundVideoPosterDesktop = merged.backgroundVideoPosterDesktop || '';
		merged.backgroundVideoPosterMobile = merged.backgroundVideoPosterMobile || '';
		merged.videoAutoplay =
			merged.videoAutoplay === undefined ? true : Boolean(merged.videoAutoplay);
		merged.videoLoop = merged.videoLoop === undefined ? true : Boolean(merged.videoLoop);
		merged.videoMuted = merged.videoMuted === undefined ? true : Boolean(merged.videoMuted);
		if (!Array.isArray(merged.items)) merged.items = [];
		merged.items = merged.items.map(ensureItem).filter(Boolean);
		return merged;
	}

	function ensureItem(item) {
		if (!item || typeof item !== 'object') return null;
		const base = DEFAULT_ITEM(item.type || 'text');
		const merged = {
			...base,
			...structuredClone(item),
			id: item.id || base.id,
			autoHeight: item.autoHeight === undefined ? base.type === 'text' : item.autoHeight,
			desktop: { ...base.desktop, ...(item.desktop || {}) },
			mobile: { ...base.mobile, ...(item.mobile || {}) }
		};

		const sanitizedStyles = { ...base.textStyles, ...(item.textStyles || {}) };
		if (sanitizedStyles.fontFamily === 'Inter, sans-serif') sanitizedStyles.fontFamily = '';
		if (sanitizedStyles.fontSize === '32px') sanitizedStyles.fontSize = '';
		if (sanitizedStyles.fontSizeMobile === '24px') sanitizedStyles.fontSizeMobile = '';
		if (sanitizedStyles.lineHeight === '1.2') sanitizedStyles.lineHeight = '';
		if (sanitizedStyles.lineHeightMobile === '1.3') sanitizedStyles.lineHeightMobile = '';
		if (sanitizedStyles.color === '#ffffff') sanitizedStyles.color = '';
		if (sanitizedStyles.fontWeight === 600) sanitizedStyles.fontWeight = '';
		if (typeof sanitizedStyles.typography !== 'string') sanitizedStyles.typography = '';

		merged.textStyles = sanitizedStyles;
		return merged;
	}

	data = ensureData(data);
	$: data = ensureData(data);

	let currentDevice = 'desktop';
	let selectedId = data.items[0]?.id || null;
	$: selectedItem = data.items.find((item) => item.id === selectedId) || null;

	function selectDevice(device) {
		currentDevice = device;
		queueMicrotask(updatePreviewRect);
	}

	function emit() {
		dispatch('update', structuredClone(data));
	}

	function addItem(type) {
		const item = ensureItem({ type });
		data = { ...data, items: [...data.items, item] };
		selectedId = item.id;
		emit();
	}

	function removeSelected() {
		if (!selectedItem) return;
		const observer = previewObservers.get(selectedItem.id);
		if (observer) {
			observer.disconnect();
			previewObservers.delete(selectedItem.id);
		}
		previewNodes.delete(selectedItem.id);
		data = { ...data, items: data.items.filter((item) => item.id !== selectedItem.id) };
		selectedId = data.items[0]?.id || null;
		emit();
	}

	function updateItem(id, updater) {
		data = {
			...data,
			items: data.items.map((item) => {
				if (item.id !== id) return item;
				const draft = structuredClone(item);
				updater(draft);
				return draft;
			})
		};
	}

	function setFrameValue(item, device, field, value) {
		const numeric = Number.parseFloat(value);
		const parsed = Number.isFinite(numeric) ? numeric : 0;
		updateItem(item.id, (draft) => {
			draft[device] = { ...draft[device], [field]: parsed };
			if (field === 'height') {
				draft.autoHeight = false;
			}
		});
		emit();
	}

	function setTextValue(field, value) {
		if (!selectedItem) return;
		updateItem(selectedItem.id, (draft) => {
			draft.textStyles = { ...draft.textStyles, [field]: value };
		});
		emit();
	}

	function setItemField(item, field, value) {
		if (!item) return;

		updateItem(item.id, (draft) => {
			if (field === 'objectFit' && typeof value === 'string') {
				const next = value.trim();
				draft.objectFit = ALLOWED_OBJECT_FITS.has(next) ? next : draft.objectFit || 'cover';
				return;
			}

			if (typeof value === 'string') {
				const trimmed = value.trim();
				draft[field] = trimmed;
				return;
			}

			draft[field] = value;
		});
		emit();
	}

	function setAutoHeight(item, enabled) {
		updateItem(item.id, (draft) => {
			draft.autoHeight = enabled;
		});
		if (enabled) {
			queueMicrotask(() => {
				const el = previewNodes.get(item.id);
				if (!el) return;
				const newHeight = el.offsetHeight / (scale || 1);
				updateItem(item.id, (draft) => {
					draft[currentDevice] = { ...draft[currentDevice], height: newHeight };
				});
				emit();
			});
		} else {
			emit();
		}
	}

	function setCanvasValue(field, value) {
		const numeric = value === null || value === '' ? null : Number(value);
		data = { ...data, [field]: Number.isFinite(numeric) ? numeric : null };
		emit();
	}

	function setCanvasNumber(field, value) {
		const numeric = Number.parseFloat(value);
		if (!Number.isFinite(numeric)) return;
		const clamped = Math.max(0, numeric);
		data = { ...data, [field]: clamped };
		emit();
	}

	function sanitizeUrl(url) {
		return typeof url === 'string' ? url.trim() : '';
	}

	function getBackgroundColorValue(device = currentDevice) {
		const fallback = data.backgroundColor || '#000000';
		const desktop = data.backgroundColorDesktop || fallback;
		const mobile = data.backgroundColorMobile || desktop;
		return device === 'mobile' ? mobile : desktop;
	}

	function getBackgroundImageValue(device = currentDevice) {
		const desktop = sanitizeUrl(data.backgroundImageDesktop);
		const mobile = sanitizeUrl(data.backgroundImageMobile) || desktop;
		return device === 'mobile' ? mobile : desktop;
	}

	function getBackgroundVideoValue(device = currentDevice) {
		const desktop = sanitizeUrl(data.backgroundVideoDesktop);
		const mobile = sanitizeUrl(data.backgroundVideoMobile) || desktop;
		return device === 'mobile' ? mobile : desktop;
	}

	function getBackgroundPosterValue(device = currentDevice) {
		const desktop = sanitizeUrl(data.backgroundVideoPosterDesktop);
		const mobile = sanitizeUrl(data.backgroundVideoPosterMobile) || desktop;
		return device === 'mobile' ? mobile : desktop;
	}

	function getPreviewContainerStyle() {
		const color = getBackgroundColorValue(currentDevice) || '#000000';
		const declarations = [
			`width:${baseWidth}px`,
			`height:${previewHeight}px`,
			`min-height:${currentDevice === 'desktop' ? data.minHeightDesktop : data.minHeightMobile}px`,
			'position:relative',
			'overflow:hidden',
			`background-color:${color}`
		];
		if (data.backgroundSource === 'image') {
			const image = getBackgroundImageValue(currentDevice);
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

	function shouldRenderPreviewVideo() {
		if (data.backgroundSource !== 'video') return false;
		return Boolean(getBackgroundVideoValue(currentDevice));
	}

	let previewRef;
	let previewRect = { width: 800, height: 600 };
	let resizeObserver;
	const previewNodes = new Map();
	const previewObservers = new Map();

	$: baseWidth = currentDevice === 'desktop' ? data.baseWidthDesktop : data.baseWidthMobile;
	$: canvasHeightBase = computeCanvasHeightBase(currentDevice);
	$: scale = baseWidth > 0 ? previewRect.width / baseWidth : 1;
	$: previewHeight = canvasHeightBase * scale;

	function updatePreviewRect() {
		if (!previewRef) return;
		const rect = previewRef.getBoundingClientRect();
		previewRect = {
			width: rect.width || previewRect.width,
			height: rect.height || previewRect.height
		};
	}

	onMount(() => {
		updatePreviewRect();
		resizeObserver = new ResizeObserver(() => updatePreviewRect());
		if (previewRef) resizeObserver.observe(previewRef);
	});

	onDestroy(() => {
		if (resizeObserver) resizeObserver.disconnect();
		previewObservers.forEach((observer) => observer.disconnect());
		previewObservers.clear();
		previewNodes.clear();
	});

	function computeCanvasHeightBase(device) {
		const frames = data.items
			.map((item) => item[device])
			.filter(Boolean)
			.map((frame) => (frame.y || 0) + (frame.height || 0));
		const minHeight = device === 'desktop' ? data.minHeightDesktop : data.minHeightMobile;
		const maxHeight = device === 'desktop' ? data.maxHeightDesktop : data.maxHeightMobile;
		const base = Math.max(frames.length ? Math.max(...frames) : 0, minHeight || 0);
		if (typeof maxHeight === 'number' && Number.isFinite(maxHeight) && maxHeight > 0) {
			return Math.min(base, maxHeight);
		}
		return base;
	}

	function findItemById(id) {
		return data.items.find((entry) => entry.id === id) || null;
	}

	function getFrame(itemId) {
		const current = findItemById(itemId);
		return current?.[currentDevice] || null;
	}

	function clampPosition(value, axis, itemId) {
		const frame = getFrame(itemId) || {};
		const size = axis === 'x' ? frame.width || 0 : frame.height || 0;
		if (axis === 'y') {
			return Math.max(0, value);
		}

		const limit = currentDevice === 'desktop' ? data.baseWidthDesktop : data.baseWidthMobile;
		const max = Math.max(0, limit - size);
		return Math.max(0, Math.min(max, value));
	}

	function registerPreviewNode(item, el) {
		const id = item.id;
		const existing = previewObservers.get(id);
		if (existing) {
			existing.disconnect();
			previewObservers.delete(id);
		}
		if (!el) {
			previewNodes.delete(id);
			return;
		}
		previewNodes.set(id, el);
		const observer = new ResizeObserver(() => {
			const current = data.items.find((entry) => entry.id === id);
			if (!current) return;
			if (current.autoHeight === false && current.type !== 'text') return;
			const frame = current[currentDevice];
			if (!frame) return;
			const measured = el.offsetHeight / (scale || 1);
			if (Math.abs((frame.height || 0) - measured) < 0.5) return;
			updateItem(id, (draft) => {
				draft[currentDevice] = { ...draft[currentDevice], height: measured };
			});
			emit();
		});
		observer.observe(el);
		previewObservers.set(id, observer);
	}

	function getDragOptions(item) {
		let originFrame = (() => {
			const initial = getFrame(item.id);
			return {
				x: initial?.x ?? 0,
				y: initial?.y ?? 0
			};
		})();
		let pointerOrigin = null;
		const getDeltas = (offsetX, offsetY, event) => {
			if (pointerOrigin && event) {
				return {
					x: (event.clientX - pointerOrigin.x) / (scale || 1),
					y: (event.clientY - pointerOrigin.y) / (scale || 1)
				};
			}
			return {
				x: offsetX / (scale || 1),
				y: offsetY / (scale || 1)
			};
		};
		return {
			transform: ({ rootNode }) => {
				rootNode.style.transform = 'translate(0px, 0px)';
			},
			onDragStart: ({ event }) => {
				pointerOrigin = event
					? {
							x: event.clientX,
							y: event.clientY
						}
					: null;
				const current = getFrame(item.id);
				originFrame = {
					x: current?.x ?? 0,
					y: current?.y ?? 0
				};
				selectedId = item.id;
				updatePreviewRect();
			},
			onDrag: ({ offsetX, offsetY, event }) => {
				const { x: deltaX, y: deltaY } = getDeltas(offsetX, offsetY, event);
				const startX = originFrame?.x ?? 0;
				const startY = originFrame?.y ?? 0;
				const nextX = clampPosition(startX + deltaX, 'x', item.id);
				const nextY = clampPosition(startY + deltaY, 'y', item.id);
				updateItem(item.id, (draft) => {
					draft[currentDevice] = { ...draft[currentDevice], x: nextX, y: nextY };
				});
			},
			onDragEnd: ({ offsetX, offsetY, event }) => {
				const { x: deltaX, y: deltaY } = getDeltas(offsetX, offsetY, event);
				const startX = originFrame?.x ?? 0;
				const startY = originFrame?.y ?? 0;
				const nextX = clampPosition(startX + deltaX, 'x', item.id);
				const nextY = clampPosition(startY + deltaY, 'y', item.id);
				updateItem(item.id, (draft) => {
					draft[currentDevice] = { ...draft[currentDevice], x: nextX, y: nextY };
				});
				emit();
				pointerOrigin = null;
			}
		};
	}
</script>

<div class="editor">
	<header class="toolbar">
		<div class="device">
			<button
				type="button"
				class:active={currentDevice === 'desktop'}
				on:click={() => selectDevice('desktop')}
			>
				Desktop
			</button>
			<button
				type="button"
				class:active={currentDevice === 'mobile'}
				on:click={() => selectDevice('mobile')}
			>
				Mobile
			</button>
		</div>
		<div class="actions">
			<button type="button" on:click={() => addItem('text')}>+ Texto</button>
			<button type="button" on:click={() => addItem('image')}>+ Imagem</button>
			<button type="button" on:click={() => addItem('video')}>+ Vídeo</button>
			<button type="button" class="danger" disabled={!selectedItem} on:click={removeSelected}>
				Remover
			</button>
		</div>
	</header>

	<div class="canvas-panel">
		<div class="free-canvas-preview-wrapper">
			<div
				class="free-canvas-preview {currentDevice}"
				bind:this={previewRef}
				style={getPreviewContainerStyle()}
			>
				{#if shouldRenderPreviewVideo()}
					<video
						class="preview-background-video"
						src={getBackgroundVideoValue(currentDevice)}
						poster={getBackgroundPosterValue(currentDevice)}
						autoplay={data.videoAutoplay}
						loop={data.videoLoop}
						muted={data.videoMuted ?? true}
						playsinline
					></video>
				{/if}
				{#each data.items as item (item.id)}
					{#if item[currentDevice]}
						<div
							class="preview-item {selectedId === item.id ? 'selected' : ''}"
							style={`left:${item[currentDevice].x || 0}px;top:${item[currentDevice].y || 0}px;width:${item[currentDevice].width || 200}px;height:${item[currentDevice].height || 120}px;`}
							use:draggable={getDragOptions(item)}
							on:click={() => (selectedId = item.id)}
						>
							<div class="preview-label">{item.type}</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>

		<aside class="inspector">
			<section class="panel">
				<h3>Canvas</h3>
				<label>
					Altura mínima desktop (px)
					<input
						type="number"
						value={data.minHeightDesktop}
						min="0"
						on:input={(e) => setCanvasNumber('minHeightDesktop', e.currentTarget.value)}
					/>
				</label>
				<label>
					Altura máxima desktop (px)
					<input
						type="number"
						value={data.maxHeightDesktop ?? ''}
						min="0"
						placeholder="auto"
						on:input={(e) =>
							setCanvasValue(
								'maxHeightDesktop',
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value)
							)}
					/>
				</label>
				<label>
					Altura mínima mobile (px)
					<input
						type="number"
						value={data.minHeightMobile}
						min="0"
						on:input={(e) => setCanvasNumber('minHeightMobile', e.currentTarget.value)}
					/>
				</label>
				<label>
					Altura máxima mobile (px)
					<input
						type="number"
						value={data.maxHeightMobile ?? ''}
						min="0"
						placeholder="auto"
						on:input={(e) =>
							setCanvasValue(
								'maxHeightMobile',
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value)
							)}
					/>
				</label>
				<label>
					Fundo
					<select
						value={data.backgroundSource}
						on:change={(e) => {
							data = { ...data, backgroundSource: e.currentTarget.value };
							emit();
						}}
					>
						<option value="color">Cor</option>
						<option value="image">Imagem</option>
						<option value="video">Vídeo</option>
					</select>
				</label>
				{#if data.backgroundSource === 'color'}
					<label>
						Cor (desktop)
						<input
							type="color"
							value={data.backgroundColorDesktop}
							on:input={(e) => {
								const value = e.currentTarget.value;
								data = {
									...data,
									backgroundColorDesktop: value,
									backgroundColor: value
								};
								emit();
							}}
						/>
					</label>
					<label>
						Cor (mobile)
						<input
							type="color"
							value={data.backgroundColorMobile}
							on:input={(e) => {
								data = { ...data, backgroundColorMobile: e.currentTarget.value };
								emit();
							}}
						/>
					</label>
				{:else if data.backgroundSource === 'image'}
					<label>
						Imagem desktop (URL)
						<input
							type="text"
							placeholder="https://..."
							value={data.backgroundImageDesktop}
							on:input={(e) => {
								data = { ...data, backgroundImageDesktop: e.currentTarget.value };
								emit();
							}}
						/>
					</label>
					<label>
						Imagem mobile (URL)
						<input
							type="text"
							placeholder="https://..."
							value={data.backgroundImageMobile}
							on:input={(e) => {
								data = { ...data, backgroundImageMobile: e.currentTarget.value };
								emit();
							}}
						/>
					</label>
				{:else if data.backgroundSource === 'video'}
					<label>
						Vídeo desktop (URL)
						<input
							type="text"
							placeholder="https://..."
							value={data.backgroundVideoDesktop}
							on:input={(e) => {
								data = { ...data, backgroundVideoDesktop: e.currentTarget.value };
								emit();
							}}
						/>
					</label>
					<label>
						Vídeo mobile (URL)
						<input
							type="text"
							placeholder="https://..."
							value={data.backgroundVideoMobile}
							on:input={(e) => {
								data = { ...data, backgroundVideoMobile: e.currentTarget.value };
								emit();
							}}
						/>
					</label>
					<label>
						Poster desktop (URL)
						<input
							type="text"
							placeholder="https://..."
							value={data.backgroundVideoPosterDesktop}
							on:input={(e) => {
								data = { ...data, backgroundVideoPosterDesktop: e.currentTarget.value };
								emit();
							}}
						/>
					</label>
					<label>
						Poster mobile (URL)
						<input
							type="text"
							placeholder="https://..."
							value={data.backgroundVideoPosterMobile}
							on:input={(e) => {
								data = { ...data, backgroundVideoPosterMobile: e.currentTarget.value };
								emit();
							}}
						/>
					</label>
					<div class="checkbox-row">
						<label class="checkbox">
							<input
								type="checkbox"
								checked={data.videoAutoplay}
								on:change={(e) => {
									data = { ...data, videoAutoplay: e.currentTarget.checked };
									emit();
								}}
							/>
							Autoplay
						</label>
						<label class="checkbox">
							<input
								type="checkbox"
								checked={data.videoLoop}
								on:change={(e) => {
									data = { ...data, videoLoop: e.currentTarget.checked };
									emit();
								}}
							/>
							Loop
						</label>
						<label class="checkbox">
							<input
								type="checkbox"
								checked={data.videoMuted}
								on:change={(e) => {
									data = { ...data, videoMuted: e.currentTarget.checked };
									emit();
								}}
							/>
							Mudo
						</label>
					</div>
				{/if}
				<label>
					Largura base desktop (px)
					<input
						type="number"
						min="320"
						value={data.baseWidthDesktop}
						on:input={(e) => setCanvasNumber('baseWidthDesktop', e.currentTarget.value)}
					/>
				</label>
				<label>
					Largura base mobile (px)
					<input
						type="number"
						min="200"
						value={data.baseWidthMobile}
						on:input={(e) => setCanvasNumber('baseWidthMobile', e.currentTarget.value)}
					/>
				</label>
			</section>

			<section class="panel">
				<h3>Elemento</h3>
				{#if selectedItem}
					<p>ID: {selectedItem.id}</p>
					<div class="grid">
						<label>
							X ({currentDevice})
							<input
								type="number"
								value={selectedItem[currentDevice].x}
								on:input={(e) =>
									setFrameValue(selectedItem, currentDevice, 'x', e.currentTarget.value)}
							/>
						</label>
						<label>
							Y ({currentDevice})
							<input
								type="number"
								value={selectedItem[currentDevice].y}
								on:input={(e) =>
									setFrameValue(selectedItem, currentDevice, 'y', e.currentTarget.value)}
							/>
						</label>
						<label>
							Largura ({currentDevice})
							<input
								type="number"
								value={selectedItem[currentDevice].width}
								min="0"
								on:input={(e) =>
									setFrameValue(selectedItem, currentDevice, 'width', e.currentTarget.value)}
							/>
						</label>
						<label>
							Altura ({currentDevice})
							<input
								type="number"
								value={selectedItem[currentDevice].height}
								min="0"
								disabled={selectedItem.autoHeight ?? selectedItem.type === 'text'}
								on:input={(e) =>
									setFrameValue(selectedItem, currentDevice, 'height', e.currentTarget.value)}
							/>
						</label>
					</div>
					{#if selectedItem.type === 'text'}
						<label>
							Conteúdo (HTML)
							<textarea
								rows="4"
								value={selectedItem.content}
								on:input={(e) => {
									updateItem(selectedItem.id, (draft) => (draft.content = e.currentTarget.value));
									emit();
								}}
							></textarea>
						</label>
						<label class="checkbox">
							<input
								type="checkbox"
								checked={selectedItem.autoHeight ?? true}
								on:change={(e) => setAutoHeight(selectedItem, e.currentTarget.checked)}
							/>
							Altura automática ({currentDevice})
						</label>
						<label>
							Cor do texto
							<input
								type="color"
								value={selectedItem.textStyles?.color || '#ffffff'}
								on:input={(e) => setTextValue('color', e.currentTarget.value)}
							/>
						</label>
						<label>
							Tipografia (usa HTML automático)
							<select
								value={selectedItem.textStyles?.typography || ''}
								on:change={(e) => {
									setTextValue('typography', e.currentTarget.value);
								}}
							>
								{#each TYPOGRAPHY_OPTIONS as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							<small class="hint">Se já inseriu HTML no campo de conteúdo, deixe em branco.</small>
						</label>
					{:else if selectedItem.type === 'image'}
						<label>
							Imagem desktop (URL)
							<input
								type="text"
								placeholder="https://..."
								value={selectedItem.src}
								on:input={(e) => setItemField(selectedItem, 'src', e.currentTarget.value)}
							/>
						</label>
						<label>
							Imagem mobile (URL)
							<input
								type="text"
								placeholder="https://..."
								value={selectedItem.srcMobile}
								on:input={(e) => setItemField(selectedItem, 'srcMobile', e.currentTarget.value)}
							/>
						</label>
						<label>
							Texto alternativo (alt)
							<input
								type="text"
								placeholder="Descrição da imagem"
								value={selectedItem.alt || ''}
								on:input={(e) => setItemField(selectedItem, 'alt', e.currentTarget.value)}
							/>
						</label>
						<label>
							Ajuste da imagem (object-fit)
							<select
								value={selectedItem.objectFit || 'cover'}
								on:change={(e) => setItemField(selectedItem, 'objectFit', e.currentTarget.value)}
							>
								{#each OBJECT_FIT_OPTIONS as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</label>
					{:else if selectedItem.type === 'video'}
						<label>
							Vídeo desktop (URL)
							<input
								type="text"
								placeholder="https://..."
								value={selectedItem.src}
								on:input={(e) => setItemField(selectedItem, 'src', e.currentTarget.value)}
							/>
						</label>
						<label>
							Vídeo mobile (URL)
							<input
								type="text"
								placeholder="https://..."
								value={selectedItem.srcMobile}
								on:input={(e) => setItemField(selectedItem, 'srcMobile', e.currentTarget.value)}
							/>
						</label>
						<label>
							Poster desktop (URL)
							<input
								type="text"
								placeholder="https://..."
								value={selectedItem.poster || ''}
								on:input={(e) => setItemField(selectedItem, 'poster', e.currentTarget.value)}
							/>
						</label>
						<label>
							Poster mobile (URL)
							<input
								type="text"
								placeholder="https://..."
								value={selectedItem.posterMobile || ''}
								on:input={(e) => setItemField(selectedItem, 'posterMobile', e.currentTarget.value)}
							/>
						</label>
						<div class="checkbox-row">
							<label class="checkbox">
								<input
									type="checkbox"
									checked={selectedItem.autoplay ?? true}
									on:change={(e) => setItemField(selectedItem, 'autoplay', e.currentTarget.checked)}
								/>
								Autoplay
							</label>
							<label class="checkbox">
								<input
									type="checkbox"
									checked={selectedItem.loop ?? true}
									on:change={(e) => setItemField(selectedItem, 'loop', e.currentTarget.checked)}
								/>
								Loop
							</label>
							<label class="checkbox">
								<input
									type="checkbox"
									checked={selectedItem.muted ?? true}
									on:change={(e) => setItemField(selectedItem, 'muted', e.currentTarget.checked)}
								/>
								Mudo
							</label>
						</div>
						<label>
							Ajuste do vídeo (object-fit)
							<select
								value={selectedItem.objectFit || 'cover'}
								on:change={(e) => setItemField(selectedItem, 'objectFit', e.currentTarget.value)}
							>
								{#each OBJECT_FIT_OPTIONS as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</label>
					{/if}
				{:else}
					<p>Selecione um elemento para editar.</p>
				{/if}
			</section>
		</aside>
	</div>
</div>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.toolbar button {
		border: none;
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		cursor: pointer;
		background: #e2e8f0;
	}

	.toolbar button.active {
		background: #2563eb;
		color: white;
	}

	.toolbar .danger {
		background: #f87171;
		color: white;
	}

	.canvas-panel {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
		gap: 1rem;
	}

	.free-canvas-preview-wrapper {
		overflow: auto;
		border-radius: 12px;
	}

	.free-canvas-preview {
		position: relative;
		border: 1px solid #1f2937;
		border-radius: 12px;
		overflow: hidden;
		background: #111827;
	}

	.preview-item {
		position: absolute;
		border: 2px dashed rgba(148, 163, 184, 0.6);
		border-radius: 8px;
		box-sizing: border-box;
		background: rgba(30, 41, 59, 0.55);
		color: white;
		cursor: grab;
		touch-action: none;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		text-transform: uppercase;
		z-index: 1;
	}

	.preview-item.selected {
		border-color: rgba(59, 130, 246, 0.9);
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
	}

	.preview-label {
		pointer-events: none;
		opacity: 0.85;
		font-weight: 600;
		letter-spacing: 0.08em;
	}

	.preview-background-video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		z-index: 0;
	}

	.inspector {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.panel {
		border: 1px solid rgba(148, 163, 184, 0.4);
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.9rem;
	}

	label.checkbox {
		flex-direction: row;
		align-items: center;
	}

	label.checkbox input {
		width: auto;
		margin-right: 0.5rem;
	}

	.checkbox-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.hint {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: #94a3b8;
	}

	input,
	textarea {
		border: 1px solid rgba(148, 163, 184, 0.6);
		border-radius: 8px;
		padding: 0.45rem 0.5rem;
		font-size: 0.9rem;
		background: #ffffff;
	}

	textarea {
		resize: vertical;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}
</style>
