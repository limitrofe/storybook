<script>
  export let minHeightDesktop = 400;
  export let maxHeightDesktop = null;
  export let minHeightMobile = 400;
  export let maxHeightMobile = null;
  export let baseWidthDesktop = 1440;
  export let baseWidthMobile = 375;
  export let backgroundColor = '#000000';
  export let items = [];
  export let device = 'desktop';

  let isMobile;
  $: isMobile = device === 'mobile';

  function getFrame(item) {
    return isMobile ? item.mobile : item.desktop;
  }

  function toVw(value, baseWidth) {
    if (!baseWidth || baseWidth <= 0) return '0px';
    return `${(value / baseWidth) * 100}vw`;
  }

  function getTextContainerStyle(item) {
    const styles = item.textStyles || {};
    const align = isMobile ? styles.textAlignMobile || styles.textAlign || 'left' : styles.textAlign || 'left';
    const declarations = [
      'width:100%',
      'height:100%',
      'display:flex',
      `text-align:${align}`,
      `align-items:${styles.verticalAlign || 'flex-start'}`,
      `justify-content:${styles.horizontalAlign || 'flex-start'}`
    ];

    const fontSize = isMobile ? styles.fontSizeMobile || styles.fontSize : styles.fontSize;
    const lineHeight = isMobile ? styles.lineHeightMobile || styles.lineHeight : styles.lineHeight;

    if (styles.fontFamily) declarations.push(`font-family:${styles.fontFamily}`);
    if (fontSize) declarations.push(`font-size:${fontSize}`);
    if (lineHeight) declarations.push(`line-height:${lineHeight}`);
    if (styles.color) declarations.push(`color:${styles.color}`);
    if (styles.fontWeight) declarations.push(`font-weight:${styles.fontWeight}`);

    return `${declarations.join(';')};`;
  }

  const allowedTypographyTags = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);

  function getTypographyTag(item) {
    const raw = item.textStyles?.typography;
    if (typeof raw !== 'string') return null;
    const tag = raw.trim().toLowerCase();
    return allowedTypographyTags.has(tag) ? tag : null;
  }

  function hasHtml(content) {
    if (!content) return false;
    return /<\/?[a-z][^>]*>/i.test(content);
  }


  function getMediaSource(item) {
    if (isMobile && item.srcMobile) return item.srcMobile;
    return item.src || '';
  }

  let effectiveBaseWidth = baseWidthDesktop;
  let baseHeight = 0;
  let cssHeight = '0px';

  $: {
    const frames = items.map(getFrame).filter(Boolean);
    const contentWidth = frames.length ? Math.max(...frames.map((frame) => (frame.x || 0) + (frame.width || 0))) : 0;
    const baseWidth = isMobile ? baseWidthMobile : baseWidthDesktop;
    effectiveBaseWidth = Math.max(baseWidth || 0, contentWidth);

    const minHeight = isMobile ? minHeightMobile : minHeightDesktop;
    const maxHeight = isMobile ? maxHeightMobile : maxHeightDesktop;
    const contentHeight = frames.length ? Math.max(...frames.map((frame) => (frame.y || 0) + (frame.height || 0))) : 0;
    baseHeight = Math.max(contentHeight, minHeight || 0);
    if (typeof maxHeight === 'number' && Number.isFinite(maxHeight) && maxHeight > 0) {
      baseHeight = Math.min(baseHeight, maxHeight);
    }
    cssHeight = toVw(baseHeight, effectiveBaseWidth || baseWidth || 1);
  }

  function getStyle(item) {
    const frame = getFrame(item);
    if (!frame) return '';
    const baseWidth = effectiveBaseWidth || (isMobile ? baseWidthMobile : baseWidthDesktop) || 1;
    const { x = 0, y = 0, width = 200, height = 100, z = 1, opacity = 1 } = frame;
    return `
      position:absolute;
      left:${toVw(x, baseWidth)};
      top:${toVw(y, baseWidth)};
      width:${toVw(width, baseWidth)};
      height:${toVw(height, baseWidth)};
      z-index:${z};
      opacity:${opacity};
      overflow:hidden;
    `;
  }
</script>

<div
  class="free-canvas"
  style={`width:100vw;height:${cssHeight};background:${backgroundColor};position:relative;overflow:hidden;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);`}
>
  {#each items as item (item.id)}
    <div class="canvas-item" style={getStyle(item)}>
      {#if item.type === 'text'}
        {@const tag = getTypographyTag(item)}
        {@const contentHasHtml = hasHtml(item.content)}
        <div class="text" style={getTextContainerStyle(item)}>
          {#if contentHasHtml}
            {@html item.content || ''}
          {:else}
            <svelte:element this={tag || 'p'} class="text-content">{@html item.content || ''}</svelte:element>
          {/if}
        </div>
      {:else if item.type === 'image'}
        {#if getMediaSource(item)}
          <img src={getMediaSource(item)} alt={item.alt || ''} style="width:100%;height:100%;object-fit:${item.objectFit || 'cover'};" />
        {/if}
      {:else if item.type === 'video'}
        {#if getMediaSource(item)}
          <video src={getMediaSource(item)} poster={item.poster || ''} autoplay={item.autoplay} loop={item.loop} muted={item.muted ?? true} playsinline style="width:100%;height:100%;object-fit:${item.objectFit || 'cover'};"></video>
        {/if}
      {/if}
    </div>
  {/each}
</div>

<style>
  .free-canvas {
    position: relative;
  }

  .canvas-item {
    position: absolute;
  }

  .text {
    width: 100%;
    height: 100%;
  }

  .text-content {
    width: 100%;
  }

  img,
  video {
    display: block;
  }
</style>
