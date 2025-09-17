<script>
  import { get } from 'svelte/store';
  import StoryRenderer from '$lib/components/StoryRenderer.svelte';
  import { storyParagraphs, storyStore, selectedBlockId } from '../stores/storyStore.js';
  import { getComponentDefinition } from '../component-registry.js';
  import { sanitizeStoryForExport, buildTypographyCSS } from '../utils.js';

  const paragraphs = storyParagraphs;
  let activeView = 'structure';
  let previewDevice = 'desktop';

  $: exportedStory = sanitizeStoryForExport($storyStore);
  $: appearance = exportedStory.appearance || {};
  $: previewBackground = appearance.useGradient && appearance.gradient
    ? appearance.gradient
    : previewDevice === 'mobile'
      ? appearance.backgroundColorMobile || appearance.backgroundColor || '#0b0d17'
      : appearance.backgroundColor || '#0b0d17';
  $: previewTextColor = appearance.textColor || '#f8fafc';
  $: previewPadding = previewDevice === 'mobile'
    ? appearance.pagePadding?.mobile || '0'
    : appearance.pagePadding?.desktop || '0';
  $: typographyCSS = buildTypographyCSS(appearance.typography, '.preview-frame');

  const selectBlock = (id) => {
    selectedBlockId.set(id);
  };

  const handlePaletteDrop = (event, insertIndex = null) => {
    if (activeView !== 'structure') return;
    event.preventDefault();
    const componentType = event.dataTransfer.getData('application/x-builder-component');
    const blockId = event.dataTransfer.getData('application/x-builder-block');

    if (componentType) {
      const block = storyStore.addBlock(componentType, insertIndex);
      if (block) {
        selectedBlockId.set(block.__id);
      }
      return;
    }

    if (blockId) {
      const targetIndex = insertIndex ?? get(paragraphs).length;
      storyStore.moveBlock(blockId, targetIndex > 0 ? targetIndex : 0);
      selectedBlockId.set(blockId);
    }
  };

  const handleDragOver = (event) => {
    if (activeView !== 'structure') return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleBlockDragStart = (event, block) => {
    event.dataTransfer.setData('application/x-builder-block', block.__id);
    event.dataTransfer.effectAllowed = 'move';
  };

  const removeBlock = (id) => {
    storyStore.removeBlock(id);
    const current = get(selectedBlockId);
    if (current === id) {
      selectedBlockId.set(null);
    }
  };

  const duplicateBlock = (id) => {
    const block = storyStore.duplicateBlock(id);
    if (block) {
      selectedBlockId.set(block.__id);
    }
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    const block = get(paragraphs)[index];
    storyStore.moveBlock(block.__id, index - 1);
  };

  const moveDown = (index) => {
    const blocks = get(paragraphs);
    if (index >= blocks.length - 1) return;
    const block = blocks[index];
    storyStore.moveBlock(block.__id, index + 1);
  };

  const renderSummary = (block) => {
    if (block.type === 'texto' || block.type === 'citacao') {
      return block.text?.replace(/<[^>]+>/g, '').slice(0, 120) || 'Clique para editar o conteúdo';
    }
    if (block.title) return block.title;
    if (block.caption) return block.caption?.replace(/<[^>]+>/g, '');
    if (block.subtitle) return block.subtitle;
    return 'Sem conteúdo configurado ainda';
  };
</script>

<div
  class="canvas"
  role="list"
  aria-label="Editor de blocos da matéria"
  on:dragover|preventDefault={handleDragOver}
  on:drop={handlePaletteDrop}
>
  <div class="canvas-header">
    <div class="view-toggle">
      <button class:active={activeView === 'structure'} on:click={() => (activeView = 'structure')}>
        Estrutura
      </button>
      <button class:active={activeView === 'preview'} on:click={() => (activeView = 'preview')}>
        Preview
      </button>
    </div>

    {#if activeView === 'preview'}
      <div class="device-toggle">
        <button class:active={previewDevice === 'desktop'} on:click={() => (previewDevice = 'desktop')}>
          Desktop
        </button>
        <button class:active={previewDevice === 'mobile'} on:click={() => (previewDevice = 'mobile')}>
          Mobile
        </button>
      </div>
    {/if}
  </div>

  {#if activeView === 'structure'}
    {#if $paragraphs.length === 0}
      <div class="empty-state">
        <p>Arraste um componente para cá ou clique no catálogo à esquerda.</p>
      </div>
    {/if}

    {#each $paragraphs as block, index}
      <div
        class="dropzone"
        role="presentation"
        on:dragover|preventDefault={handleDragOver}
        on:drop={(event) => handlePaletteDrop(event, index)}
      ></div>

      {@const definition = getComponentDefinition(block.type)}

      <article
        class="block"
        class:selected={$selectedBlockId === block.__id}
        draggable
        role="listitem"
        aria-label={`Bloco ${definition?.label || block.type}`}
        data-type={block.type}
        on:dragstart={(event) => handleBlockDragStart(event, block)}
        on:drop|stopPropagation={(event) => handlePaletteDrop(event, index + 1)}
        on:dragover|preventDefault={handleDragOver}
      >
        <div
          class="block-body"
          role="button"
          tabindex="0"
          on:click={() => selectBlock(block.__id)}
          on:keydown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              selectBlock(block.__id);
            }
          }}
        >
          <header>
            <div class="title">
              <span class="icon">{definition?.icon || '📦'}</span>
              <div>
                <strong>{definition?.label || block.type}</strong>
                <small>#{index + 1} · {block.type}</small>
              </div>
            </div>
          </header>
          <div class="summary">
            <p>{renderSummary(block)}</p>
          </div>
        </div>
        <div class="actions">
          <button type="button" on:click|stopPropagation={() => moveUp(index)} title="Mover para cima">↑</button>
          <button type="button" on:click|stopPropagation={() => moveDown(index)} title="Mover para baixo">↓</button>
          <button type="button" on:click|stopPropagation={() => duplicateBlock(block.__id)} title="Duplicar">⧉</button>
          <button type="button" class="danger" on:click|stopPropagation={() => removeBlock(block.__id)} title="Remover">✕</button>
        </div>
      </article>
    {/each}

    <div
      class="dropzone"
      role="presentation"
      on:dragover|preventDefault={handleDragOver}
      on:drop={(event) => handlePaletteDrop(event, $paragraphs.length)}
    ></div>
  {:else}
    <div class={`preview-surface ${previewDevice}`}>
      <div
        class="preview-frame"
        data-theme={appearance.colorScheme || 'default'}
        style={`background:${previewBackground}; color:${previewTextColor}; padding:${previewPadding}; --surface-color:${appearance.surfaceColor || 'transparent'}; --accent-color:${appearance.accentColor || '#f97316'};`}
      >
        {#if typographyCSS}
          {@html `<style>${typographyCSS}</style>`}
        {/if}
        <StoryRenderer storyData={exportedStory} />
      </div>
    </div>
  {/if}
</div>

<style>
  .canvas {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    gap: 0.75rem;
    overflow-y: auto;
    background: #f8fafc;
  }

  .canvas-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .view-toggle,
  .device-toggle {
    display: inline-flex;
    gap: 0.5rem;
    background: #e2e8f0;
    padding: 0.25rem;
    border-radius: 999px;
  }

  .view-toggle button,
  .device-toggle button {
    border: none;
    background: transparent;
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    font-size: 0.8rem;
    color: #475569;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .view-toggle button.active,
  .device-toggle button.active {
    background: #111827;
    color: #f8fafc;
  }

  .empty-state {
    border: 2px dashed #94a3b8;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    color: #64748b;
    font-size: 0.95rem;
    background: #fff;
  }

  .dropzone {
    height: 16px;
    border: 2px dashed transparent;
    transition: background 0.1s ease;
  }

  .dropzone:hover,
  .dropzone.drag-over {
    background: rgba(37, 99, 235, 0.1);
    border-color: rgba(37, 99, 235, 0.4);
  }

  .block {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .block-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 1.25rem 0.5rem;
    text-align: left;
    cursor: pointer;
  }

  .block-body:focus {
    outline: none;
  }

  .block:hover {
    border-color: #cbd5f5;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  }

  .block.selected {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .icon {
    font-size: 1.35rem;
  }

  .summary p {
    margin: 0;
    color: #475569;
    font-size: 0.85rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.25rem;
    padding: 0 1.25rem 0.75rem;
  }

  .actions button {
    border: none;
    background: #e2e8f0;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .actions button:hover {
    background: #cbd5f5;
  }

  .actions .danger {
    background: #fee2e2;
    color: #b91c1c;
  }

  .preview-surface {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: auto;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
    background: #0f172a;
  }

  .preview-surface.desktop {
    padding: 2rem 3rem;
  }

  .preview-surface.mobile {
    padding: 2rem 1.5rem;
  }

  .preview-frame {
    width: 100%;
    max-width: 1280px;
    border-radius: 28px;
    min-height: 80vh;
    box-shadow: 0 25px 40px rgba(15, 23, 42, 0.2);
    box-sizing: border-box;
  }

  .preview-surface.mobile .preview-frame {
    max-width: 420px;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 30px 45px rgba(15, 23, 42, 0.3);
  }

  .preview-frame :global(article.story-content) {
    margin: 0 auto;
  }
</style>
