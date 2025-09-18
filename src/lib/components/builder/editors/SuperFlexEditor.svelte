<!-- src/lib/components/builder/editors/SuperFlexEditor.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import DeviceToggle from '../controls/DeviceToggle.svelte';
  import ColorPicker from '../controls/ColorPicker.svelte';
  
  const dispatch = createEventDispatcher();
  
  const DEVICES = ['mobile', 'tablet', 'desktop', 'wide'];

  const POSITION_DEFAULT = {
    mode: 'relative',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    zIndex: 'auto',
    transform: 'none'
  };

  const createDefaultBackground = () => ({
    color: '',
    image: { mobile: '', tablet: '', desktop: '', wide: '' },
    video: { mobile: '', tablet: '', desktop: '', wide: '' },
    size: { mobile: 'cover', tablet: 'cover', desktop: 'cover', wide: 'cover' },
    position: { mobile: 'center center', tablet: 'center center', desktop: 'center center', wide: 'center center' },
    repeat: { mobile: 'no-repeat', tablet: 'no-repeat', desktop: 'no-repeat', wide: 'no-repeat' },
    overlayColor: 'transparent',
    overlayOpacity: '0'
  });

  const createDefaultContainer = () => ({
    backgroundColor: '#0b0d17',
    backgroundImage: { mobile: '', tablet: '', desktop: '', wide: '' },
    backgroundVideo: { mobile: '', tablet: '', desktop: '', wide: '' },
    height: { mobile: 'auto', tablet: 'auto', desktop: 'auto', wide: 'auto' },
    padding: { mobile: '0', tablet: '0', desktop: '0', wide: '0' },
    margin: { mobile: '0', tablet: '0', desktop: '0', wide: '0' },
    gap: { mobile: '0', tablet: '1rem', desktop: '2rem', wide: '2rem' },
    display: 'flex',
    flexDirection: { mobile: 'column', tablet: 'column', desktop: 'row', wide: 'row' },
    alignItems: { mobile: 'center', tablet: 'center', desktop: 'center', wide: 'center' },
    justifyContent: { mobile: 'center', tablet: 'center', desktop: 'center', wide: 'center' },
    fullWidth: false
  });

  export let data = {
    container: createDefaultContainer(),
    items: []
  };

  let activeTab = 'container';
  let selectedElement = null;
  let deviceMode = 'desktop';

  // Tipos de elementos disponíveis
  const elementTypes = [
    { id: 'text', name: 'Texto', icon: '📝' },
    { id: 'title', name: 'Título', icon: '📰' },
    { id: 'subtitle', name: 'Subtítulo', icon: '🏷️' },
    { id: 'intertitle', name: 'Intertítulo', icon: '📑' },
    { id: 'image', name: 'Imagem', icon: '🖼️' },
    { id: 'video', name: 'Vídeo', icon: '🎥' },
    { id: 'flourish', name: 'Flourish', icon: '📊' },
    { id: 'scrolly', name: 'Scrolly', icon: '📜' }
  ];

  // Presets de layout
  const layoutPresets = [
    { id: 'hero-split', name: 'Hero Split', flexDirection: { desktop: 'row', mobile: 'column' }, justifyContent: { desktop: 'space-between', mobile: 'center' } },
    { id: 'center-stack', name: 'Centro Empilhado', flexDirection: { desktop: 'column', mobile: 'column' }, justifyContent: { desktop: 'center', mobile: 'center' } },
    { id: 'side-by-side', name: 'Lado a Lado', flexDirection: { desktop: 'row', mobile: 'column' }, justifyContent: { desktop: 'center', mobile: 'center' } }
  ];

  function updateParent() {
    dispatch('update');
  }

  const createPositionConfig = (mode = 'relative') => ({
    ...POSITION_DEFAULT,
    mode,
    zIndex: mode === 'absolute' ? '10' : 'auto'
  });

  function ensureItemsArray() {
    if (!data) return;
    if (!Array.isArray(data.items)) {
      data = { ...data, items: [] };
    }
  }

  function ensureContainerObject() {
    if (!data) return;
    if (!data.container || typeof data.container !== 'object') {
      data = { ...data, container: createDefaultContainer() };
    }
  }

  function ensureBaseStructure() {
    if (!data || typeof data !== 'object') {
      data = {
        type: 'super-flex',
        container: createDefaultContainer(),
        items: []
      };
      return;
    }

    ensureContainerObject();
    ensureItemsArray();
  }

  function addElement(type) {
    const newElement = {
      id: Date.now(),
      type,
      content: getDefaultContent(type),
      position: {
        mobile: createPositionConfig('relative'),
        tablet: createPositionConfig('relative'),
        desktop: createPositionConfig('relative'),
        wide: createPositionConfig('relative')
      },
      styles: getDefaultStyles(type),
      background: createDefaultBackground()
    };
    
  ensureItemsArray();
  data = {
    ...data,
    items: [...data.items, newElement]
  };
    selectedElement = newElement.id;
    activeTab = 'elements';
    updateParent();
  }

  function removeElement(id) {
    ensureItemsArray();
    data = {
      ...data,
      items: data.items.filter(item => item.id !== id)
    };
    if (selectedElement === id) selectedElement = null;
    updateParent();
  }

  function ensureBackground(item) {
    if (!item.background || typeof item.background !== 'object') {
      item.background = createDefaultBackground();
      return;
    }

    const background = item.background;

    ensureResponsiveProperty(background, 'image', '', '', '', '');
    ensureResponsiveProperty(background, 'video', '', '', '', '');
    ensureResponsiveProperty(background, 'size', 'cover', 'cover', 'cover', 'cover');
    ensureResponsiveProperty(background, 'position', 'center center', 'center center', 'center center', 'center center');
    ensureResponsiveProperty(background, 'repeat', 'no-repeat', 'no-repeat', 'no-repeat', 'no-repeat');

    background.color = background.color ?? '';
    background.overlayColor = background.overlayColor ?? 'transparent';
    background.overlayOpacity = background.overlayOpacity ?? '0';
  }

  const RESPONSIVE_KEYS = ['mobile', 'tablet', 'desktop', 'wide'];

  function ensureResponsiveProperty(target, key, desktopDefault = 'auto', mobileDefault = desktopDefault, tabletDefault = desktopDefault, wideDefault = desktopDefault) {
    const defaults = {
      mobile: mobileDefault,
      tablet: tabletDefault,
      desktop: desktopDefault,
      wide: wideDefault
    };

    if (!target[key] || typeof target[key] !== 'object') {
      const value = target[key];
      if (typeof value === 'string' || typeof value === 'number') {
        const strValue = String(value);
        target[key] = {
          mobile: strValue,
          tablet: strValue,
          desktop: strValue,
          wide: strValue
        };
        return;
      }

      target[key] = {
        mobile: defaults.mobile,
        tablet: defaults.tablet,
        desktop: defaults.desktop,
        wide: defaults.wide
      };
      return;
    }

    const responsive = target[key];
    responsive.desktop = responsive.desktop ?? defaults.desktop;
    responsive.mobile = responsive.mobile ?? responsive.desktop ?? defaults.mobile;
    responsive.tablet = responsive.tablet ?? responsive.desktop ?? responsive.mobile ?? defaults.tablet;
    responsive.wide = responsive.wide ?? responsive.desktop ?? defaults.wide;
  }

  function normalizePosition(position) {
    if (!position || typeof position !== 'object') {
      return {
        mobile: { ...POSITION_DEFAULT },
        tablet: { ...POSITION_DEFAULT },
        desktop: { ...POSITION_DEFAULT },
        wide: { ...POSITION_DEFAULT }
      };
    }

    const normalizeDevice = (config) => {
      if (!config || typeof config !== 'object') {
        if (typeof config === 'string') {
          return { ...POSITION_DEFAULT, mode: config };
        }
        return { ...POSITION_DEFAULT };
      }

      return {
        ...POSITION_DEFAULT,
        ...config,
        mode: config.mode || POSITION_DEFAULT.mode,
        top: config.top ?? POSITION_DEFAULT.top,
        right: config.right ?? POSITION_DEFAULT.right,
        bottom: config.bottom ?? POSITION_DEFAULT.bottom,
        left: config.left ?? POSITION_DEFAULT.left,
        zIndex: config.zIndex ?? POSITION_DEFAULT.zIndex,
        transform: config.transform ?? POSITION_DEFAULT.transform
      };
    };

    return {
      mobile: normalizeDevice(position.mobile),
      tablet: normalizeDevice(position.tablet ?? position.mobile ?? position.desktop),
      desktop: normalizeDevice(position.desktop ?? position.tablet ?? position.mobile),
      wide: normalizeDevice(position.wide ?? position.desktop ?? position.tablet)
    };
  }

  function normalizeItem(item) {
    if (!item.styles) {
      item.styles = getDefaultStyles(item.type || 'text');
    }

    ensureResponsiveProperty(item.styles, 'margin', '0', '0');
    ensureResponsiveProperty(item.styles, 'padding', '0', '0');
    ensureResponsiveProperty(item.styles, 'maxWidth', 'none', 'none');
    ensureResponsiveProperty(item.styles, 'maxHeight', 'none', 'none');
    ensureResponsiveProperty(item.styles, 'width', 'auto', 'auto');
    ensureResponsiveProperty(item.styles, 'height', 'auto', 'auto');
    ensureResponsiveProperty(item.styles, 'textAlign', 'left', 'left');
    ensureResponsiveProperty(item.styles, 'fontSize', 'inherit', 'inherit');
    ensureResponsiveProperty(item.styles, 'fontWeight', 'normal', 'normal');
    ensureResponsiveProperty(item.styles, 'lineHeight', 'normal', 'normal');
    ensureResponsiveProperty(item.styles, 'letterSpacing', 'normal', 'normal');
    ensureResponsiveProperty(item.styles, 'display', 'block', 'block');
    ensureResponsiveProperty(item.styles, 'alignSelf', 'auto', 'auto');
    ensureResponsiveProperty(item.styles, 'opacity', '1', '1');
    ensureResponsiveProperty(item.styles, 'borderRadius', '0', '0');

    if (!item.styles.color) item.styles.color = '#ffffff';
    if (!item.styles.fontFamily) item.styles.fontFamily = 'inherit';
    if (!item.styles.backgroundColor) item.styles.backgroundColor = 'transparent';

    item.position = normalizePosition(item.position);
    ensureBackground(item);

    if (isTextType(item.type)) {
      item.tag = item.tag || getDefaultTag(item.type);
    }

    if (item.type === 'image') {
      ensureMediaObject(item, 'content');
      item.alt = item.alt ?? '';
    } else if (item.type === 'video') {
      ensureMediaObject(item, 'content');
      ensureMediaObject(item, 'poster');
      item.autoplay = item.autoplay ?? false;
      item.loop = item.loop ?? false;
      item.muted = item.muted ?? true;
      item.autoplayInView = item.autoplayInView ?? false;
    }
  }

  function getPositionMode(element, device) {
    normalizeItem(element);
    return element.position[device].mode;
  }

  function setPositionMode(element, device, mode) {
    normalizeItem(element);
    element.position[device].mode = mode;
    if (mode === 'relative') {
      element.position[device].top = 'auto';
      element.position[device].right = 'auto';
      element.position[device].bottom = 'auto';
      element.position[device].left = 'auto';
      element.position[device].transform = 'none';
      element.position[device].zIndex = 'auto';
    } else if (element.position[device].zIndex === 'auto') {
      element.position[device].zIndex = '10';
    }
    updateParent();
  }

  function getDefaultContent(type) {
    switch(type) {
      case 'title': return '<h1>Título Principal</h1>';
      case 'subtitle': return '<h2>Subtítulo</h2>';
      case 'intertitle': return '<h3>Intertítulo</h3>';
      case 'text': return '<p>Texto do parágrafo...</p>';
      case 'image':
        return {
          mobile: '',
          tablet: '',
          desktop: '',
          wide: ''
        };
      case 'video':
        return {
          mobile: '',
          tablet: '',
          desktop: '',
          wide: ''
        };
      case 'flourish': return { embedId: '', height: '400px' };
      case 'scrolly': return { steps: [], height: '400vh' };
      default: return '<p>Novo elemento</p>';
    }
  }

  function getDefaultStyles(type) {
    const baseStyles = {
      margin: { mobile: '0.5rem', tablet: '0.75rem', desktop: '1rem', wide: '1rem' },
      padding: { mobile: '0.5rem', tablet: '0.75rem', desktop: '1rem', wide: '1rem' },
      color: '#ffffff',
      backgroundColor: 'transparent',
      textAlign: { mobile: 'left', tablet: 'left', desktop: 'left', wide: 'left' },
      width: { mobile: 'auto', tablet: 'auto', desktop: 'auto', wide: 'auto' },
      height: { mobile: 'auto', tablet: 'auto', desktop: 'auto', wide: 'auto' },
      maxWidth: { mobile: 'none', tablet: 'none', desktop: 'none', wide: 'none' },
      display: { mobile: 'block', tablet: 'block', desktop: 'block', wide: 'block' },
      alignSelf: { mobile: 'auto', tablet: 'auto', desktop: 'auto', wide: 'auto' },
      opacity: { mobile: '1', tablet: '1', desktop: '1', wide: '1' },
      borderRadius: { mobile: '0', tablet: '0', desktop: '0', wide: '0' },
      fontSize: { mobile: '1rem', tablet: '1rem', desktop: '1rem', wide: '1rem' },
      fontWeight: { mobile: '400', tablet: '400', desktop: '400', wide: '400' },
      lineHeight: { mobile: '1.5', tablet: '1.5', desktop: '1.5', wide: '1.5' },
      letterSpacing: { mobile: 'normal', tablet: 'normal', desktop: 'normal', wide: 'normal' },
      zIndex: { mobile: 'auto', tablet: 'auto', desktop: 'auto', wide: 'auto' }
    };

    switch(type) {
      case 'title':
        return {
          ...baseStyles,
          fontSize: { mobile: '2rem', tablet: '2.5rem', desktop: '3rem', wide: '3.5rem' },
          fontWeight: { mobile: '700', tablet: '700', desktop: '700', wide: '700' }
        };
      case 'subtitle':
        return {
          ...baseStyles,
          fontSize: { mobile: '1.2rem', tablet: '1.35rem', desktop: '1.5rem', wide: '1.6rem' },
          fontWeight: { mobile: '400', tablet: '400', desktop: '400', wide: '400' }
        };
      case 'intertitle':
        return {
          ...baseStyles,
          fontSize: { mobile: '1.5rem', tablet: '1.75rem', desktop: '2rem', wide: '2.25rem' },
          fontWeight: { mobile: '600', tablet: '600', desktop: '600', wide: '600' }
        };
      case 'image':
        return {
          ...baseStyles,
          width: { mobile: '240px', tablet: '320px', desktop: '400px', wide: '480px' },
          height: { mobile: 'auto', tablet: 'auto', desktop: 'auto', wide: 'auto' },
          borderRadius: { mobile: '8px', tablet: '8px', desktop: '8px', wide: '8px' }
        };
      default:
        return {
          ...baseStyles,
          fontSize: baseStyles.fontSize
        };
    }
  }

  function applyLayoutPreset(preset) {
    data.container.flexDirection = preset.flexDirection;
    data.container.justifyContent = preset.justifyContent;
    updateParent();
  }

  function handleDeviceChange(event) {
    deviceMode = event.detail.value;
  }

  function handleColorChange(event) {
    data.container.backgroundColor = event.detail.value;
    updateParent();
  }

  function ensureContainerResponsive(container, key, desktopDefault, mobileDefault = desktopDefault, tabletDefault = desktopDefault, wideDefault = desktopDefault) {
    ensureResponsiveProperty(container, key, desktopDefault, mobileDefault, tabletDefault, wideDefault);
  }

  function ensureContainerMedia(container, key) {
    if (!container[key] || typeof container[key] !== 'object') {
      const value = container[key];
      if (typeof value === 'string') {
        container[key] = {
          mobile: value,
          tablet: value,
          desktop: value,
          wide: value
        };
        return;
      }
      container[key] = { mobile: '', tablet: '', desktop: '', wide: '' };
      return;
    }

    const media = container[key];
    media.desktop = media.desktop ?? '';
    media.mobile = media.mobile ?? media.desktop ?? '';
    media.tablet = media.tablet ?? media.desktop ?? media.mobile ?? '';
    media.wide = media.wide ?? media.desktop ?? '';
  }

  $: ensureBaseStructure();

  $: if (data?.container) {
    ensureContainerResponsive(data.container, 'padding', '0', '0');
    ensureContainerResponsive(data.container, 'margin', '0', '0');
    ensureContainerResponsive(data.container, 'gap', '0', '0', '1rem', '2rem');
    ensureContainerResponsive(data.container, 'height', 'auto', 'auto');
    ensureContainerResponsive(data.container, 'flexDirection', 'column', 'column', 'row', 'row');
    ensureContainerResponsive(data.container, 'alignItems', 'center', 'center');
    ensureContainerResponsive(data.container, 'justifyContent', 'center', 'center');
    ensureContainerMedia(data.container, 'backgroundImage');
    ensureContainerMedia(data.container, 'backgroundVideo');
  }

  // Normalização contínua para garantir estrutura consistente
  $: if (Array.isArray(data?.items)) {
    data.items.forEach(normalizeItem);
  }

  // Encontrar elemento selecionado
  $: selectedElementData = data.items?.find(item => item.id === selectedElement);

  const DEVICE_LABELS = {
    mobile: 'Mobile',
    tablet: 'Tablet',
    desktop: 'Desktop',
    wide: 'Wide'
  };

  const TEXT_TYPE_TAG = {
    text: 'p',
    title: 'h1',
    subtitle: 'h2',
    intertitle: 'h3'
  };

  const TEXT_TAG_OPTIONS = [
    { value: 'p', label: 'Parágrafo <p>' },
    { value: 'div', label: 'Div' },
    { value: 'span', label: 'Span' },
    { value: 'h1', label: 'Título H1' },
    { value: 'h2', label: 'Título H2' },
    { value: 'h3', label: 'Título H3' },
    { value: 'h4', label: 'Título H4' },
    { value: 'h5', label: 'Título H5' },
    { value: 'h6', label: 'Título H6' }
  ];

  function ensureMediaObject(target, key) {
    if (!target[key] || typeof target[key] !== 'object') {
      target[key] = { mobile: '', tablet: '', desktop: '', wide: '' };
      return;
    }
    const media = target[key];
    media.desktop = media.desktop ?? '';
    media.mobile = media.mobile ?? media.desktop ?? '';
    media.tablet = media.tablet ?? media.desktop ?? media.mobile ?? '';
    media.wide = media.wide ?? media.desktop ?? media.tablet ?? '';
  }

  function isTextType(type) {
    return ['text', 'title', 'subtitle', 'intertitle'].includes(type);
  }

  function getDefaultTag(type) {
    return TEXT_TYPE_TAG[type] || 'div';
  }

  const clone = (value) => {
    try {
      return structuredClone(value);
    } catch (error) {
      return JSON.parse(JSON.stringify(value));
    }
  };

  function changeElementType(element, newType) {
    if (!element || element.type === newType) return;

    const previousPosition = normalizePosition(element.position);
    const previousBackground = element.background ? clone(element.background) : createDefaultBackground();

    element.type = newType;
    element.content = getDefaultContent(newType);
    element.styles = getDefaultStyles(newType);
    element.position = previousPosition;
    element.background = previousBackground;

    if (newType === 'image') {
      ensureMediaObject(element, 'content');
      element.alt = element.alt ?? '';
    } else {
      delete element.alt;
    }

    if (newType === 'video') {
      ensureMediaObject(element, 'content');
      ensureMediaObject(element, 'poster');
      element.autoplay = element.autoplay ?? false;
      element.loop = element.loop ?? false;
      element.muted = element.muted ?? true;
      element.autoplayInView = element.autoplayInView ?? false;
    } else {
      delete element.autoplay;
      delete element.loop;
      delete element.muted;
      delete element.autoplayInView;
      delete element.poster;
    }

    if (isTextType(newType)) {
      element.tag = element.tag || getDefaultTag(newType);
    } else {
      delete element.tag;
    }

    ensureBackground(element);
    normalizeItem(element);
    updateParent();
  }
</script>

<div class="superflex-editor">
  
  <!-- Device Toggle Global -->
  <div class="editor-header">
    <DeviceToggle 
      bind:value={deviceMode}
      on:change={handleDeviceChange}
    />
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
      🧩 Elementos ({data.items?.length || 0})
    </button>
  </div>

  <div class="tab-content">
    
    {#if activeTab === 'container'}
      <!-- CONTAINER SETTINGS -->
      <div class="container-settings">
        
        <!-- Layout Presets -->
        <div class="section">
          <h3>🎨 Presets de Layout</h3>
          <div class="preset-buttons">
            {#each layoutPresets as preset}
              <button 
                class="preset-btn"
                on:click={() => applyLayoutPreset(preset)}
              >
                {preset.name}
              </button>
            {/each}
          </div>
        </div>

        <!-- Background -->
        <div class="section">
          <ColorPicker 
            bind:value={data.container.backgroundColor}
            label="Cor de Fundo"
            on:change={handleColorChange}
          />
          
          <div class="field">
            <label>Imagem de Fundo ({deviceMode}):</label>
            <input 
              type="url" 
              bind:value={data.container.backgroundImage[deviceMode]} 
              on:input={updateParent}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div class="field">
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
          
          <div class="field">
            <label>Altura ({deviceMode}):</label>
            <input 
              type="text"
              bind:value={data.container.height[deviceMode]}
              on:input={updateParent}
              placeholder={deviceMode === 'desktop' ? '100vh' : '80vh'}
            />
          </div>

          <div class="field">
            <label>Padding interno ({deviceMode}):</label>
            <input 
              type="text"
              bind:value={data.container.padding[deviceMode]}
              on:input={updateParent}
              placeholder="2rem"
            />
          </div>

          <div class="field">
            <label>Margem externa ({deviceMode}):</label>
            <input 
              type="text"
              bind:value={data.container.margin[deviceMode]}
              on:input={updateParent}
              placeholder="0"
            />
          </div>

          <div class="field">
            <label>Gap entre itens ({deviceMode}):</label>
            <input 
              type="text"
              bind:value={data.container.gap[deviceMode]}
              on:input={updateParent}
              placeholder="0"
            />
          </div>
        </div>

        <!-- Layout -->
        <div class="section">
          <h3>📐 Layout</h3>
          
          <div class="field">
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

          <div class="field">
            <label>Alinhamento ({deviceMode}):</label>
            <select bind:value={data.container.alignItems[deviceMode]} on:change={updateParent}>
              <option value="flex-start">Início</option>
              <option value="center">Centro</option>
              <option value="flex-end">Fim</option>
              <option value="stretch">Esticar</option>
            </select>
          </div>

          <div class="field">
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
        <div class="section">
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
        <div class="section">
          <h3>📋 Elementos</h3>
          <div class="elements-list">
            {#each data.items || [] as element}
              <div class="element-item" class:selected={selectedElement === element.id}>
                
                <div class="element-header" on:click={() => selectedElement = selectedElement === element.id ? null : element.id}>
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

                {#if selectedElement === element.id}
                  <div class="element-editor">
                    <div class="field">
                      <label>Tipo do item</label>
                      <select bind:value={element.type} on:change={(event) => changeElementType(element, event.target.value)}>
                        {#each elementTypes as option}
                          <option value={option.id}>{option.name}</option>
                        {/each}
                      </select>
                    </div>

                    <!-- Content Editor -->
                    <div class="subsection">
                      <h4>📝 Conteúdo</h4>
                      
                      {#if element.type === 'text' || element.type === 'title' || element.type === 'subtitle' || element.type === 'intertitle'}
                        <div class="field">
                          <label>Tag HTML</label>
                          <select bind:value={element.tag} on:change={updateParent}>
                            {#each TEXT_TAG_OPTIONS as option}
                              <option value={option.value}>{option.label}</option>
                            {/each}
                          </select>
                        </div>
                        <textarea 
                          bind:value={element.content} 
                          on:input={updateParent}
                          rows="3"
                          placeholder="Conteúdo HTML..."
                        ></textarea>
                      {:else if element.type === 'image'}
                        <div class="field">
                          <label>Imagem ({DEVICE_LABELS[deviceMode]}):</label>
                          <input 
                            type="url" 
                            bind:value={element.content[deviceMode]} 
                            on:input={updateParent}
                            placeholder="https://exemplo.com/imagem.jpg"
                          />
                        </div>
                        <div class="field">
                          <label>Texto alternativo (ALT):</label>
                          <input 
                            type="text" 
                            bind:value={element.alt}
                            on:input={updateParent}
                            placeholder="Descreva a imagem"
                          />
                        </div>
                      {:else if element.type === 'video'}
                        <div class="field">
                          <label>Vídeo ({DEVICE_LABELS[deviceMode]}):</label>
                          <input 
                            type="url" 
                            bind:value={element.content[deviceMode]} 
                            on:input={updateParent}
                            placeholder="https://exemplo.com/video.mp4"
                          />
                        </div>
                        <div class="field">
                          <label>Poster ({DEVICE_LABELS[deviceMode]}):</label>
                          <input 
                            type="url" 
                            bind:value={element.poster[deviceMode]} 
                            on:input={updateParent}
                            placeholder="https://exemplo.com/poster.jpg"
                          />
                        </div>
                        <div class="toggle-grid">
                          <label class="checkbox">
                            <input type="checkbox" bind:checked={element.autoplay} on:change={updateParent} />
                            Autoplay
                          </label>
                          <label class="checkbox">
                            <input type="checkbox" bind:checked={element.autoplayInView} on:change={updateParent} />
                            Reproduzir ao entrar na tela
                          </label>
                          <label class="checkbox">
                            <input type="checkbox" bind:checked={element.loop} on:change={updateParent} />
                            Loop
                          </label>
                          <label class="checkbox">
                            <input type="checkbox" bind:checked={element.muted} on:change={updateParent} />
                            Silenciado
                          </label>
                        </div>
                      {:else if element.type === 'flourish'}
                        <div class="field">
                          <label>Flourish Embed ID:</label>
                          <input 
                            type="text" 
                            bind:value={element.content.embedId} 
                            on:input={updateParent}
                            placeholder="12345678"
                          />
                        </div>
                      {/if}
                    </div>

                    <!-- Style Editor -->
                    <div class="subsection">
                      <h4>🎨 Estilo ({deviceMode})</h4>
                      
                      {#if element.type !== 'image'}
                        <!-- Text Styles -->
                        <ColorPicker 
                          bind:value={element.styles.color}
                          label="Cor do Texto"
                          on:change={updateParent}
                        />

                        <div class="field">
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

                        <div class="field">
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

                        <div class="field">
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
                      <div class="field">
                        <label>Margem ({deviceMode}):</label>
                        <input 
                          type="text"
                          bind:value={element.styles.margin[deviceMode]}
                          on:input={updateParent}
                          placeholder="0"
                        />
                      </div>

                      <div class="field">
                        <label>Padding ({deviceMode}):</label>
                        <input 
                          type="text"
                          bind:value={element.styles.padding[deviceMode]}
                          on:input={updateParent}
                          placeholder="0"
                        />
                      </div>

                      <!-- Position -->
                      <div class="field">
                        <label>Posição ({deviceMode}):</label>
                        <div class="button-group">
                          <button 
                            class="position-btn" 
                            class:active={getPositionMode(element, deviceMode) === 'relative'}
                            on:click={() => setPositionMode(element, deviceMode, 'relative')}
                          >
                            📍 Relativa
                          </button>
                          <button 
                            class="position-btn" 
                            class:active={getPositionMode(element, deviceMode) === 'absolute'}
                            on:click={() => setPositionMode(element, deviceMode, 'absolute')}
                          >
                            🎯 Absoluta
                          </button>
                        </div>
                      </div>

                      {#if getPositionMode(element, deviceMode) === 'absolute'}
                        <div class="field-grid">
                          <div class="field">
                            <label>Topo ({deviceMode}):</label>
                            <input 
                              type="text"
                              bind:value={element.position[deviceMode].top}
                              on:input={updateParent}
                              placeholder="10%"
                            />
                          </div>
                          <div class="field">
                            <label>Direita ({deviceMode}):</label>
                            <input 
                              type="text"
                              bind:value={element.position[deviceMode].right}
                              on:input={updateParent}
                              placeholder="auto"
                            />
                          </div>
                        </div>
                        <div class="field-grid">
                          <div class="field">
                            <label>Fundo ({deviceMode}):</label>
                            <input 
                              type="text"
                              bind:value={element.position[deviceMode].bottom}
                              on:input={updateParent}
                              placeholder="auto"
                            />
                          </div>
                          <div class="field">
                            <label>Esquerda ({deviceMode}):</label>
                            <input 
                              type="text"
                              bind:value={element.position[deviceMode].left}
                              on:input={updateParent}
                              placeholder="10%"
                            />
                          </div>
                        </div>
                        <div class="field-grid">
                          <div class="field">
                            <label>Z-index ({deviceMode}):</label>
                            <input 
                              type="text"
                              bind:value={element.position[deviceMode].zIndex}
                              on:input={updateParent}
                              placeholder="10"
                            />
                          </div>
                          <div class="field">
                            <label>Transform ({deviceMode}):</label>
                            <input 
                              type="text"
                              bind:value={element.position[deviceMode].transform}
                              on:input={updateParent}
                              placeholder="translate(-50%, -50%)"
                            />
                          </div>
                        </div>
                      {/if}

                      <div class="field-grid">
                        <div class="field">
                          <label>Largura ({deviceMode}):</label>
                          <input 
                            type="text" 
                            bind:value={element.styles.width[deviceMode]} 
                            on:input={updateParent}
                            placeholder="auto"
                          />
                        </div>

                        <div class="field">
                          <label>Altura ({deviceMode}):</label>
                          <input 
                            type="text" 
                            bind:value={element.styles.height[deviceMode]} 
                            on:input={updateParent}
                            placeholder="auto"
                          />
                        </div>
                      </div>

                      <div class="field">
                        <label>Máx. largura ({deviceMode}):</label>
                        <input 
                          type="text"
                          bind:value={element.styles.maxWidth[deviceMode]}
                          on:input={updateParent}
                          placeholder="none"
                        />
                      </div>

                      {#if element.styles.borderRadius}
                        <div class="field">
                          <label>Border Radius ({deviceMode}):</label>
                          <input 
                            type="text"
                            bind:value={element.styles.borderRadius[deviceMode]}
                            on:input={updateParent}
                            placeholder="0"
                          />
                        </div>
                      {/if}

                      <div class="field-divider"></div>

                      <h4 class="subsection-label">🎬 Fundo do elemento</h4>

                      <ColorPicker 
                        bind:value={element.background.color}
                        label="Cor de fundo"
                        on:change={updateParent}
                      />

                      <div class="field">
                        <label>Imagem de fundo ({deviceMode}):</label>
                        <input 
                          type="url"
                          bind:value={element.background.image[deviceMode]}
                          on:input={updateParent}
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>

                      <div class="field">
                        <label>Vídeo de fundo ({deviceMode}):</label>
                        <input 
                          type="url"
                          bind:value={element.background.video[deviceMode]}
                          on:input={updateParent}
                          placeholder="https://exemplo.com/video.mp4"
                        />
                      </div>

                      <div class="field-grid">
                        <div class="field">
                          <label>Tamanho ({deviceMode}):</label>
                          <input 
                            type="text"
                            bind:value={element.background.size[deviceMode]}
                            on:input={updateParent}
                            placeholder="cover"
                          />
                        </div>
                        <div class="field">
                          <label>Repetição ({deviceMode}):</label>
                          <input 
                            type="text"
                            bind:value={element.background.repeat[deviceMode]}
                            on:input={updateParent}
                            placeholder="no-repeat"
                          />
                        </div>
                      </div>

                      <div class="field">
                        <label>Posicionamento ({deviceMode}):</label>
                        <input 
                          type="text"
                          bind:value={element.background.position[deviceMode]}
                          on:input={updateParent}
                          placeholder="center center"
                        />
                      </div>

                      <ColorPicker 
                        bind:value={element.background.overlayColor}
                        label="Overlay"
                        on:change={updateParent}
                      />

                      <div class="field">
                        <label>Opacidade do overlay:</label>
                        <input 
                          type="text"
                          bind:value={element.background.overlayOpacity}
                          on:input={updateParent}
                          placeholder="0"
                        />
                      </div>

                    </div>
                  </div>
                {/if}
              </div>
            {/each}
            
            {#if !data.items || data.items.length === 0}
              <div class="empty-elements">
                <p>👆 Clique em um tipo de elemento acima para começar!</p>
              </div>
            {/if}
          </div>
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
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .editor-header {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
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
    font-size: 14px;
  }

  .tab.active {
    border-bottom-color: #3182ce;
    color: #3182ce;
    background: white;
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .section h3 {
    margin: 0 0 1rem 0;
    color: #2d3748;
    font-size: 16px;
    font-weight: 600;
  }

  .subsection {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 6px;
  }

  .subsection h4 {
    margin: 0 0 1rem 0;
    color: #2d3748;
    font-size: 14px;
    font-weight: 600;
  }

  .field {
    margin-bottom: 1rem;
  }

  .field-divider {
    border: 0;
    border-top: 1px solid #e2e8f0;
    margin: 1.25rem 0;
  }

  .subsection-label {
    margin: 0 0 0.75rem 0;
    color: #2d3748;
    font-size: 13px;
    font-weight: 600;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .field-grid .field {
    margin-bottom: 0;
  }

  .toggle-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 12px;
    color: #4a5568;
  }

  .checkbox input {
    width: 14px;
    height: 14px;
  }

  .field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4a5568;
    font-size: 12px;
  }

  .field input, .field select, .field textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    font-size: 14px;
  }

  .field textarea {
    min-height: 60px;
    resize: vertical;
    font-family: monospace;
  }

  .preset-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .preset-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #cbd5e0;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    border-color: #3182ce;
    background: #ebf8ff;
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
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .layout-btn.active, .align-btn.active, .position-btn.active {
    background: #3182ce;
    color: white;
    border-color: #3182ce;
  }

  .element-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.5rem;
  }

  .add-element-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
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
    font-size: 18px;
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
    font-size: 13px;
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
    .element-types {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .preset-buttons {
      grid-template-columns: 1fr;
    }
  }
</style>
