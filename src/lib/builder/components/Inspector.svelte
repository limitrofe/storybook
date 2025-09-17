<script>
  import { get } from 'svelte/store';
  import FieldEditor from './FieldEditor.svelte';
  import { storyStore, selectedBlock, selectedBlockId } from '../stores/storyStore.js';
  import { metadataFields, creditsFields } from '../story-defaults.js';
  import { getComponentDefinition } from '../component-registry.js';
  import { getByPath, removeInternalFields } from '../utils.js';

  let activeSection = 'block';
  let rawJson = '';
  let jsonError = '';

  $: block = $selectedBlock;
  $: definition = block ? getComponentDefinition(block.type) : null;
  $: if (block) {
    rawJson = JSON.stringify(removeInternalFields(block), null, 2);
  }

  const handleMetadataChange = (path, event) => {
    storyStore.updateMetadata(path, event.detail.value);
  };

  const handleBlockFieldChange = (path, event) => {
    const blockId = get(selectedBlockId);
    if (!blockId) return;
    storyStore.updateBlockField(blockId, path, event.detail.value);
  };

  const handleBlockJsonBlur = () => {
    const blockId = get(selectedBlockId);
    if (!blockId) return;

    try {
      const parsed = JSON.parse(rawJson);
      jsonError = '';
      storyStore.replaceBlock(blockId, { ...parsed, type: parsed.type || block.type });
    } catch (error) {
      jsonError = error.message;
    }
  };
</script>

<div class="inspector">
  <div class="tabs">
    <button class:active={activeSection === 'block'} on:click={() => (activeSection = 'block')}>
      Bloco selecionado
    </button>
    <button class:active={activeSection === 'story'} on:click={() => (activeSection = 'story')}>
      Metadados
    </button>
  </div>

  {#if activeSection === 'story'}
    <section>
      <h3>Informações da história</h3>
      <div class="fields">
        {#each metadataFields as field}
          <FieldEditor
            {field}
            value={getByPath($storyStore, field.path)}
            on:change={(event) => handleMetadataChange(field.path, event)}
          />
        {/each}
      </div>

      <h4>Créditos</h4>
      <div class="fields">
        {#each creditsFields as field}
          <FieldEditor
            {field}
            value={getByPath($storyStore, field.path)}
            on:change={(event) => handleMetadataChange(field.path, event)}
          />
        {/each}
      </div>
    </section>
  {:else}
    <section>
      {#if block && definition}
        <header class="section-header">
          <div class="title">
            <span class="icon">{definition.icon}</span>
            <div>
              <h3>{definition.label}</h3>
              <small>{block.type}</small>
            </div>
          </div>
          <button class="clear-selection" type="button" on:click={() => selectedBlockId.set(null)}>
            limpar seleção
          </button>
        </header>

        {#if definition.fields?.length}
          <div class="fields">
            {#each definition.fields as field}
              <FieldEditor
                {field}
                value={getByPath(block, field.path)}
                on:change={(event) => handleBlockFieldChange(field.path, event)}
              />
            {/each}
          </div>
        {:else}
          <p>Este componente não tem um formulário configurado. Edite via JSON bruto abaixo.</p>
        {/if}

        <details class="advanced">
          <summary>Edição avançada (JSON)</summary>
          <textarea rows="10" bind:value={rawJson} on:blur={handleBlockJsonBlur}></textarea>
          {#if jsonError}
            <small class="error">{jsonError}</small>
          {/if}
        </details>
      {:else}
        <div class="empty-state">
          <p>Selecione um bloco na área central para editar as configurações.</p>
        </div>
      {/if}
    </section>
  {/if}
</div>

<style>
  .inspector {
    width: 340px;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #e2e8f0;
    background: #ffffff;
    max-height: calc(100vh - 80px);
  }

  .tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    border-bottom: 1px solid #e2e8f0;
  }

  .tabs button {
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    color: #475569;
  }

  .tabs button.active {
    background: #edf2ff;
    color: #1d4ed8;
    position: relative;
  }

  section {
    padding: 1.25rem;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  h3 {
    font-size: 1rem;
    margin: 0 0 0.75rem;
    color: #111827;
  }

  h4 {
    font-size: 0.85rem;
    margin: 0 0 0.5rem;
    color: #1f2937;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .title h3 {
    margin: 0;
    font-size: 0.95rem;
  }

  .title small {
    color: #94a3b8;
    font-size: 0.75rem;
  }

  .icon {
    font-size: 1.3rem;
  }

  .clear-selection {
    border: none;
    background: transparent;
    font-size: 0.75rem;
    color: #64748b;
    cursor: pointer;
  }

  .clear-selection:hover {
    color: #1d4ed8;
  }

  .advanced {
    border-top: 1px solid #e2e8f0;
    padding-top: 1rem;
  }

  .advanced textarea {
    width: 100%;
    margin-top: 0.5rem;
    border-radius: 8px;
    padding: 0.5rem;
    border: 1px solid #cbd5f5;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    background: #0f172a;
    color: #e2e8f0;
  }

  .advanced summary {
    cursor: pointer;
    font-size: 0.85rem;
    color: #1d4ed8;
  }

  .error {
    color: #dc2626;
  }

  .empty-state {
    border: 2px dashed #94a3b8;
    padding: 2rem 1rem;
    text-align: center;
    color: #64748b;
    border-radius: 12px;
  }
</style>
