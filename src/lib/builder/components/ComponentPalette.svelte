<script>
  import { listComponentsByCategory } from '$lib/builder/component-registry.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const categories = listComponentsByCategory();
  const entries = Object.entries(categories);

  const handleDragStart = (event, component) => {
    event.dataTransfer.setData('application/x-builder-component', component.type);
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddClick = (component) => {
    dispatch('add', { type: component.type });
  };
</script>

<div class="palette">
  {#each entries as [category, components]}
    <section class="category">
      <h3>{category}</h3>
      <div class="components">
        {#each components as component}
          <button
            class="component-card"
            draggable
            on:dragstart={(event) => handleDragStart(event, component)}
            on:click={() => handleAddClick(component)}
            title={component.description}
          >
            <span class="icon">{component.icon}</span>
            <div class="info">
              <strong>{component.label}</strong>
              <small>{component.description}</small>
            </div>
          </button>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  .palette {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    overflow-y: auto;
    max-height: calc(100vh - 120px);
  }

  .category h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .components {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .component-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    cursor: grab;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
    text-align: left;
  }

  .component-card:active {
    cursor: grabbing;
  }

  .component-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  }

  .icon {
    font-size: 1.5rem;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .info strong {
    font-size: 0.9rem;
    color: #0f172a;
  }

  .info small {
    font-size: 0.75rem;
    color: #64748b;
  }
</style>
