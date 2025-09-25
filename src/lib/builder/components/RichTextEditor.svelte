<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { tick } from 'svelte';

	export let value = '';
	export let placeholder = '';
	export let rows = 6;

	const dispatch = createEventDispatcher();
	let editorEl;
	let isFocused = false;
	let sanitizedRows = 6;
	$: sanitizedRows = Math.max(Number(rows) || 0, 1);
	let isUnorderedListActive = false;
	let isOrderedListActive = false;
	const exec = (command, arg = null) => {
		if (!editorEl) return;
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;
		const range = selection.getRangeAt(0);
		if (range.collapsed && !['insertUnorderedList', 'insertOrderedList'].includes(command)) return;
		editorEl.focus();
		const before = editorEl.innerHTML;
		const commandIsList = ['insertUnorderedList', 'insertOrderedList'].includes(command);
		const listTag = command === 'insertOrderedList' ? 'ol' : 'ul';
		const rangeSnapshot = range.cloneRange();

		const runNative = () => document.execCommand(command, false, arg);

		let success = runNative();
		if (commandIsList && (!success || editorEl.innerHTML === before)) {
			// manual fallback
			const fragment = rangeSnapshot.extractContents();
			const list = document.createElement(listTag);

			const finalizeLi = (current) => {
				if (!current) return null;
				if (!current.hasChildNodes()) {
					current.appendChild(document.createElement('br'));
				}
				list.appendChild(current);
				return null;
			};

			let currentLi = null;
			const nodes = Array.from(fragment.childNodes);
			nodes.forEach((node) => {
				if (node.nodeName === 'BR') {
					currentLi = finalizeLi(currentLi);
					return;
				}

				if (!currentLi) {
					currentLi = document.createElement('li');
				}

				if (node.nodeName === 'P' || node.nodeName === 'DIV' || node.nodeName === 'LI') {
					while (node.firstChild) {
						currentLi.appendChild(node.firstChild);
					}
				} else {
					currentLi.appendChild(node);
				}
			});

			currentLi = finalizeLi(currentLi);

			if (!list.hasChildNodes()) {
				const li = document.createElement('li');
				li.appendChild(document.createElement('br'));
				list.appendChild(li);
			}

			rangeSnapshot.insertNode(list);

			// posiciona cursor no primeiro item
			const newRange = document.createRange();
			const firstLi = list.querySelector('li') || list;
			newRange.setStart(firstLi, 0);
			newRange.collapse(true);
			selection.removeAllRanges();
			selection.addRange(newRange);

			success = true;
		}

		if (!success && commandIsList) {
			try {
				document.execCommand('formatBlock', false, 'p');
				runNative();
				success = true;
			} catch (error) {
				success = false;
			}
		}

		emit();
		updateActiveListState();
	};

	const emit = () => {
		const html = (editorEl?.innerHTML || '').trim();
		dispatch('change', { value: html });
	};

	const insertLink = () => {
		const selection = document.getSelection();
		const current = selection?.toString();
		const url = prompt('Digite o URL do link:', current?.startsWith('http') ? current : 'https://');
		if (!url) {
			if (selection?.rangeCount) {
				exec('unlink');
			}
			return;
		}
		exec('createLink', url);
	};

	const applyColor = (color) => {
		editorEl?.focus();
		exec('foreColor', color);
	};

	const handleInput = () => {
		emit();
	};

	const handlePaste = (event) => {
		event.preventDefault();
		const text = event.clipboardData.getData('text/plain');
		document.execCommand('insertText', false, text);
		emit();
	};

	const handleKeydown = (event) => {
		if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
			event.preventDefault();
			insertLink();
		}
		if ((event.metaKey || event.ctrlKey) && ['b', 'i', 'u'].includes(event.key.toLowerCase())) {
			const selection = window.getSelection();
			if (!selection || selection.rangeCount === 0 || selection.getRangeAt(0).collapsed) {
				event.preventDefault();
				return;
			}
		}
	};

	$: if (editorEl && !isFocused) {
		const current = editorEl.innerHTML;
		const next = value || '';
		if (current !== next) {
			editorEl.innerHTML = next;
		}
	}

	const updateActiveListState = () => {
		if (!editorEl) return;
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) {
			isOrderedListActive = false;
			isUnorderedListActive = false;
			return;
		}
		const anchor = selection.anchorNode;
		if (!anchor || !editorEl.contains(anchor)) {
			isOrderedListActive = false;
			isUnorderedListActive = false;
			return;
		}
		const element = anchor.nodeType === Node.ELEMENT_NODE ? anchor : anchor.parentElement;
		isOrderedListActive = Boolean(element?.closest('ol'));
		isUnorderedListActive = Boolean(element?.closest('ul'));
	};

	onMount(async () => {
		await tick();
		if (editorEl && value) {
			editorEl.innerHTML = value;
		}

		try {
			document.execCommand('defaultParagraphSeparator', false, 'p');
		} catch (error) {
			// ignore browsers without support
		}

		document.addEventListener('selectionchange', updateActiveListState);
		updateActiveListState();

		return () => {
			document.removeEventListener('selectionchange', updateActiveListState);
		};
	});
</script>

<div class="rt-wrapper">
	<div class="rt-toolbar" role="toolbar" aria-label="Ferramentas de formatação">
		<button
			type="button"
			on:mousedown|preventDefault
			on:click={() => exec('bold')}
			title="Negrito (Ctrl/Cmd + B)"><strong>B</strong></button
		>
		<button
			type="button"
			on:mousedown|preventDefault
			on:click={() => exec('italic')}
			title="Itálico (Ctrl/Cmd + I)"><em>I</em></button
		>
		<button
			type="button"
			on:mousedown|preventDefault
			on:click={() => exec('underline')}
			title="Sublinhado (Ctrl/Cmd + U)"><u>U</u></button
		>
		<button
			type="button"
			on:mousedown|preventDefault
			on:click={() => exec('strikeThrough')}
			title="Tachado">S</button
		>
		<span class="rt-divider" aria-hidden="true"></span>
		<button
			type="button"
			class:active={isUnorderedListActive}
			on:mousedown|preventDefault
			on:click={() => exec('insertUnorderedList')}
			title="Lista com marcadores">•≡</button
		>
		<button
			type="button"
			class:active={isOrderedListActive}
			on:mousedown|preventDefault
			on:click={() => exec('insertOrderedList')}
			title="Lista numerada">1.</button
		>
		<button type="button" on:mousedown|preventDefault on:click={insertLink} title="Inserir link"
			>🔗</button
		>
		<span class="rt-divider" aria-hidden="true"></span>
		<label class="rt-color" title="Cor do texto">
			<input
				type="color"
				on:mousedown={(event) => {
					event.preventDefault();
					editorEl?.focus();
				}}
				on:input={(event) => applyColor(event.target.value)}
			/>
		</label>
		<button
			type="button"
			on:mousedown|preventDefault
			on:click={() => exec('removeFormat')}
			title="Remover formatação">⟲</button
		>
	</div>

	<div
		class="rt-editor"
		class:empty={!value}
		contenteditable
		role="textbox"
		aria-multiline="true"
		aria-label={placeholder}
		bind:this={editorEl}
		data-placeholder={placeholder}
		style={`min-height: calc(${sanitizedRows} * 1.4rem);`}
		on:input={handleInput}
		on:paste={handlePaste}
		on:keydown={handleKeydown}
		on:focus={() => {
			isFocused = true;
		}}
		on:blur={() => {
			isFocused = false;
			emit();
		}}
	></div>
</div>

<style>
	.rt-wrapper {
		display: flex;
		flex-direction: column;
		border: 1px solid #cbd5f5;
		border-radius: 10px;
		background: #fff;
		overflow: hidden;
		box-shadow: inset 0 1px 2px rgba(148, 163, 184, 0.12);
	}

	.rt-toolbar {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.45rem;
		background: #f1f5f9;
		border-bottom: 1px solid #cbd5f5;
		flex-wrap: wrap;
	}

	.rt-toolbar button {
		border: none;
		background: #fff;
		color: #1f2937;
		border-radius: 8px;
		padding: 0.32rem 0.55rem;
		font-size: 0.85rem;
		cursor: pointer;
		transition:
			background 0.2s ease,
			box-shadow 0.2s ease;
	}

	.rt-toolbar button:hover,
	.rt-toolbar button:focus {
		background: #e2e8f0;
		outline: none;
	}

	.rt-toolbar button.active {
		background: #1d4ed8;
		color: #fff;
		box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.2);
	}

	.rt-divider {
		width: 1px;
		align-self: stretch;
		background: rgba(148, 163, 184, 0.4);
	}

	.rt-color input[type='color'] {
		border: none;
		background: transparent;
		padding: 0;
		width: 24px;
		height: 24px;
		cursor: pointer;
	}

	.rt-editor {
		padding: 0.8rem 1rem;
		font-size: 0.95rem;
		line-height: 1.6;
		color: #0f172a;
		outline: none;
		word-break: break-word;
	}

	.rt-editor ul {
		padding-left: 1.4rem;
		list-style: disc;
		margin: 0.5rem 0;
	}

	.rt-editor ol {
		padding-left: 1.4rem;
		list-style: decimal;
		margin: 0.5rem 0;
	}

	.rt-editor.empty::before {
		content: attr(data-placeholder);
		color: #94a3b8;
		pointer-events: none;
		display: block;
	}
</style>
