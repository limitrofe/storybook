<script>
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { draggable } from '@neodrag/svelte';
	import RichTextEditor from '$lib/builder/components/RichTextEditor.svelte';

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
			fontStyle: '',
			textDecoration: '',
			textTransform: '',
			letterSpacing: '',
			textShadow: '',
			typography: ''
		},
		desktop: { x: 120, y: 100, width: 260, height: 140, z: 1, opacity: 1, rotation: 0 },
		mobile: { x: 40, y: 80, width: 220, height: 140, z: 1, opacity: 1, rotation: 0 },
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

		const normalizeRotation = (value) => {
			const numeric = Number(value);
			return Number.isFinite(numeric) ? numeric : 0;
		};

		const normalizeOpacity = (value) => {
			const numeric = Number(value);
			if (!Number.isFinite(numeric)) return 1;
			return Math.min(1, Math.max(0, numeric));
		};

		merged.desktop.rotation = normalizeRotation(merged.desktop.rotation);
		merged.mobile.rotation = normalizeRotation(merged.mobile.rotation);
		merged.desktop.opacity = normalizeOpacity(merged.desktop.opacity);
		merged.mobile.opacity = normalizeOpacity(merged.mobile.opacity);

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
		if (editingItemId === selectedItem.id) {
			editingItemId = null;
		}
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
	let parsed = Number.isFinite(numeric) ? numeric : 0;
	if (field === 'opacity') {
		parsed = Math.min(1, Math.max(0, Number.isFinite(numeric) ? numeric : 1));
	}
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

	function applyTextFormat(kind) {
		if (!selectedItem || !contentTextarea) return;
		const textarea = contentTextarea;
		const selectionStart = textarea.selectionStart ?? 0;
		const selectionEnd = textarea.selectionEnd ?? selectionStart;
		const value = textarea.value || '';

		const tags = {
			bold: { open: '<strong>', close: '</strong>' },
			italic: { open: '<em>', close: '</em>' },
			underline: { open: '<u>', close: '</u>' }
		};

		const { open, close } = tags[kind] || tags.bold;
		const selected = value.slice(selectionStart, selectionEnd);
		const fallbackText = selected || 'texto';
		const newValue =
			value.slice(0, selectionStart) + open + fallbackText + close + value.slice(selectionEnd);

		updateItem(selectedItem.id, (draft) => {
			draft.content = newValue;
		});
		emit();

		queueMicrotask(() => {
			if (!contentTextarea) return;
			const cursor = selectionStart + open.length + fallbackText.length;
			contentTextarea.focus();
			contentTextarea.setSelectionRange(cursor, cursor);
		});
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
			`height:${canvasHeightBase}px`,
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
		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				closeItemModal();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
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

	let editingItemId = null;
	let contentTextarea;
	$: editingItem = editingItemId ? findItemById(editingItemId) : null;

	function registerPreviewNode(item, el) {
		const id = item.id;
		const existing = previewObservers.get(id);
		if (existing) {
			existing.disconnect();
			previewObservers.delete(id);
		}

		if (item.type !== 'text' || !el) {
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

	function previewNodeAction(node, item) {
		registerPreviewNode(item, node);
		return {
			update(newItem) {
				if (newItem === item) return;
				registerPreviewNode(item, null);
				item = newItem;
				registerPreviewNode(item, node);
			},
			destroy() {
				registerPreviewNode(item, null);
			}
		};
	}

	function getPreviewItemStyle(item) {
		const frame = item[currentDevice] || {};
		const {
			x = 0,
			y = 0,
			width = 200,
			height = 120,
			z = 1,
			opacity = 1,
			rotation = 0
		} = frame;
		const declarations = [
			'position:absolute',
			`left:${x}px`,
			`top:${y}px`,
			`width:${width}px`,
			item.autoHeight && item.type === 'text' ? 'height:auto' : `height:${height}px`,
			`z-index:${z}`,
			`opacity:${opacity}`,
			'transform-origin:top left',
			`transform:rotate(${rotation}deg)`
		];
		return declarations.join(';');
	}

	const selectValue = (primary, fallback) =>
		primary !== undefined && primary !== null && primary !== '' ? primary : fallback ?? '';

	function getPreviewTextStyle(item) {
		const styles = item.textStyles || {};
		const align = currentDevice === 'mobile'
			? selectValue(styles.textAlignMobile, styles.textAlign)
			: selectValue(styles.textAlign, styles.textAlignMobile);
		const fontSize = currentDevice === 'mobile'
			? selectValue(styles.fontSizeMobile, styles.fontSize)
			: selectValue(styles.fontSize, styles.fontSizeMobile);
		const lineHeight = currentDevice === 'mobile'
			? selectValue(styles.lineHeightMobile, styles.lineHeight)
			: selectValue(styles.lineHeight, styles.lineHeightMobile);

		const declarations = [
			'width:100%',
			 item.autoHeight ? 'min-height:20px' : 'height:100%',
			'pointer-events:none',
			`text-align:${align || 'left'}`
		];

		const fontWeight = selectValue(styles.fontWeight, '');
		const fontStyle = selectValue(styles.fontStyle, '');
		const textTransform = selectValue(styles.textTransform, '');
		const textDecoration = selectValue(styles.textDecoration, '');
		const letterSpacing = selectValue(styles.letterSpacing, '');
		const textShadow = selectValue(styles.textShadow, '');
		const color = selectValue(styles.color, '');

		if (fontSize) declarations.push(`font-size:${fontSize}`);
		if (lineHeight) declarations.push(`line-height:${lineHeight}`);
		if (fontWeight) declarations.push(`font-weight:${fontWeight}`);
		if (fontStyle) declarations.push(`font-style:${fontStyle}`);
		if (textTransform) declarations.push(`text-transform:${textTransform}`);
		if (textDecoration) declarations.push(`text-decoration:${textDecoration}`);
		if (letterSpacing) declarations.push(`letter-spacing:${letterSpacing}`);
		if (textShadow) declarations.push(`text-shadow:${textShadow}`);
		if (color) declarations.push(`color:${color}`);

		return declarations.join(';');
	}

	function getPreviewMediaSource(item) {
		if (!item) return '';
		const desktop = sanitizeUrl(item.src);
		const mobile = sanitizeUrl(item.srcMobile) || desktop;
		return currentDevice === 'mobile' ? mobile : desktop;
	}

	function openItemModal(item) {
		selectedId = item.id;
		editingItemId = item.id;
	}

	function closeItemModal() {
		editingItemId = null;
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
							style={getPreviewItemStyle(item)}
							use:draggable={getDragOptions(item)}
							on:click={() => (selectedId = item.id)}
							on:dblclick={() => openItemModal(item)}
						>
						{#if item.type === 'text'}
						<div
							class="preview-item__text"
							style={getPreviewTextStyle(item)}
							use:previewNodeAction={item}
						>
								{@html item.content || ''}
						</div>
							{:else if item.type === 'image'}
								<img
									class="preview-item__image"
									src={getPreviewMediaSource(item)}
									alt={item.alt || ''}
									style={`object-fit:${item.objectFit || 'cover'};`}
								/>
							{:else if item.type === 'video'}
								<video
									class="preview-item__video"
									src={getPreviewMediaSource(item)}
									poster={item.poster || ''}
									muted
									playsinline
									autoplay={item.autoplay ?? true}
									loop={item.loop ?? true}
									style={`object-fit:${item.objectFit || 'cover'};`}
								></video>
							{:else}
								<div class="preview-item__placeholder">{item.type}</div>
							{/if}
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
						<button type="button" class="secondary-button" on:click={() => openItemModal(selectedItem)}>
							Abrir editor avançado
						</button>
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
						<label>
							Rotação ({currentDevice})
							<input
								type="number"
								value={selectedItem[currentDevice].rotation ?? 0}
								on:input={(e) =>
									setFrameValue(selectedItem, currentDevice, 'rotation', e.currentTarget.value)}
							/>
						</label>
						<label>
							Opacidade ({currentDevice})
							<input
								type="number"
								min="0"
								max="1"
								step="0.05"
								value={selectedItem[currentDevice].opacity ?? 1}
								on:input={(e) =>
									setFrameValue(selectedItem, currentDevice, 'opacity', e.currentTarget.value)}
							/>
						</label>
					</div>
					{#if selectedItem.type === 'text'}
						<label>
							Conteúdo (HTML)
							<div class="text-toolbar">
								<button type="button" class="toolbar-button" title="Negrito" on:click={() => applyTextFormat('bold')}>
									<strong>B</strong>
								</button>
								<button type="button" class="toolbar-button" title="Itálico" on:click={() => applyTextFormat('italic')}>
									<em>I</em>
								</button>
								<button type="button" class="toolbar-button" title="Sublinhado" on:click={() => applyTextFormat('underline')}>
									<span class="underline">U</span>
								</button>
							</div>
							<textarea
								rows="4"
								value={selectedItem.content}
								bind:this={contentTextarea}
								on:input={(e) => {
									updateItem(selectedItem.id, (draft) => (draft.content = e.currentTarget.value));
									emit();
								}}
							></textarea>
						</label>
						<button type="button" class="secondary-button" on:click={() => openItemModal(selectedItem)}>
							Abrir editor avançado
						</button>
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
						<div class="text-style-grid">
							<label>
								Peso
								<select
									value={selectedItem.textStyles?.fontWeight || ''}
									on:change={(e) => setTextValue('fontWeight', e.currentTarget.value)}
								>
									<option value="">Herdar</option>
									<option value="300">Light</option>
									<option value="400">Normal</option>
									<option value="500">Medium</option>
									<option value="600">Semibold</option>
									<option value="700">Bold</option>
									<option value="800">Extra Bold</option>
									<option value="900">Black</option>
								</select>
							</label>
							<label>
								Estilo
								<select
									value={selectedItem.textStyles?.fontStyle || ''}
									on:change={(e) => setTextValue('fontStyle', e.currentTarget.value)}
								>
									<option value="">Normal</option>
									<option value="italic">Itálico</option>
								</select>
							</label>
							<label>
								Decoração
								<select
									value={selectedItem.textStyles?.textDecoration || ''}
									on:change={(e) => setTextValue('textDecoration', e.currentTarget.value)}
								>
									<option value="">Nenhuma</option>
									<option value="underline">Sublinhado</option>
									<option value="line-through">Tachado</option>
									<option value="overline">Linha superior</option>
								</select>
							</label>
							<label>
								Transformação
								<select
									value={selectedItem.textStyles?.textTransform || ''}
									on:change={(e) => setTextValue('textTransform', e.currentTarget.value)}
								>
									<option value="">Normal</option>
									<option value="uppercase">Caixa alta</option>
									<option value="lowercase">Caixa baixa</option>
									<option value="capitalize">Capitalizar</option>
								</select>
							</label>
							<label>
								Espaçamento letras
								<input
									type="text"
									placeholder="ex: 0.08em"
									value={selectedItem.textStyles?.letterSpacing || ''}
									on:input={(e) => setTextValue('letterSpacing', e.currentTarget.value)}
								/>
							</label>
							<label>
								Sombra
								<input
									type="text"
									placeholder="ex: 2px 2px 4px rgba(0,0,0,0.4)"
									value={selectedItem.textStyles?.textShadow || ''}
									on:input={(e) => setTextValue('textShadow', e.currentTarget.value)}
								/>
							</label>
						</div>
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
						<button type="button" class="secondary-button" on:click={() => openItemModal(selectedItem)}>
							Abrir editor avançado
						</button>
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

{#if editingItem}
	<div class="free-canvas-modal-backdrop" on:click={closeItemModal}>
		<div class="free-canvas-modal" on:click|stopPropagation>
			<header>
				<h2>
					Editar
					{#if editingItem.type === 'text'}
						texto
					{:else if editingItem.type === 'image'}
						imagem
					{:else if editingItem.type === 'video'}
						vídeo
					{:else}
						{editingItem.type}
					{/if}
				</h2>
				<button type="button" class="toolbar-button" on:click={closeItemModal} title="Fechar">✕</button>
			</header>
			<div class="modal-body">
				{#if editingItem.type === 'text'}
					<RichTextEditor
						value={selectedItem?.content || ''}
						rows={10}
						on:change={(event) => {
							const html = event.detail.value;
							updateItem(selectedItem.id, (draft) => (draft.content = html));
							emit();
						}}
					/>
					<div class="modal-grid">
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
								on:change={(e) => setTextValue('typography', e.currentTarget.value)}
							>
								{#each TYPOGRAPHY_OPTIONS as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</label>
						<label>
							Tamanho desktop
							<input
								type="text"
								placeholder="ex: 32px"
								value={selectedItem.textStyles?.fontSize || ''}
								on:input={(e) => setTextValue('fontSize', e.currentTarget.value)}
							/>
						</label>
						<label>
							Tamanho mobile
							<input
								type="text"
								placeholder="ex: 24px"
								value={selectedItem.textStyles?.fontSizeMobile || ''}
								on:input={(e) => setTextValue('fontSizeMobile', e.currentTarget.value)}
							/>
						</label>
						<label>
							Alinhamento desktop
							<select
								value={selectedItem.textStyles?.textAlign || 'left'}
								on:change={(e) => setTextValue('textAlign', e.currentTarget.value)}
							>
								<option value="left">Esquerda</option>
								<option value="center">Centro</option>
								<option value="right">Direita</option>
							</select>
						</label>
						<label>
							Alinhamento mobile
							<select
								value={selectedItem.textStyles?.textAlignMobile || selectedItem.textStyles?.textAlign || 'left'}
								on:change={(e) => setTextValue('textAlignMobile', e.currentTarget.value)}
							>
								<option value="left">Esquerda</option>
								<option value="center">Centro</option>
								<option value="right">Direita</option>
							</select>
						</label>
					</div>
					<div class="text-style-grid">
						<label>
							Peso
							<select
								value={selectedItem.textStyles?.fontWeight || ''}
								on:change={(e) => setTextValue('fontWeight', e.currentTarget.value)}
							>
								<option value="">Herdar</option>
								<option value="300">Light</option>
								<option value="400">Normal</option>
								<option value="500">Medium</option>
								<option value="600">Semibold</option>
								<option value="700">Bold</option>
								<option value="800">Extra Bold</option>
								<option value="900">Black</option>
							</select>
						</label>
						<label>
							Estilo
							<select
								value={selectedItem.textStyles?.fontStyle || ''}
								on:change={(e) => setTextValue('fontStyle', e.currentTarget.value)}
							>
								<option value="">Normal</option>
								<option value="italic">Itálico</option>
							</select>
						</label>
						<label>
							Decoração
							<select
								value={selectedItem.textStyles?.textDecoration || ''}
								on:change={(e) => setTextValue('textDecoration', e.currentTarget.value)}
							>
								<option value="">Nenhuma</option>
								<option value="underline">Sublinhado</option>
								<option value="line-through">Tachado</option>
								<option value="overline">Linha superior</option>
							</select>
						</label>
						<label>
							Transformação
							<select
								value={selectedItem.textStyles?.textTransform || ''}
								on:change={(e) => setTextValue('textTransform', e.currentTarget.value)}
							>
								<option value="">Normal</option>
								<option value="uppercase">Caixa alta</option>
								<option value="lowercase">Caixa baixa</option>
								<option value="capitalize">Capitalizar</option>
							</select>
						</label>
						<label>
							Espaçamento letras
							<input
								type="text"
								placeholder="ex: 0.08em"
								value={selectedItem.textStyles?.letterSpacing || ''}
								on:input={(e) => setTextValue('letterSpacing', e.currentTarget.value)}
							/>
						</label>
						<label>
							Sombra
							<input
								type="text"
								placeholder="ex: 2px 2px 4px rgba(0,0,0,0.4)"
								value={selectedItem.textStyles?.textShadow || ''}
								on:input={(e) => setTextValue('textShadow', e.currentTarget.value)}
							/>
						</label>
					</div>
					<div class="modal-grid">
						<label>
							Largura ({currentDevice})
							<input
								type="number"
								min="0"
								value={selectedItem[currentDevice].width}
								on:input={(e) => setFrameValue(selectedItem, currentDevice, 'width', e.currentTarget.value)}
							/>
						</label>
						<label>
							Altura ({currentDevice})
							<input
								type="number"
								min="0"
								disabled={selectedItem.autoHeight ?? selectedItem.type === 'text'}
								value={selectedItem[currentDevice].height}
								on:input={(e) => setFrameValue(selectedItem, currentDevice, 'height', e.currentTarget.value)}
							/>
						</label>
						<label>
							Rotação ({currentDevice})
							<input
								type="number"
								value={selectedItem[currentDevice].rotation ?? 0}
								on:input={(e) => setFrameValue(selectedItem, currentDevice, 'rotation', e.currentTarget.value)}
							/>
						</label>
						<label>
							Opacidade ({currentDevice})
							<input
								type="number"
								min="0"
								max="1"
								step="0.05"
								value={selectedItem[currentDevice].opacity ?? 1}
								on:input={(e) => setFrameValue(selectedItem, currentDevice, 'opacity', e.currentTarget.value)}
							/>
						</label>
					</div>
				{:else if editingItem.type === 'image'}
					<div class="modal-preview">
						{#if getPreviewMediaSource(editingItem)}
							<img src={getPreviewMediaSource(editingItem)} alt={editingItem.alt || ''} />
						{:else}
							<span>Insira uma URL de imagem para visualizar</span>
						{/if}
					</div>
					<div class="modal-grid">
						<label>
							Imagem desktop (URL)
							<input
								type="text"
								placeholder="https://..."
								value={editingItem.src || ''}
								on:input={(e) => setItemField(editingItem, 'src', e.currentTarget.value)}
							/>
						</label>
						<label>
							Imagem mobile (URL)
							<input
								type="text"
								placeholder="https://..."
								value={editingItem.srcMobile || ''}
								on:input={(e) => setItemField(editingItem, 'srcMobile', e.currentTarget.value)}
							/>
						</label>
						<label>
							Texto alternativo
							<input
								type="text"
								placeholder="Descrição da imagem"
								value={editingItem.alt || ''}
								on:input={(e) => setItemField(editingItem, 'alt', e.currentTarget.value)}
							/>
						</label>
						<label>
							Ajuste da imagem
							<select
								value={editingItem.objectFit || 'cover'}
								on:change={(e) => setItemField(editingItem, 'objectFit', e.currentTarget.value)}
							>
								{#each OBJECT_FIT_OPTIONS as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</label>
					</div>
					<div class="modal-grid">
						<label>
							Largura ({currentDevice})
							<input
								type="number"
								min="0"
								value={editingItem[currentDevice].width}
								on:input={(e) => setFrameValue(editingItem, currentDevice, 'width', e.currentTarget.value)}
							/>
						</label>
						<label>
							Altura ({currentDevice})
							<input
								type="number"
								min="0"
								value={editingItem[currentDevice].height}
								on:input={(e) => setFrameValue(editingItem, currentDevice, 'height', e.currentTarget.value)}
							/>
						</label>
						<label>
							Rotação ({currentDevice})
							<input
								type="number"
								value={editingItem[currentDevice].rotation ?? 0}
								on:input={(e) => setFrameValue(editingItem, currentDevice, 'rotation', e.currentTarget.value)}
							/>
						</label>
						<label>
							Opacidade ({currentDevice})
							<input
								type="number"
								min="0"
								max="1"
								step="0.05"
								value={editingItem[currentDevice].opacity ?? 1}
								on:input={(e) => setFrameValue(editingItem, currentDevice, 'opacity', e.currentTarget.value)}
							/>
						</label>
					</div>
				{:else if editingItem.type === 'video'}
					<div class="modal-preview">
						{#if getPreviewMediaSource(editingItem)}
							<video
								src={getPreviewMediaSource(editingItem)}
								poster={editingItem.poster || ''}
								controls
								muted
								playsinline
							></video>
						{:else}
							<span>Defina uma URL de vídeo para visualizar</span>
						{/if}
					</div>
					<div class="modal-grid">
						<label>
							Vídeo desktop (URL)
							<input
								type="text"
								placeholder="https://..."
								value={editingItem.src || ''}
								on:input={(e) => setItemField(editingItem, 'src', e.currentTarget.value)}
							/>
						</label>
						<label>
							Vídeo mobile (URL)
							<input
								type="text"
								placeholder="https://..."
								value={editingItem.srcMobile || ''}
								on:input={(e) => setItemField(editingItem, 'srcMobile', e.currentTarget.value)}
							/>
						</label>
						<label>
							Poster desktop (URL)
							<input
								type="text"
								placeholder="https://..."
								value={editingItem.poster || ''}
								on:input={(e) => setItemField(editingItem, 'poster', e.currentTarget.value)}
							/>
						</label>
						<label>
							Poster mobile (URL)
							<input
								type="text"
								placeholder="https://..."
								value={editingItem.posterMobile || ''}
								on:input={(e) => setItemField(editingItem, 'posterMobile', e.currentTarget.value)}
							/>
						</label>
						<label>
							Ajuste do vídeo
							<select
								value={editingItem.objectFit || 'cover'}
								on:change={(e) => setItemField(editingItem, 'objectFit', e.currentTarget.value)}
							>
								{#each OBJECT_FIT_OPTIONS as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</label>
					</div>
					<div class="modal-grid">
						<label>
							Largura ({currentDevice})
							<input
								type="number"
								min="0"
								value={editingItem[currentDevice].width}
								on:input={(e) => setFrameValue(editingItem, currentDevice, 'width', e.currentTarget.value)}
							/>
						</label>
						<label>
							Altura ({currentDevice})
							<input
								type="number"
								min="0"
								value={editingItem[currentDevice].height}
								on:input={(e) => setFrameValue(editingItem, currentDevice, 'height', e.currentTarget.value)}
							/>
						</label>
						<label>
							Rotação ({currentDevice})
							<input
								type="number"
								value={editingItem[currentDevice].rotation ?? 0}
								on:input={(e) => setFrameValue(editingItem, currentDevice, 'rotation', e.currentTarget.value)}
							/>
						</label>
						<label>
							Opacidade ({currentDevice})
							<input
								type="number"
								min="0"
								max="1"
								step="0.05"
								value={editingItem[currentDevice].opacity ?? 1}
								on:input={(e) => setFrameValue(editingItem, currentDevice, 'opacity', e.currentTarget.value)}
							/>
						</label>
					</div>
					<div class="checkbox-row">
						<label class="checkbox">
							<input
								type="checkbox"
								checked={editingItem.autoplay ?? true}
								on:change={(e) => setItemField(editingItem, 'autoplay', e.currentTarget.checked)}
							/>
							Autoplay
						</label>
						<label class="checkbox">
							<input
								type="checkbox"
								checked={editingItem.loop ?? true}
								on:change={(e) => setItemField(editingItem, 'loop', e.currentTarget.checked)}
							/>
							Loop
						</label>
						<label class="checkbox">
							<input
								type="checkbox"
								checked={editingItem.muted ?? true}
								on:change={(e) => setItemField(editingItem, 'muted', e.currentTarget.checked)}
							/>
							Mudo
						</label>
					</div>
				{/if}
			</div>
			<div class="modal-footer">
				<button type="button" class="secondary-button" on:click={closeItemModal}>Fechar</button>
			</div>
		</div>
	</div>
{/if}

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

	.secondary-button {
		align-self: flex-start;
		padding: 0.45rem 0.75rem;
		border-radius: 8px;
		border: 1px solid rgba(148, 163, 184, 0.6);
		background: #f8fafc;
		font-size: 0.85rem;
		cursor: pointer;
		transition: background 0.2s ease, border-color 0.2s ease;
	}

	.secondary-button:hover,
	.secondary-button:focus {
		background: #e2e8f0;
		border-color: rgba(59, 130, 246, 0.45);
		outline: none;
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
		box-sizing: border-box;
		border: 1px solid rgba(148, 163, 184, 0.4);
		border-radius: 10px;
		background: rgba(15, 23, 42, 0.08);
		backdrop-filter: blur(1px);
		cursor: move;
		touch-action: none;
		overflow: hidden;
		transition: box-shadow 0.2s ease, border-color 0.2s ease;
	}

	.preview-item.selected {
		border-color: rgba(59, 130, 246, 0.95);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
	}

	.preview-item__text {
		padding: 0.75rem;
		color: inherit;
		font-size: inherit;
		line-height: inherit;
		pointer-events: none;
	}

	.preview-item__image,
	.preview-item__video {
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none;
	}

	.preview-item__video {
		background: #000;
	}

	.preview-item__placeholder {
		pointer-events: none;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(148, 163, 184, 0.9);
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

	.text-style-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.text-toolbar {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.4rem;
	}

	.toolbar-button {
		border: 1px solid rgba(148, 163, 184, 0.6);
		background: #ffffff;
		border-radius: 6px;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		font-size: 0.9rem;
		line-height: 1;
		color: #0f172a;
		transition: background 0.2s ease, border-color 0.2s ease;
	}

	.toolbar-button:hover,
	.toolbar-button:focus {
		background: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.6);
		outline: none;
	}

	.toolbar-button .underline {
		text-decoration: underline;
	}

	.free-canvas-modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(15, 23, 42, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.free-canvas-modal {
		background: #ffffff;
		color: #0f172a;
		border-radius: 16px;
		box-shadow: 0 20px 40px rgba(15, 23, 42, 0.35);
		width: min(960px, 92vw);
		max-height: 92vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.free-canvas-modal header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.25);
	}

	.free-canvas-modal header h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.free-canvas-modal .modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.free-canvas-modal .modal-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
	}

	.free-canvas-modal .modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid rgba(148, 163, 184, 0.2);
	}

	.free-canvas-modal .modal-preview {
		border: 1px solid rgba(148, 163, 184, 0.4);
		border-radius: 12px;
		padding: 0.75rem;
		background: rgba(241, 245, 249, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.free-canvas-modal .modal-preview img,
	.free-canvas-modal .modal-preview video {
		max-width: 100%;
		max-height: 280px;
		object-fit: contain;
		border-radius: 8px;
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
