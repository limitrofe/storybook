<script>
  import Header from './Header.svelte';
  import HeaderCaotico from './HeaderCaotico.svelte';
  import StoryText from './StoryText.svelte';
  import SectionTitle from './SectionTitle.svelte';
  import PhotoWithCaption from './PhotoWithCaption.svelte';
  import VideoPlayer from './VideoPlayer.svelte';
  import GloboPlayer from './GloboPlayer.svelte';
  import DebugGloboPlayer from './DebugGloboPlayer.svelte';
  import PhotoGallery from './PhotoGallery.svelte';
  import Carousel from './Carousel.svelte';
  import RecommendedItems from './RecommendedItems.svelte';
  import Parallax from './Parallax.svelte';
  import BeforeAfter from './BeforeAfter.svelte';
  import ScrollyTelling from './ScrollyTelling.svelte';
  import ScrollyFrames from './ScrollyFrames.svelte';
  import CharacterPresentation from './CharacterPresentation.svelte';
  import Curiosidades from './Curiosidades.svelte';
  import FlourishEmbed from './FlourishEmbed.svelte';
  import FlourishScrolly from './FlourishScrolly.svelte';
  import AnchorPoint from './AnchorPoint.svelte';
  import TimelineInteractive from './TimelineInteractive.svelte';
  import DocumentViewer from './DocumentViewer.svelte';
  import CrimeExplainer from './CrimeExplainer.svelte';
  import StickyNavigationMenu from './StickyNavigationMenu.svelte';
  import ResponsiveMediaLayout from './ResponsiveMediaLayout.svelte';
  import FlexibleLayout from './FlexibleLayout.svelte';
  import AbsoluteCanvas from './AbsoluteCanvas.svelte';
  import { parseStoryComponents } from '$lib/utils/storyRenderer.js';

  export let data;

  const DEVICES = ['mobile', 'tablet', 'desktop', 'wide'];

  const DEFAULT_POSITION = {
    mode: 'relative',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    zIndex: 'auto',
    transform: 'none'
  };

  const DEFAULT_BACKGROUND = {
    color: '',
    image: { mobile: '', tablet: '', desktop: '', wide: '' },
    video: { mobile: '', tablet: '', desktop: '', wide: '' },
    size: { mobile: 'cover', tablet: 'cover', desktop: 'cover', wide: 'cover' },
    position: { mobile: 'center center', tablet: 'center center', desktop: 'center center', wide: 'center center' },
    repeat: { mobile: 'no-repeat', tablet: 'no-repeat', desktop: 'no-repeat', wide: 'no-repeat' },
    overlayColor: 'transparent',
    overlayOpacity: '0'
  };

  let container = data?.container || {};
  $: container = data?.container || {};

  function toResponsiveObject(source, fallbackDesktop = '', fallbackMobile = fallbackDesktop) {
    if (source === null || source === undefined) {
      return {
        mobile: fallbackMobile,
        tablet: fallbackDesktop,
        desktop: fallbackDesktop,
        wide: fallbackDesktop
      };
    }

    if (typeof source === 'string' || typeof source === 'number') {
      const value = String(source);
      return {
        mobile: value,
        tablet: value,
        desktop: value,
        wide: value
      };
    }

    if (typeof source === 'object') {
      const desktop = source.desktop ?? fallbackDesktop;
      const mobile = source.mobile ?? desktop ?? fallbackMobile;
      const tablet = source.tablet ?? desktop ?? mobile;
      const wide = source.wide ?? desktop ?? tablet;

      return { mobile, tablet, desktop, wide };
    }

    return {
      mobile: fallbackMobile,
      tablet: fallbackDesktop,
      desktop: fallbackDesktop,
      wide: fallbackDesktop
    };
  }

  function getResponsiveValue(value, device, fallback = 'auto') {
    if (value === null || value === undefined) return fallback;

    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    if (typeof value === 'object') {
      const deviceValue = value[device];
      if (deviceValue !== undefined && deviceValue !== null && deviceValue !== '') {
        return deviceValue;
      }

      if (device === 'tablet') {
        return value.desktop ?? value.mobile ?? fallback;
      }

      if (device === 'wide') {
        return value.desktop ?? value.tablet ?? fallback;
      }

      if (device === 'mobile') {
        return value.desktop ?? fallback;
      }

      return value.mobile ?? fallback;
    }

    return fallback;
  }

  function collectResponsiveValues(source, fallback) {
    const mobile = getResponsiveValue(source, 'mobile', fallback);
    const tablet = getResponsiveValue(source, 'tablet', mobile);
    const desktop = getResponsiveValue(source, 'desktop', tablet);
    const wide = getResponsiveValue(source, 'wide', desktop);

    return { mobile, tablet, desktop, wide };
  }

  function normalizePositionConfig(position, device) {
    if (!position) return { ...DEFAULT_POSITION };

    const deviceConfig = typeof position === 'string' ? position : position[device];

    if (typeof deviceConfig === 'string') {
      return {
        ...DEFAULT_POSITION,
        mode: deviceConfig
      };
    }

    if (typeof deviceConfig === 'object' && deviceConfig !== null) {
      return {
        ...DEFAULT_POSITION,
        ...deviceConfig,
        mode: deviceConfig.mode || DEFAULT_POSITION.mode,
        top: deviceConfig.top ?? DEFAULT_POSITION.top,
        right: deviceConfig.right ?? DEFAULT_POSITION.right,
        bottom: deviceConfig.bottom ?? DEFAULT_POSITION.bottom,
        left: deviceConfig.left ?? DEFAULT_POSITION.left,
        zIndex: deviceConfig.zIndex ?? DEFAULT_POSITION.zIndex,
        transform: deviceConfig.transform ?? DEFAULT_POSITION.transform
      };
    }

    return { ...DEFAULT_POSITION };
  }

  function getPositionMode(item, device) {
    return normalizePositionConfig(item.position, device).mode;
  }

  function getPositionProperty(item, device, property) {
    return normalizePositionConfig(item.position, device)[property] ?? 'auto';
  }

  function toCssUrl(value) {
    if (!value) return 'none';
    const sanitized = String(value).replace(/'/g, "\\'");
    return `url('${sanitized}')`;
  }

  function getBackground(item) {
    if (!item || typeof item !== 'object') return { ...DEFAULT_BACKGROUND };

    const config = item.background ?? {};

    const background = {
      color: config.color ?? DEFAULT_BACKGROUND.color,
      image: toResponsiveObject(config.image ?? { desktop: config.imageDesktop, mobile: config.imageMobile }, '', ''),
      video: toResponsiveObject(config.video ?? { desktop: config.videoDesktop, mobile: config.videoMobile }, '', ''),
      size: toResponsiveObject(config.size ?? { desktop: config.imageSizeDesktop, mobile: config.imageSizeMobile }, 'cover', 'cover'),
      position: toResponsiveObject(config.position ?? { desktop: config.imagePositionDesktop, mobile: config.imagePositionMobile }, 'center center', 'center center'),
      repeat: toResponsiveObject(config.repeat ?? { desktop: config.imageRepeatDesktop, mobile: config.imageRepeatMobile }, 'no-repeat', 'no-repeat'),
      overlayColor: config.overlayColor ?? DEFAULT_BACKGROUND.overlayColor,
      overlayOpacity: config.overlayOpacity ?? DEFAULT_BACKGROUND.overlayOpacity
    };

    background.image.tablet = background.image.tablet || background.image.desktop || background.image.mobile;
    background.image.wide = background.image.wide || background.image.desktop || background.image.tablet;
    background.video.tablet = background.video.tablet || background.video.desktop || background.video.mobile;
    background.video.wide = background.video.wide || background.video.desktop || background.video.tablet;

    return background;
  }

  function hasBackgroundVideo(item) {
    const background = getBackground(item);
    return Boolean(background.video.mobile || background.video.tablet || background.video.desktop || background.video.wide);
  }

  function hasBackgroundOverlay(item) {
    const background = getBackground(item);
    return background.overlayColor && background.overlayColor !== 'transparent' && background.overlayOpacity !== '0';
  }

  function assignResponsive(styleEntries, baseVar, values) {
    styleEntries.push(`${baseVar}-mobile:${values.mobile}`);
    styleEntries.push(`${baseVar}-tablet:${values.tablet}`);
    styleEntries.push(`${baseVar}-desktop:${values.desktop}`);
    styleEntries.push(`${baseVar}-wide:${values.wide}`);
  }

  function buildBaseStyle(item, extraVars = {}) {
    const styles = item?.styles || {};
    const background = getBackground(item);

    const styleEntries = [];

    const responsiveMappings = [
      ['--max-width', styles.maxWidth, 'none'],
      ['--max-height', styles.maxHeight, 'none'],
      ['--width', styles.width, 'auto'],
      ['--height', styles.height, 'auto'],
      ['--margin', styles.margin, '0'],
      ['--padding', styles.padding, '0'],
      ['--text-align', styles.textAlign, 'left'],
      ['--font-size', styles.fontSize, 'inherit'],
      ['--font-weight', styles.fontWeight, 'normal'],
      ['--line-height', styles.lineHeight, 'normal'],
      ['--letter-spacing', styles.letterSpacing, 'normal'],
      ['--display', styles.display, 'block'],
      ['--border-radius', styles.borderRadius, '0'],
      ['--align-self', styles.alignSelf, 'auto'],
      ['--opacity', styles.opacity, '1']
    ];

    responsiveMappings.forEach(([cssVar, value, fallback]) => {
      assignResponsive(styleEntries, cssVar, collectResponsiveValues(value, fallback));
    });

    styleEntries.push(`--font-family:${styles.fontFamily || 'inherit'}`);
    styleEntries.push(`--color:${styles.color || 'inherit'}`);
    styleEntries.push(`--background-color-item:${styles.backgroundColor || 'transparent'}`);
    styleEntries.push(`--box-shadow:${styles.boxShadow || 'none'}`);

    assignResponsive(styleEntries, '--position', {
      mobile: getPositionMode(item, 'mobile'),
      tablet: getPositionMode(item, 'tablet'),
      desktop: getPositionMode(item, 'desktop'),
      wide: getPositionMode(item, 'wide')
    });

    ['top', 'right', 'bottom', 'left'].forEach((prop) => {
      assignResponsive(styleEntries, `--${prop}`, {
        mobile: getPositionProperty(item, 'mobile', prop),
        tablet: getPositionProperty(item, 'tablet', prop),
        desktop: getPositionProperty(item, 'desktop', prop),
        wide: getPositionProperty(item, 'wide', prop)
      });
    });

    assignResponsive(styleEntries, '--transform', {
      mobile: getPositionProperty(item, 'mobile', 'transform') || 'none',
      tablet: getPositionProperty(item, 'tablet', 'transform') || 'none',
      desktop: getPositionProperty(item, 'desktop', 'transform') || 'none',
      wide: getPositionProperty(item, 'wide', 'transform') || 'none'
    });

    assignResponsive(styleEntries, '--z-index', {
      mobile: getPositionProperty(item, 'mobile', 'zIndex') || 'auto',
      tablet: getPositionProperty(item, 'tablet', 'zIndex') || 'auto',
      desktop: getPositionProperty(item, 'desktop', 'zIndex') || 'auto',
      wide: getPositionProperty(item, 'wide', 'zIndex') || 'auto'
    });

    assignResponsive(styleEntries, '--item-background-image', {
      mobile: background.image.mobile ? toCssUrl(background.image.mobile) : 'none',
      tablet: background.image.tablet ? toCssUrl(background.image.tablet) : (background.image.desktop ? toCssUrl(background.image.desktop) : 'none'),
      desktop: background.image.desktop ? toCssUrl(background.image.desktop) : 'none',
      wide: background.image.wide ? toCssUrl(background.image.wide) : (background.image.desktop ? toCssUrl(background.image.desktop) : 'none')
    });

    assignResponsive(styleEntries, '--item-background-size', collectResponsiveValues(background.size, 'cover'));
    assignResponsive(styleEntries, '--item-background-position', collectResponsiveValues(background.position, 'center center'));
    assignResponsive(styleEntries, '--item-background-repeat', collectResponsiveValues(background.repeat, 'no-repeat'));

    styleEntries.push(`--item-background-color:${background.color || 'transparent'}`);
    styleEntries.push(`--item-background-overlay-color:${background.overlayColor || 'transparent'}`);
    styleEntries.push(`--item-background-overlay-opacity:${background.overlayOpacity || '0'}`);

    Object.entries(extraVars).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        styleEntries.push(`${key}:${value}`);
      }
    });

    return styleEntries.filter(Boolean).join('; ');
  }

  const viewport = (node) => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          node.dispatchEvent(new CustomEvent('enterViewport'));
        } else {
          node.dispatchEvent(new CustomEvent('exitViewport'));
        }
      });
    });

    observer.observe(node);

    return {
      destroy() {
        observer.unobserve(node);
      }
    };
  };

  function handleEnterViewport(event) {
    const video = event.target;
    if (video.hasAttribute('data-autoplay-in-view') && video.dataset.autoplayInView === 'true') {
      video.play().catch(() => {});
    }
  }

  function handleExitViewport(event) {
    const video = event.target;
    if (video.hasAttribute('data-autoplay-in-view') && video.dataset.autoplayInView === 'true') {
      video.pause();
    }
  }

  function toBackgroundImages(source) {
    const responsive = toResponsiveObject(source, '', '');
    return {
      mobile: responsive.mobile ? toCssUrl(responsive.mobile) : 'none',
      tablet: responsive.tablet ? toCssUrl(responsive.tablet) : (responsive.desktop ? toCssUrl(responsive.desktop) : 'none'),
      desktop: responsive.desktop ? toCssUrl(responsive.desktop) : 'none',
      wide: responsive.wide ? toCssUrl(responsive.wide) : (responsive.desktop ? toCssUrl(responsive.desktop) : 'none')
    };
  }

  $: containerPadding = collectResponsiveValues(container.padding || data?.padding, '0');
  $: containerMargin = collectResponsiveValues(container.margin || data?.margin, '0');
  $: containerGap = collectResponsiveValues(container.gap || data?.gap, '0');
  $: containerHeight = collectResponsiveValues(container.height || data?.height, 'auto');
  $: containerFlexDirection = collectResponsiveValues(container.flexDirection || data?.flexDirection, 'column');
  $: containerAlignItems = collectResponsiveValues(container.alignItems || data?.alignItems, 'center');
  $: containerJustifyContent = collectResponsiveValues(container.justifyContent || data?.justifyContent, 'center');
  $: containerBackgroundImages = toBackgroundImages(container.backgroundImage || data?.backgroundImage);

  const COMPONENT_MAP = {
    header: Header,
    'header-caotico': HeaderCaotico,
    text: StoryText,
    'section-title': SectionTitle,
    photo: PhotoWithCaption,
    video: VideoPlayer,
    'globo-player': GloboPlayer,
    'debug-globo-player': DebugGloboPlayer,
    gallery: PhotoGallery,
    carousel: Carousel,
    'recommended-items': RecommendedItems,
    parallax: Parallax,
    'before-after': BeforeAfter,
    scrolly: ScrollyTelling,
    'video-scrolly-new': ScrollyFrames,
    'character-presentation': CharacterPresentation,
    curiosidades: Curiosidades,
    flourish: FlourishEmbed,
    'flourish-scrolly': FlourishScrolly,
    anchor: AnchorPoint,
    'timeline-interactive': TimelineInteractive,
    'document-viewer': DocumentViewer,
    'crime-explainer': CrimeExplainer,
    'sticky-navigation': StickyNavigationMenu,
    'responsive-media': ResponsiveMediaLayout,
    'flexible-layout': FlexibleLayout,
    'absolute-canvas': AbsoluteCanvas
  };

  function getStoryComponent(item) {
    const parsed = parseStoryComponents([item]);
    if (!parsed || !parsed.length) return null;

    const { type, id: _id, ...props } = parsed[0];
    const Component = COMPONENT_MAP[type];
    if (!Component) return null;

    return { component: Component, props };
  }
</script>

<section
  class="super-flex-container"
  style:--background-color={container.backgroundColor || data?.backgroundColor || 'transparent'}
  style:--background-image-mobile={containerBackgroundImages.mobile}
  style:--background-image-tablet={containerBackgroundImages.tablet}
  style:--background-image-desktop={containerBackgroundImages.desktop}
  style:--background-image-wide={containerBackgroundImages.wide}
  style:--container-padding-mobile={containerPadding.mobile}
  style:--container-padding-tablet={containerPadding.tablet}
  style:--container-padding-desktop={containerPadding.desktop}
  style:--container-padding-wide={containerPadding.wide}
  style:--container-margin-mobile={containerMargin.mobile}
  style:--container-margin-tablet={containerMargin.tablet}
  style:--container-margin-desktop={containerMargin.desktop}
  style:--container-margin-wide={containerMargin.wide}
  style:--container-gap-mobile={containerGap.mobile}
  style:--container-gap-tablet={containerGap.tablet}
  style:--container-gap-desktop={containerGap.desktop}
  style:--container-gap-wide={containerGap.wide}
  style:--container-height-mobile={containerHeight.mobile}
  style:--container-height-tablet={containerHeight.tablet}
  style:--container-height-desktop={containerHeight.desktop}
  style:--container-height-wide={containerHeight.wide}
  style:--container-display={container.display || data?.display || 'flex'}
  style:--container-flex-direction-mobile={containerFlexDirection.mobile}
  style:--container-flex-direction-tablet={containerFlexDirection.tablet}
  style:--container-flex-direction-desktop={containerFlexDirection.desktop}
  style:--container-flex-direction-wide={containerFlexDirection.wide}
  style:--container-align-mobile={containerAlignItems.mobile}
  style:--container-align-tablet={containerAlignItems.tablet}
  style:--container-align-desktop={containerAlignItems.desktop}
  style:--container-align-wide={containerAlignItems.wide}
  style:--container-justify-mobile={containerJustifyContent.mobile}
  style:--container-justify-tablet={containerJustifyContent.tablet}
  style:--container-justify-desktop={containerJustifyContent.desktop}
  style:--container-justify-wide={containerJustifyContent.wide}
>
  {#if Array.isArray(data.items)}
    {#each data.items as item}
      {#if item}
        {@const background = getBackground(item)}
        <div class={`flex-item type-${item.type || 'custom'}`} style={buildBaseStyle(item)}>
          {#if hasBackgroundVideo(item) || hasBackgroundOverlay(item)}
            <div class="item-background">
              {#if hasBackgroundVideo(item)}
                <video class="item-background-video" autoplay loop muted playsinline>
                  {#if background.video.mobile}
                    <source src={background.video.mobile} type="video/mp4" media="(max-width: 767px)" />
                  {/if}
                  {#if background.video.tablet}
                    <source src={background.video.tablet} type="video/mp4" media="(min-width: 768px) and (max-width: 1199px)" />
                  {/if}
                  {#if background.video.desktop}
                    <source src={background.video.desktop} type="video/mp4" media="(min-width: 1200px) and (max-width: 1599px)" />
                  {/if}
                  {#if background.video.wide}
                    <source src={background.video.wide} type="video/mp4" media="(min-width: 1600px)" />
                  {/if}
                </video>
              {/if}
              {#if hasBackgroundOverlay(item)}
                <div class="item-background-overlay"></div>
              {/if}
            </div>
          {/if}

          <div class="item-content">
            {#if item.type === 'text'}
              <!-- svelte-ignore missing-declaration -->
              <svelte:element this={item.tag || 'div'} class="text-element">
                {@html item.content}
              </svelte:element>
              {#if item.grifo}
                <img
                  class="grifo-decorator"
                  src={item.grifo.src}
                  alt=""
                />
              {/if}

            {:else if item.type === 'image' && item.src}
              {#if item.link}
                <a href={item.link} target={item.target || '_self'} style="display: block; text-decoration: none;">
                  <picture class="image-element">
                    {#if item.src.mobile}
                      <source media="(max-width: 767px)" srcset={item.src.mobile} />
                    {/if}
                    {#if item.src.desktop}
                      <source media="(min-width: 768px)" srcset={item.src.desktop} />
                    {/if}
                    <img src={item.src.mobile || item.src.desktop || item.src} alt={item.alt || ''} loading="lazy" />
                  </picture>
                </a>
              {:else}
                <picture class="image-element">
                  {#if item.src.mobile}
                    <source media="(max-width: 767px)" srcset={item.src.mobile} />
                  {/if}
                  {#if item.src.desktop}
                    <source media="(min-width: 768px)" srcset={item.src.desktop} />
                  {/if}
                  <img src={item.src.mobile || item.src.desktop || item.src} alt={item.alt || ''} loading="lazy" />
                </picture>
              {/if}

            {:else if item.type === 'video' && item.src}
              {#if item.link}
                <a href={item.link} target={item.target || '_self'} style="display: block; text-decoration: none;">
                  <video
                    class="video-element"
                    loop={item.loop || false}
                    muted={item.muted || false}
                    autoplay={item.autoplay || false}
                    playsinline
                    data-autoplay-in-view={item.autoplayInView || false}
                    use:viewport
                    on:enterViewport={handleEnterViewport}
                    on:exitViewport={handleExitViewport}
                  >
                    {#if typeof item.src === 'object'}
                      {#if item.src.mobile}
                        <source src={item.src.mobile} type="video/mp4" media="(max-width: 767px)" />
                      {/if}
                      {#if item.src.desktop}
                        <source src={item.src.desktop} type="video/mp4" media="(min-width: 768px)" />
                      {/if}
                    {/if}
                    Seu navegador não suporta vídeos.
                  </video>
                </a>
              {:else}
                <video
                  class="video-element"
                  loop={item.loop || false}
                  muted={item.muted || false}
                  autoplay={item.autoplay || false}
                  playsinline
                  data-autoplay-in-view={item.autoplayInView || false}
                  use:viewport
                  on:enterViewport={handleEnterViewport}
                  on:exitViewport={handleExitViewport}
                >
                  {#if typeof item.src === 'object'}
                    {#if item.src.mobile}
                      <source src={item.src.mobile} type="video/mp4" media="(max-width: 767px)" />
                    {/if}
                    {#if item.src.desktop}
                      <source src={item.src.desktop} type="video/mp4" media="(min-width: 768px)" />
                    {/if}
                  {/if}
                  Seu navegador não suporta vídeos.
                </video>
              {/if}

            {:else if item.type === 'audio' && item.src}
              <div class="audio-wrapper">
                <audio src={item.src.desktop || item.src.mobile || item.src} controls>
                  Seu navegador não suporta áudio.
                </audio>
              </div>

            {:else}
              {@const storyComponent = getStoryComponent(item)}
              {#if storyComponent}
                <svelte:component this={storyComponent.component} {...storyComponent.props} />
              {:else}
                <slot name="superflex-custom" {item}></slot>
              {/if}
            {/if}
          </div>
        </div>
      {/if}
    {/each}
  {/if}
</section>

<style>
  .super-flex-container {
    position: relative;
    display: var(--container-display, flex);
    flex-direction: var(--container-flex-direction-mobile, column);
    justify-content: var(--container-justify-mobile, center);
    align-items: var(--container-align-mobile, center);
    background-color: var(--background-color);
    background-image: var(--background-image-mobile, none);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    padding: var(--container-padding-mobile, 0);
    margin: var(--container-margin-mobile, 0);
    gap: var(--container-gap-mobile, 0);
    min-height: var(--container-height-mobile, auto);
    box-sizing: border-box;
    width: 100%;
  }

  .flex-item {
    position: relative;
    overflow: hidden;
    max-width: var(--max-width-mobile, 100%);
    width: var(--width-mobile, auto);
    height: var(--height-mobile, auto);
    max-height: var(--max-height-mobile, none);
    margin: var(--margin-mobile, 0);
    padding: var(--padding-mobile, 0);
    text-align: var(--text-align-mobile, left);
    position: var(--position-mobile, relative);
    top: var(--top-mobile, auto);
    right: var(--right-mobile, auto);
    bottom: var(--bottom-mobile, auto);
    left: var(--left-mobile, auto);
    transform: var(--transform-mobile, none);
    z-index: var(--z-index-mobile, auto);
    display: var(--display-mobile, block);
    align-self: var(--align-self-mobile, auto);
    opacity: var(--opacity-mobile, 1);
    background-color: var(--item-background-color, transparent);
    background-image: var(--item-background-image-mobile, none);
    background-size: var(--item-background-size-mobile, cover);
    background-position: var(--item-background-position-mobile, center center);
    background-repeat: var(--item-background-repeat-mobile, no-repeat);
    color: var(--color, inherit);
    font-family: var(--font-family, inherit);
    font-size: var(--font-size-mobile, inherit);
    font-weight: var(--font-weight-mobile, normal);
    line-height: var(--line-height-mobile, normal);
    letter-spacing: var(--letter-spacing-mobile, normal);
    box-shadow: var(--box-shadow, none);
    border-radius: var(--border-radius-mobile, 0);
    box-sizing: border-box;
  }

  .item-background {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .item-background-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-background-overlay {
    position: absolute;
    inset: 0;
    background: var(--item-background-overlay-color, transparent);
    opacity: var(--item-background-overlay-opacity, 0);
  }

  .item-content {
    position: relative;
    z-index: 1;
    width: 100%;
  }

  .text-element {
    font-family: var(--font-family, inherit);
    color: var(--color, inherit);
    font-size: var(--font-size-mobile, inherit);
    font-weight: var(--font-weight-mobile, normal);
    line-height: var(--line-height-mobile, normal);
    letter-spacing: var(--letter-spacing-mobile, normal);
  }

  .image-element,
  .video-element {
    display: block;
    width: 100%;
    height: auto;
  }

  .image-element img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: var(--border-radius-mobile, 0);
  }

  .video-element {
    border-radius: var(--border-radius-mobile, 0);
  }

  .audio-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .audio-wrapper audio {
    width: 100%;
    max-width: 480px;
  }

  .grifo-decorator {
    position: absolute;
    top: var(--grifo-offsetY-mobile, 3.5rem);
    left: 50%;
    transform: translateX(-50%);
    width: var(--grifo-width-mobile, 220px);
    height: auto;
    pointer-events: none;
    z-index: -1;
  }

  @media (min-width: 768px) {
    .super-flex-container {
      background-image: var(--background-image-tablet, var(--background-image-mobile, none));
      padding: var(--container-padding-tablet, var(--container-padding-mobile, 0));
      margin: var(--container-margin-tablet, var(--container-margin-mobile, 0));
      gap: var(--container-gap-tablet, var(--container-gap-mobile, 0));
      min-height: var(--container-height-tablet, var(--container-height-mobile, auto));
      flex-direction: var(--container-flex-direction-tablet, var(--container-flex-direction-mobile, column));
      justify-content: var(--container-justify-tablet, var(--container-justify-mobile, center));
      align-items: var(--container-align-tablet, var(--container-align-mobile, center));
    }

    .flex-item {
      max-width: var(--max-width-tablet, var(--max-width-mobile, 100%));
      width: var(--width-tablet, var(--width-mobile, auto));
      height: var(--height-tablet, var(--height-mobile, auto));
      max-height: var(--max-height-tablet, var(--max-height-mobile, none));
      margin: var(--margin-tablet, var(--margin-mobile, 0));
      padding: var(--padding-tablet, var(--padding-mobile, 0));
      text-align: var(--text-align-tablet, var(--text-align-mobile, left));
      position: var(--position-tablet, var(--position-mobile, relative));
      top: var(--top-tablet, var(--top-mobile, auto));
      right: var(--right-tablet, var(--right-mobile, auto));
      bottom: var(--bottom-tablet, var(--bottom-mobile, auto));
      left: var(--left-tablet, var(--left-mobile, auto));
      transform: var(--transform-tablet, var(--transform-mobile, none));
      z-index: var(--z-index-tablet, var(--z-index-mobile, auto));
      display: var(--display-tablet, var(--display-mobile, block));
      align-self: var(--align-self-tablet, var(--align-self-mobile, auto));
      opacity: var(--opacity-tablet, var(--opacity-mobile, 1));
      background-image: var(--item-background-image-tablet, var(--item-background-image-mobile, none));
      background-size: var(--item-background-size-tablet, var(--item-background-size-mobile, cover));
      background-position: var(--item-background-position-tablet, var(--item-background-position-mobile, center center));
      background-repeat: var(--item-background-repeat-tablet, var(--item-background-repeat-mobile, no-repeat));
      border-radius: var(--border-radius-tablet, var(--border-radius-mobile, 0));
    }

    .text-element {
      font-size: var(--font-size-tablet, var(--font-size-mobile, inherit));
      font-weight: var(--font-weight-tablet, var(--font-weight-mobile, normal));
      line-height: var(--line-height-tablet, var(--line-height-mobile, normal));
      letter-spacing: var(--letter-spacing-tablet, var(--letter-spacing-mobile, normal));
    }

    .image-element img,
    .video-element {
      border-radius: var(--border-radius-tablet, var(--border-radius-mobile, 0));
    }

    .grifo-decorator {
      top: var(--grifo-offsetY-tablet, var(--grifo-offsetY-mobile, 3.5rem));
      width: var(--grifo-width-tablet, var(--grifo-width-mobile, 220px));
    }
  }

  @media (min-width: 1200px) {
    .super-flex-container {
      background-image: var(--background-image-desktop, var(--background-image-tablet, none));
      padding: var(--container-padding-desktop, var(--container-padding-tablet, 0));
      margin: var(--container-margin-desktop, var(--container-margin-tablet, 0));
      gap: var(--container-gap-desktop, var(--container-gap-tablet, 0));
      min-height: var(--container-height-desktop, var(--container-height-tablet, auto));
      flex-direction: var(--container-flex-direction-desktop, var(--container-flex-direction-tablet, column));
      justify-content: var(--container-justify-desktop, var(--container-justify-tablet, center));
      align-items: var(--container-align-desktop, var(--container-align-tablet, center));
    }

    .flex-item {
      max-width: var(--max-width-desktop, var(--max-width-tablet, 100%));
      width: var(--width-desktop, var(--width-tablet, auto));
      height: var(--height-desktop, var(--height-tablet, auto));
      max-height: var(--max-height-desktop, var(--max-height-tablet, none));
      margin: var(--margin-desktop, var(--margin-tablet, 0));
      padding: var(--padding-desktop, var(--padding-tablet, 0));
      text-align: var(--text-align-desktop, var(--text-align-tablet, left));
      position: var(--position-desktop, var(--position-tablet, relative));
      top: var(--top-desktop, var(--top-tablet, auto));
      right: var(--right-desktop, var(--right-tablet, auto));
      bottom: var(--bottom-desktop, var(--bottom-tablet, auto));
      left: var(--left-desktop, var(--left-tablet, auto));
      transform: var(--transform-desktop, var(--transform-tablet, none));
      z-index: var(--z-index-desktop, var(--z-index-tablet, auto));
      display: var(--display-desktop, var(--display-tablet, block));
      align-self: var(--align-self-desktop, var(--align-self-tablet, auto));
      opacity: var(--opacity-desktop, var(--opacity-tablet, 1));
      background-image: var(--item-background-image-desktop, var(--item-background-image-tablet, none));
      background-size: var(--item-background-size-desktop, var(--item-background-size-tablet, cover));
      background-position: var(--item-background-position-desktop, var(--item-background-position-tablet, center center));
      background-repeat: var(--item-background-repeat-desktop, var(--item-background-repeat-tablet, no-repeat));
      border-radius: var(--border-radius-desktop, var(--border-radius-tablet, 0));
    }

    .text-element {
      font-size: var(--font-size-desktop, var(--font-size-tablet, inherit));
      font-weight: var(--font-weight-desktop, var(--font-weight-tablet, normal));
      line-height: var(--line-height-desktop, var(--line-height-tablet, normal));
      letter-spacing: var(--letter-spacing-desktop, var(--letter-spacing-tablet, normal));
    }

    .image-element img,
    .video-element {
      border-radius: var(--border-radius-desktop, var(--border-radius-tablet, 0));
    }

    .grifo-decorator {
      top: var(--grifo-offsetY-desktop, var(--grifo-offsetY-tablet, 3.5rem));
      width: var(--grifo-width-desktop, var(--grifo-width-tablet, 300px));
    }
  }

  @media (min-width: 1600px) {
    .super-flex-container {
      background-image: var(--background-image-wide, var(--background-image-desktop, none));
      padding: var(--container-padding-wide, var(--container-padding-desktop, 0));
      margin: var(--container-margin-wide, var(--container-margin-desktop, 0));
      gap: var(--container-gap-wide, var(--container-gap-desktop, 0));
      min-height: var(--container-height-wide, var(--container-height-desktop, auto));
      flex-direction: var(--container-flex-direction-wide, var(--container-flex-direction-desktop, column));
      justify-content: var(--container-justify-wide, var(--container-justify-desktop, center));
      align-items: var(--container-align-wide, var(--container-align-desktop, center));
    }

    .flex-item {
      max-width: var(--max-width-wide, var(--max-width-desktop, 100%));
      width: var(--width-wide, var(--width-desktop, auto));
      height: var(--height-wide, var(--height-desktop, auto));
      max-height: var(--max-height-wide, var(--max-height-desktop, none));
      margin: var(--margin-wide, var(--margin-desktop, 0));
      padding: var(--padding-wide, var(--padding-desktop, 0));
      text-align: var(--text-align-wide, var(--text-align-desktop, left));
      position: var(--position-wide, var(--position-desktop, relative));
      top: var(--top-wide, var(--top-desktop, auto));
      right: var(--right-wide, var(--right-desktop, auto));
      bottom: var(--bottom-wide, var(--bottom-desktop, auto));
      left: var(--left-wide, var(--left-desktop, auto));
      transform: var(--transform-wide, var(--transform-desktop, none));
      z-index: var(--z-index-wide, var(--z-index-desktop, auto));
      display: var(--display-wide, var(--display-desktop, block));
      align-self: var(--align-self-wide, var(--align-self-desktop, auto));
      opacity: var(--opacity-wide, var(--opacity-desktop, 1));
      background-image: var(--item-background-image-wide, var(--item-background-image-desktop, none));
      background-size: var(--item-background-size-wide, var(--item-background-size-desktop, cover));
      background-position: var(--item-background-position-wide, var(--item-background-position-desktop, center center));
      background-repeat: var(--item-background-repeat-wide, var(--item-background-repeat-desktop, no-repeat));
      border-radius: var(--border-radius-wide, var(--border-radius-desktop, 0));
    }

    .text-element {
      font-size: var(--font-size-wide, var(--font-size-desktop, inherit));
      font-weight: var(--font-weight-wide, var(--font-weight-desktop, normal));
      line-height: var(--line-height-wide, var(--line-height-desktop, normal));
      letter-spacing: var(--letter-spacing-wide, var(--letter-spacing-desktop, normal));
    }

    .image-element img,
    .video-element {
      border-radius: var(--border-radius-wide, var(--border-radius-desktop, 0));
    }

    .grifo-decorator {
      top: var(--grifo-offsetY-wide, var(--grifo-offsetY-desktop, 3.5rem));
      width: var(--grifo-width-wide, var(--grifo-width-desktop, 320px));
    }
  }
</style>
