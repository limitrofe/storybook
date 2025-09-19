<script>
  import { createEventDispatcher } from 'svelte';

  export let data = {};

  const dispatch = createEventDispatcher();

  const DEVICES = ['mobile', 'tablet', 'desktop', 'wide'];
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
    zIndex: 'auto'
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

  const DEFAULT_CONTAINER = {
    backgroundColor: '#0b0d17',
    backgroundImage: createMedia(),
    backgroundVideo: createMedia(),
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
    styles: {
      margin: createResponsive('0'),
      padding: createResponsive('0'),
      width: createResponsive('auto'),
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
          styles: {
            margin: createResponsive('0'),
            padding: createResponsive('0'),
            width: createResponsive('auto'),
            textAlign: createResponsive('left'),
            color: '#f8fafc'
          },
          position: createPosition()
        };
      case 'image':
        return {
          id: createId(),
          type: 'image',
          content: createMedia(),
          alt: '',
          backgroundColor: 'transparent',
          styles: {
            margin: createResponsive('0'),
            padding: createResponsive('0'),
            width: createResponsive('320px'),
            textAlign: createResponsive('center'),
            color: '#f8fafc'
          },
          position: createPosition()
        };
      case 'video':
        return {
          id: createId(),
          type: 'video',
          content: createMedia(),
          poster: createMedia(),
          autoplay: false,
          loop: false,
          muted: true,
          backgroundColor: 'transparent',
          styles: {
            margin: createResponsive('0'),
            padding: createResponsive('0'),
            width: createResponsive('640px'),
            textAlign: createResponsive('center'),
            color: '#f8fafc'
          },
          position: createPosition()
        };
      case 'text':
      default:
        return { id: createId(), ...clone(DEFAULT_TEXT) };
    }
  }

  function createId() {
    return `el-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }

  function ensureStructure() {
    if (!data || typeof data !== 'object') {
      data = { type: 'super-flex', container: clone(DEFAULT_CONTAINER), items: [] };
      return;
    }

    if (!data.container || typeof data.container !== 'object') {
      data.container = clone(DEFAULT_CONTAINER);
    } else {
      const container = data.container;
      container.backgroundColor = container.backgroundColor || '#0b0d17';
      container.backgroundImage = normalizeMedia(container.backgroundImage);
      container.backgroundVideo = normalizeMedia(container.backgroundVideo);
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

  function normalizeResponsive(value, fallback) {
    if (!value || typeof value !== 'object') {
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
    if (!value || typeof value !== 'object') {
      return createMedia();
    }
    const media = { ...createMedia(), ...value };
    return {
      mobile: media.mobile ?? '',
      tablet: media.tablet ?? media.mobile ?? '',
      desktop: media.desktop ?? media.tablet ?? '',
      wide: media.wide ?? media.desktop ?? ''
    };
  }

  function ensureElementStructure(element) {
    if (!element || typeof element !== 'object') return;

    if (typeof element.backgroundColor !== 'string') {
      element.backgroundColor = 'transparent';
    }

    if (!element.styles || typeof element.styles !== 'object') {
      element.styles = {};
    }

    const styles = element.styles;
    styles.margin = normalizeResponsive(styles.margin, '0');
    styles.padding = normalizeResponsive(styles.padding, '0');
    styles.width = normalizeResponsive(styles.width, 'auto');
    styles.textAlign = normalizeResponsive(styles.textAlign, 'left');
    if (typeof styles.color !== 'string') {
      styles.color = '#f8fafc';
    }

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
      });
    }
  }

  function emitUpdate() {
    dispatch('update');
  }

  ensureStructure();

  let currentDevice = 'desktop';
  let selectedElementId = null;

  $: ensureStructure();
  $: selectedElement = data.items.find((item) => item.id === selectedElementId) || null;

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
      element.content = normalizeMedia(element.content);
    }
    if (element.type === 'video') {
      element.poster = normalizeMedia(element.poster);
    }
    ensureElementStructure(element);
  }

  $: ensureMediaForElement(selectedElement);
</script>

<div class="superflex-simple">
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
        Cor de fundo
        <input type="color" bind:value={data.container.backgroundColor} on:input={emitUpdate} />
      </label>

      <label>
        Imagem ({currentDevice})
        <input
          type="url"
          bind:value={data.container.backgroundImage[currentDevice]}
          on:input={emitUpdate}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </label>

      <label>
        Vídeo ({currentDevice})
        <input
          type="url"
          bind:value={data.container.backgroundVideo[currentDevice]}
          on:input={emitUpdate}
          placeholder="https://exemplo.com/video.mp4"
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
            <button type="button" class="element-head" on:click={() => (selectedElementId = element.id)}>
              <span>{ELEMENT_TYPES.find((entry) => entry.id === element.type)?.label || element.type}</span>
              <small>{element.id}</small>
            </button>
            <div class="element-actions">
              <select bind:value={element.type} on:change={(event) => updateElementType(element, event.target.value)}>
                {#each ELEMENT_TYPES as option}
                  <option value={option.id}>{option.label}</option>
                {/each}
              </select>
              <button type="button" class="danger" on:click={() => removeElement(element.id)}>Remover</button>
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
        <label>
          URL ({currentDevice})
          <input
            type="url"
            bind:value={selectedElement.content[currentDevice]}
            on:input={emitUpdate}
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </label>
      {:else if selectedElement.type === 'video'}
        <label>
          Vídeo ({currentDevice})
          <input
            type="url"
            bind:value={selectedElement.content[currentDevice]}
            on:input={emitUpdate}
            placeholder="https://exemplo.com/video.mp4"
          />
        </label>
        <label>
          Poster ({currentDevice})
          <input
            type="url"
            bind:value={selectedElement.poster[currentDevice]}
            on:input={emitUpdate}
            placeholder="https://exemplo.com/poster.jpg"
          />
        </label>
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
      {/if}

      <div class="element-style-grid">
        <label>
          Cor do texto
          <input type="color" bind:value={selectedElement.styles.color} on:input={emitUpdate} />
        </label>

        <label>
          Cor de fundo
          <input type="color" bind:value={selectedElement.backgroundColor} on:input={emitUpdate} />
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
          <select bind:value={selectedElement.styles.textAlign[currentDevice]} on:change={emitUpdate}>
            {#each TEXT_ALIGN_OPTIONS as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </label>
      </div>

      <div class="element-position">
        <label>
          Modo de posição ({currentDevice})
          <select bind:value={selectedElement.position[currentDevice].mode} on:change={emitUpdate}>
            <option value="relative">Relative</option>
            <option value="absolute">Absolute</option>
          </select>
        </label>

        {#if selectedElement.position[currentDevice].mode === 'absolute'}
          <div class="position-grid">
            <label>
              Top
              <input
                type="text"
                bind:value={selectedElement.position[currentDevice].top}
                on:input={emitUpdate}
                placeholder="auto"
              />
            </label>
            <label>
              Right
              <input
                type="text"
                bind:value={selectedElement.position[currentDevice].right}
                on:input={emitUpdate}
                placeholder="auto"
              />
            </label>
            <label>
              Bottom
              <input
                type="text"
                bind:value={selectedElement.position[currentDevice].bottom}
                on:input={emitUpdate}
                placeholder="auto"
              />
            </label>
            <label>
              Left
              <input
                type="text"
                bind:value={selectedElement.position[currentDevice].left}
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
            bind:value={selectedElement.position[currentDevice].zIndex}
            on:input={emitUpdate}
            placeholder="auto"
          />
        </label>
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

  .element-position {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .position-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
</style>
