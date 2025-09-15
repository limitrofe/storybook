<!-- SuperFlexEditor.svelte - Interface Visual Completa -->
<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let data = {
    container: {
      height: { desktop: '100vh', mobile: '80vh' },
      backgroundColor: '#000000',
      backgroundImage: { desktop: '', mobile: '' },
      backgroundVideo: { desktop: '', mobile: '' },
      padding: { desktop: '2rem', mobile: '1rem' },
      display: 'flex',
      flexDirection: { desktop: 'row', mobile: 'column' },
      alignItems: { desktop: 'center', mobile: 'center' },
      justifyContent: { desktop: 'center', mobile: 'center' }
    },
    items: []
  };

  let activeTab = 'container';
  let selectedItem = null;
  let deviceMode = 'desktop';

  // Tipos de elementos disponíveis
  const elementTypes = [
    { id: 'text', name: 'Texto', icon: '📝' },
    { id: 'titulo', name: 'Título', icon: '📰' },
    { id: 'subtitulo', name: 'Subtítulo', icon: '🏷️' },
    { id: 'intertitulo', name: 'Intertítulo', icon: '📑' },
    { id: 'image', name: 'Foto/Imagem', icon: '🖼️' },
    { id: 'video', name: 'Vídeo', icon: '🎥' },
    { id: 'flourish', name: 'Flourish', icon: '📊' },
    { id: 'scrolly', name: 'Scrolly', icon: '📜' }
  ];

  // Adicionar novo elemento
  function addElement(type) {
    const newElement = {
      id: Date.now(),
      type: type,
      content: getDefaultContent(type),
      position: { desktop: 'relative', mobile: 'relative' },
      styles: getDefaultStyles(type)
    };
    
    data.items = [...data.items, newElement];
    selectedItem = newElement.id;
    updateParent();
  }

  function getDefaultContent(type) {
    switch(type) {
      case 'titulo': return '<h1>Título Principal</h1>';
      case 'subtitulo': return '<h2>Subtítulo</h2>';
      case 'intertitulo': return '<h3>Intertítulo</h3>';
      case 'text': return '<p>Texto do parágrafo aqui...</p>';
      case 'image': return { desktop: 'https://via.placeholder.com/400x300', mobile: 'https://via.placeholder.com/300x200' };
      case 'video': return { src: '', poster: '' };
      case 'flourish': return { embedId: '', height: '400px' };
      case 'scrolly': return { steps: [], height: '400vh' };
      default: return '<p>Elemento ' + type + '</p>';
    }
  }

  function getDefaultStyles(type) {
    const baseStyles = {
      margin: { desktop: '1rem', mobile: '0.5rem' },
      padding: { desktop: '1rem', mobile: '0.5rem' },
      color: '#ffffff',
      textAlign: { desktop: 'left', mobile: 'left' },
      zIndex: '1'
    };

    switch(type) {
      case 'titulo':
        return {
          ...baseStyles,
          fontSize: { desktop: '3rem', mobile: '2rem' },
          fontWeight: { desktop: '700', mobile: '700' },
          fontFamily: 'Obviously, serif'
        };
      case 'subtitulo':
        return {
          ...baseStyles,
          fontSize: { desktop: '1.5rem', mobile: '1.2rem' },
          fontWeight: { desktop: '400', mobile: '400' }
        };
      case 'intertitulo':
        return {
          ...baseStyles,
          fontSize: { desktop: '2rem', mobile: '1.5rem' },
          fontWeight: { desktop: '600', mobile: '600' }
        };
      case 'image':
        return {
          ...baseStyles,
          width: { desktop: '400px', mobile: '300px' },
          height: { desktop: 'auto', mobile: 'auto' },
          borderRadius: { desktop: '8px', mobile: '8px' }
        };
      default:
        return {
          ...baseStyles,
          fontSize: { desktop: '1rem', mobile: '1rem' }
        };
    }
  }

  function removeElement(id) {
    data.items = data.items.filter(item => item.id !== id);
    if (selectedItem === id) selectedItem = null;
    updateParent();
  }

  function updateParent() {
    dispatch('update');
  }

  // Presets de cores
  const colorPresets = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#000080', '#008000'
  ];
</script>

<div class="superflex-editor">
  
  <!-- Device Mode Toggle -->
  <div class="device-toggle">
    <button 
      class="device-btn" 
      class:active={deviceMode === 'desktop'}
      on:click={() => deviceMode = 'desktop'}
    >
      🖥️ Desktop
    </button>
    <button 
      class="device-btn" 
      class:active={deviceMode === 'mobile'}
      on:click={() => deviceMode = 'mobile'}
    >
      📱 Mobile
    </button>
  </div>

  <!-- Main Tabs -->
  <div class="tabs">
    <button 
      class="tab" 
      class:active={activeTab === 'container'}
      on:click={() => activeTab = 'container'}
    >
      📦 Container
    </button>
    <button 
      class="tab" 
      class:active={activeTab === 'elements'}
      on:click={() => activeTab = 'elements'}
    >
      🧩 Elementos ({data.items.length})
    </button>
  </div>

  <div class="tab-content">
    
    {#if activeTab === 'container'}
      <!-- CONTAINER SETTINGS -->
      <div class="container-settings">
        
        <!-- Background -->
        <div class="section">
          <h3>🎨 Background</h3>
          
          <div class="field-group">
            <label>Cor de Fundo:</label>
            <div class="color-picker">
              <input 
                type="color" 
                bind:value={data.container.backgroundColor} 
                on:input={updateParent}
              />
              <input 
                type="text" 
                bind:value={data.container.backgroundColor} 
                on:input={updateParent}
                placeholder="#000000"
              />
            </div>
            
            <div class="color-presets">
              {#each colorPresets as color}
                <button 
                  class="color-preset" 
                  style="background-color: {color}"
                  on:click={() => { data.container.backgroundColor = color; updateParent(); }}
                ></button>
              {/each}
            </div>
          </div>

          <div class="field-group">
            <label>Imagem de Fundo ({deviceMode}):</label>
            <input 
              type="url" 
              bind:value={data.container.backgroundImage[deviceMode]} 
              on:input={updateParent}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div class="field-group">
            <label>Vídeo de Fundo ({deviceMode}):</label>
            <input 
              type="url" 
              bind:value={data.container.backgroundVideo[deviceMode]} 
              on:input={updateParent}
              placeholder="https://exemplo.com/video.mp4"
            />
          </div>
        </div>

        <!-- Dimensions -->
        <div class="section">
          <h3>📏 Dimensões</h3>
          
          <div class="field-group">
            <label>Altura ({deviceMode}):</label>
            <select bind:value={data.container.height[deviceMode]} on:change={updateParent}>
              <option value="100vh">Tela cheia (100vh)</option>
              <option value="80vh">80% da tela (80vh)</option>
              <option value="60vh">60% da tela (60vh)</option>
              <option value="500px">500px</option>
              <option value="300px">300px</option>
              <option value="auto">Automático</option>
            </select>
          </div>

          <div class="field-group">
            <label>Padding ({deviceMode}):</label>
            <select bind:value={data.container.padding[deviceMode]} on:change={updateParent}>
              <option value="0">Sem padding</option>
              <option value="1rem">Pequeno (1rem)</option>
              <option value="2rem">Médio (2rem)</option>
              <option value="3rem">Grande (3rem)</option>
              <option value="4rem">Extra grande (4rem)</option>
            </select>
          </div>
        </div>

        <!-- Layout -->
        <div class="section">
          <h3>📐 Layout</h3>
          
          <div class="field-group">
            <label>Direção ({deviceMode}):</label>
            <div class="button-group">
              <button 
                class="layout-btn" 
                class:active={data.container.flexDirection[deviceMode] === 'row'}
                on:click={() => { data.container.flexDirection[deviceMode] = 'row'; updateParent(); }}
              >
                ➡️ Horizontal
              </button>
              <button 
                class="layout-btn" 
                class:active={data.container.flexDirection[deviceMode] === 'column'}
                on:click={() => { data.container.flexDirection[deviceMode] = 'column'; updateParent(); }}
              >
                ⬇️ Vertical
              </button>
            </div>
          </div>

          <div class="field-group">
            <label>Alinhamento ({deviceMode}):</label>
            <select bind:value={data.container.alignItems[deviceMode]} on:change={updateParent}>
              <option value="flex-start">Início</option>
              <option value="center">Centro</option>
              <option value="flex-end">Fim</option>
              <option value="stretch">Esticar</option>
            </select>
          </div>

          <div class="field-group">
            <label>Justificação ({deviceMode}):</label>
            <select bind:value={data.container.justifyContent[deviceMode]} on:change={updateParent}>
              <option value="flex-start">Início</option>
              <option value="center">Centro</option>
              <option value="flex-end">Fim</option>
              <option value="space-between">Espaçado</option>
              <option value="space-around">Em volta</option>
            </select>
          </div>
        </div>

      </div>
      
    {:else if activeTab === 'elements'}
      <!-- ELEMENTS SETTINGS -->
      <div class="elements-settings">
        
        <!-- Add Element -->
        <div class="add-element">
          <h3>➕ Adicionar Elemento</h3>
          <div class="element-types">
            {#each elementTypes as type}
              <button 
                class="add-element-btn"
                on:click={() => addElement(type.id)}
              >
                <span class="element-icon">{type.icon}</span>
                <span class="element-name">{type.name}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Elements List -->
        <div class="elements-list">
          {#each data.items as element}
            <div class="element-item" class:selected={selectedItem === element.id}>
              
              <div class="element-header" on:click={() => selectedItem = selectedItem === element.id ? null : element.id}>
                <span class="element-info">
                  {elementTypes.find(t => t.id === element.type)?.icon || '📦'} 
                  {elementTypes.find(t => t.id === element.type)?.name || element.type}
                </span>
                <div class="element-actions">
                  <button class="remove-btn" on:click|stopPropagation={() => removeElement(element.id)}>
                    ❌
                  </button>
                </div>
              </div>

              {#if selectedItem === element.id}
                <div class="element-editor">
                  
                  <!-- Content Editor -->
                  <div class="section">
                    <h4>📝 Conteúdo</h4>
                    
                    {#if element.type === 'text' || element.type === 'titulo' || element.type === 'subtitulo' || element.type === 'intertitulo'}
                      <textarea 
                        bind:value={element.content} 
                        on:input={updateParent}
                        rows="3"
                        placeholder="Conteúdo HTML..."
                      ></textarea>
                    {:else if element.type === 'image'}
                      <div class="field-group">
                        <label>Imagem Desktop:</label>
                        <input 
                          type="url" 
                          bind:value={element.content.desktop} 
                          on:input={updateParent}
                          placeholder="https://exemplo.com/imagem-desktop.jpg"
                        />
                      </div>
                      <div class="field-group">
                        <label>Imagem Mobile:</label>
                        <input 
                          type="url" 
                          bind:value={element.content.mobile} 
                          on:input={updateParent}
                          placeholder="https://exemplo.com/imagem-mobile.jpg"
                        />
                      </div>
                    {/if}
                  </div>

                  <!-- Style Editor -->
                  <div class="section">
                    <h4>🎨 Estilo ({deviceMode})</h4>
                    
                    {#if element.type !== 'image'}
                      <!-- Text Styles -->
                      <div class="field-group">
                        <label>Cor do Texto:</label>
                        <div class="color-picker">
                          <input 
                            type="color" 
                            bind:value={element.styles.color} 
                            on:input={updateParent}
                          />
                          <input 
                            type="text" 
                            bind:value={element.styles.color} 
                            on:input={updateParent}
                          />
                        </div>
                      </div>

                      <div class="field-group">
                        <label>Tamanho da Fonte ({deviceMode}):</label>
                        <select bind:value={element.styles.fontSize[deviceMode]} on:change={updateParent}>
                          <option value="0.875rem">Pequeno (0.875rem)</option>
                          <option value="1rem">Normal (1rem)</option>
                          <option value="1.25rem">Médio (1.25rem)</option>
                          <option value="1.5rem">Grande (1.5rem)</option>
                          <option value="2rem">Extra Grande (2rem)</option>
                          <option value="3rem">Título (3rem)</option>
                          <option value="4rem">Mega (4rem)</option>
                        </select>
                      </div>

                      <div class="field-group">
                        <label>Peso da Fonte ({deviceMode}):</label>
                        <select bind:value={element.styles.fontWeight[deviceMode]} on:change={updateParent}>
                          <option value="300">Light (300)</option>
                          <option value="400">Normal (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">Semibold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">Extra Bold (800)</option>
                        </select>
                      </div>

                      <div class="field-group">
                        <label>Alinhamento de Texto ({deviceMode}):</label>
                        <div class="button-group">
                          <button 
                            class="align-btn" 
                            class:active={element.styles.textAlign[deviceMode] === 'left'}
                            on:click={() => { element.styles.textAlign[deviceMode] = 'left'; updateParent(); }}
                          >
                            ⬅️
                          </button>
                          <button 
                            class="align-btn" 
                            class:active={element.styles.textAlign[deviceMode] === 'center'}
                            on:click={() => { element.styles.textAlign[deviceMode] = 'center'; updateParent(); }}
                          >
                            ↔️
                          </button>
                          <button 
                            class="align-btn" 
                            class:active={element.styles.textAlign[deviceMode] === 'right'}
                            on:click={() => { element.styles.textAlign[deviceMode] = 'right'; updateParent(); }}
                          >
                            ➡️
                          </button>
                        </div>
                      </div>
                    {/if}

                    <!-- Spacing -->
                    <div class="field-group">
                      <label>Margem ({deviceMode}):</label>
                      <select bind:value={element.styles.margin[deviceMode]} on:change={updateParent}>
                        <option value="0">Sem margem</option>
                        <option value="0.5rem">Pequena (0.5rem)</option>
                        <option value="1rem">Média (1rem)</option>
                        <option value="2rem">Grande (2rem)</option>
                        <option value="3rem">Extra grande (3rem)</option>
                      </select>
                    </div>

                    <div class="field-group">
                      <label>Padding ({deviceMode}):</label>
                      <select bind:value={element.styles.padding[deviceMode]} on:change={updateParent}>
                        <option value="0">Sem padding</option>
                        <option value="0.5rem">Pequeno (0.5rem)</option>
                        <option value="1rem">Médio (1rem)</option>
                        <option value="2rem">Grande (2rem)</option>
                        <option value="3rem">Extra grande (3rem)</option>
                      </select>
                    </div>

                    <!-- Position -->
                    <div class="field-group">
                      <label>Posição ({deviceMode}):</label>
                      <div class="button-group">
                        <button 
                          class="position-btn" 
                          class:active={element.position[deviceMode] === 'relative'}
                          on:click={() => { element.position[deviceMode] = 'relative'; updateParent(); }}
                        >
                          📍 Relativa
                        </button>
                        <button 
                          class="position-btn" 
                          class:active={element.position[deviceMode] === 'absolute'}
                          on:click={() => { element.position[deviceMode] = 'absolute'; updateParent(); }}
                        >
                          🎯 Absoluta
                        </button>
                      </div>
                    </div>

                    {#if element.type === 'image'}
                      <!-- Image specific styles -->
                      <div class="field-group">
                        <label>Largura ({deviceMode}):</label>
                        <input 
                          type="text" 
                          bind:value={element.styles.width[deviceMode]} 
                          on:input={updateParent}
                          placeholder="400px, 100%, auto"
                        />
                      </div>

                      <div class="field-group">
                        <label>Altura ({deviceMode}):</label>
                        <input 
                          type="text" 
                          bind:value={element.styles.height[deviceMode]} 
                          on:input={updateParent}
                          placeholder="300px, auto"
                        />
                      </div>

                      <div class="field-group">
                        <label>Border Radius ({deviceMode}):</label>
                        <select bind:value={element.styles.borderRadius[deviceMode]} on:change={updateParent}>
                          <option value="0">Sem arredondamento</option>
                          <option value="4px">Pequeno (4px)</option>
                          <option value="8px">Médio (8px)</option>
                          <option value="12px">Grande (12px)</option>
                          <option value="50%">Circular (50%)</option>
                        </select>
                      </div>
                    {/if}

                  </div>
                </div>
              {/if}
            </div>
          {/each}
          
          {#if data.items.length === 0}
            <div class="empty-elements">
              <p>👆 Clique em um tipo de elemento acima para começar!</p>
            </div>
          {/if}
        </div>

      </div>
    {/if}
  </div>
</div>

<style>
  .superflex-editor {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    font-family: -apple-system, sans-serif;
    font-size: 14px;
  }

  .device-toggle {
    display: flex;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .device-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #cbd5e0;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .device-btn.active {
    background: #3182ce;
    color: white;
    border-color: #3182ce;
  }

  .tabs {
    display: flex;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .tab {
    padding: 1rem 1.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    font-weight: 500;
    transition: all 0.2s;
  }

  .tab.active {
    border-bottom-color: #3182ce;
    color: #3182ce;
    background: white;
  }

  .tab-content {
    padding: 1.5rem;
    max-height: 500px;
    overflow-y: auto;
  }

  .section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .section h3, .section h4 {
    margin: 0 0 1rem 0;
    color: #2d3748;
    font-size: 16px;
  }

  .field-group {
    margin-bottom: 1rem;
  }

  .field-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4a5568;
  }

  .field-group input, .field-group select, .field-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    font-size: 14px;
  }

  .field-group textarea {
    min-height: 60px;
    resize: vertical;
    font-family: monospace;
  }

  .color-picker {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .color-picker input[type="color"] {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .color-presets {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }

  .color-preset {
    width: 24px;
    height: 24px;
    border: 2px solid #fff;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: transform 0.1s;
  }

  .color-preset:hover {
    transform: scale(1.1);
  }

  .button-group {
    display: flex;
    gap: 0.25rem;
  }

  .layout-btn, .align-btn, .position-btn {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #cbd5e0;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .layout-btn.active, .align-btn.active, .position-btn.active {
    background: #3182ce;
    color: white;
    border-color: #3182ce;
  }

  .add-element {
    margin-bottom: 2rem;
  }

  .element-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .add-element-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem 0.5rem;
    border: 2px dashed #cbd5e0;
    background: #f8fafc;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .add-element-btn:hover {
    border-color: #3182ce;
    background: #ebf8ff;
    transform: translateY(-1px);
  }

  .element-icon {
    font-size: 20px;
  }

  .element-name {
    font-size: 11px;
    font-weight: 500;
    color: #4a5568;
  }

  .elements-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .element-item {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .element-item.selected {
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }

  .element-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f8fafc;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .element-header:hover {
    background: #f1f5f9;
  }

  .element-info {
    font-weight: 500;
    color: #2d3748;
  }

  .element-actions {
    display: flex;
    gap: 0.25rem;
  }

  .remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .remove-btn:hover {
    background: #fed7d7;
  }

  .element-editor {
    padding: 1rem;
    background: white;
    border-top: 1px solid #e2e8f0;
  }

  .empty-elements {
    text-align: center;
    padding: 3rem;
    color: #718096;
    font-style: italic;
  }

  /* Scrollbar customization */
  .tab-content::-webkit-scrollbar {
    width: 6px;
  }

  .tab-content::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .tab-content::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  .tab-content::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .device-toggle {
      flex-direction: column;
    }
    
    .element-types {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .color-presets {
      justify-content: center;
    }
  }
</style>