<!-- src/lib/components/builder/controls/ColorPicker.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let value = '#000000';
  export let label = 'Cor';
  export let showPresets = true;
  export let showInput = true;
  export let presets = [
    '#000000', '#ffffff', '#f3f4f6', '#374151',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#ec4899', '#f43f5e', '#84cc16', '#10b981'
  ];
  
  $: {
    if (typeof value !== 'string') {
      value = '#000000';
    }
  }

  $: normalizedValue = typeof value === 'string' ? value : '#000000';

  function handleChange(newValue) {
    const next = typeof newValue === 'string' ? newValue : '#000000';
    value = next;
    dispatch('change', { value: next });
  }
  
  function selectPreset(color) {
    handleChange(color);
  }
</script>

<div class="color-picker">
  {#if label}
    <label class="color-label">{label}:</label>
  {/if}
  
  <div class="color-controls">
    <div class="color-input-group">
        <input 
          type="color" 
          value={normalizedValue}
          on:input={(e) => handleChange(e.target.value)}
          class="color-swatch"
          title="Selecionar cor"
        />
      
      {#if showInput}
        <input 
          type="text" 
          value={normalizedValue}
          on:input={(e) => handleChange(e.target.value)}
          class="color-text"
          placeholder="#000000"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      {/if}
    </div>
    
    {#if showPresets && presets.length > 0}
      <div class="color-presets">
        {#each presets as preset}
          <button 
            class="color-preset" 
            class:active={normalizedValue.toLowerCase() === preset.toLowerCase()}
            style="background-color: {preset}"
            on:click={() => selectPreset(preset)}
            title={preset}
          >
            {#if normalizedValue.toLowerCase() === preset.toLowerCase()}
              <span class="check-mark">✓</span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .color-picker {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .color-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin: 0;
  }

  .color-controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .color-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .color-swatch {
    width: 44px;
    height: 44px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: none;
    padding: 0;
  }

  .color-swatch:hover {
    border-color: #3b82f6;
    transform: scale(1.05);
  }

  .color-swatch:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .color-text {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    font-family: monospace;
    background: white;
    transition: border-color 0.2s ease;
  }

  .color-text:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .color-text:invalid {
    border-color: #ef4444;
  }

  .color-presets {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
    gap: 0.5rem;
    max-width: 100%;
  }

  .color-preset {
    position: relative;
    width: 32px;
    height: 32px;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }

  .color-preset:hover {
    transform: scale(1.1);
    border-color: #6b7280;
    z-index: 1;
  }

  .color-preset.active {
    border-color: #3b82f6;
    border-width: 3px;
    transform: scale(1.05);
  }

  .check-mark {
    font-weight: bold;
    font-size: 0.625rem;
  }

  /* Special handling for white/light colors */
  .color-preset[style*="#ffffff"],
  .color-preset[style*="#f3f4f6"] {
    color: #374151;
    text-shadow: none;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .color-presets {
      grid-template-columns: repeat(8, 1fr);
    }
  }
</style>
