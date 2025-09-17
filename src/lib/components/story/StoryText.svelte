<!-- src/lib/components/story/StoryText.svelte -->
<script>
  export let content = '';
  export let variant = 'body'; // 'body', 'lead', 'quote'
  export let align = 'left'; // 'left', 'center', 'right', 'justify'
  export let maxWidth = '700px';
  export let author = '';
  export let role = '';
  export let fontSizeDesktop = '';
  export let fontSizeMobile = '';
  export let lineHeightDesktop = '';
  export let lineHeightMobile = '';
  export let textColor = '';

  const FALLBACKS = {
    body: { sizeDesktop: '1.1rem', sizeMobile: '1rem', lineDesktop: '1.8', lineMobile: '1.7' },
    lead: { sizeDesktop: '1.5rem', sizeMobile: '1.3rem', lineDesktop: '1.6', lineMobile: '1.6' },
    blockquote: { sizeDesktop: '2rem', sizeMobile: '1.6rem', lineDesktop: '1.4', lineMobile: '1.45' }
  };

  const variantMap = {
    body: 'body',
    lead: 'lead',
    quote: 'blockquote'
  };

  $: variantKey = variantMap[variant] || 'body';
  $: fallback = FALLBACKS[variantKey] || FALLBACKS.body;
  $: computedFontSizeDesktop = fontSizeDesktop || `var(--typography-${variantKey}-desktop-font-size, ${fallback.sizeDesktop})`;
  $: computedFontSizeMobile = fontSizeMobile || `var(--typography-${variantKey}-mobile-font-size, ${fallback.sizeMobile})`;
  $: computedLineHeightDesktop = lineHeightDesktop || `var(--typography-${variantKey}-desktop-line-height, ${fallback.lineDesktop})`;
  $: computedLineHeightMobile = lineHeightMobile || `var(--typography-${variantKey}-mobile-line-height, ${fallback.lineMobile})`;
  $: contentStyle = [
    `--story-text-font-size-desktop:${computedFontSizeDesktop}`,
    `--story-text-line-height-desktop:${computedLineHeightDesktop}`,
    `--story-text-font-size-mobile:${computedFontSizeMobile}`,
    `--story-text-line-height-mobile:${computedLineHeightMobile}`,
    textColor ? `--story-text-color:${textColor}` : ''
  ].filter(Boolean).join('; ');
</script>

<div class="story-text story-text--{variant}" style="text-align: {align}; max-width: {maxWidth};">
  <div class="story-text__content text-variant-{variant}" style={contentStyle}>
    {#if variant === 'quote'}
      <div class="quote-container">
        <blockquote class="modern-quote">
          <div class="quote-text">
            {@html content}
          </div>
          
          {#if author}
            <footer class="quote-attribution">
              <div class="attribution-line"></div>
              <div class="attribution-content">
                <cite class="author-name">{author}</cite>
                {#if role}
                  <span class="author-role">{role}</span>
                {/if}
              </div>
            </footer>
          {/if}
        </blockquote>
      </div>
    {:else}
      {@html content}
    {/if}
  </div>
</div>

<style>
  .story-text {
    margin: 2rem auto;
    padding: 0 1rem;
    color: var(--story-text-color, var(--color-text));
  }

  .story-text__content {
    width: 100%;
    font-size: var(--story-text-font-size-desktop, var(--typography-body-desktop-font-size, 1.1rem));
    line-height: var(--story-text-line-height-desktop, var(--typography-body-desktop-line-height, 1.8));
    color: var(--story-text-color, var(--color-text));
  }

  .story-text--lead .story-text__content {
    color: var(--story-text-color, var(--typography-lead-color, var(--color-secondary)));
  }

  @media (max-width: 768px) {
    .story-text__content {
      font-size: var(--story-text-font-size-mobile, var(--typography-body-mobile-font-size, 1rem));
      line-height: var(--story-text-line-height-mobile, var(--typography-body-mobile-line-height, 1.7));
    }
  }

  /* Variant: Quote */
  .story-text--quote {
    margin: 3rem auto;
  }

  .story-text--quote .story-text__content {
    font-size: var(--story-text-font-size-desktop, var(--typography-blockquote-desktop-font-size, 2rem));
    line-height: var(--story-text-line-height-desktop, var(--typography-blockquote-desktop-line-height, 1.4));
    color: var(--story-text-color, var(--typography-blockquote-color, var(--color-text)));
  }

  @media (max-width: 768px) {
    .story-text--quote .story-text__content {
      font-size: var(--story-text-font-size-mobile, var(--typography-blockquote-mobile-font-size, 1.6rem));
      line-height: var(--story-text-line-height-mobile, var(--typography-blockquote-mobile-line-height, 1.45));
    }
  }

  .quote-container {
    position: relative;
    background: var(--typography-blockquote-background, var(--color-highlight-bg));
    border-radius: 24px;
    padding: 2.5rem;
    border: 1px solid var(--typography-blockquote-border-color, var(--color-border));
    transition: all 0.3s ease;
  }

  .quote-container:hover {
    transform: translateY(-2px);
  }

  .quote-text {
    margin: 0;
    font-style: normal;
  }

  .quote-attribution {
    margin-top: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .attribution-line {
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, var(--typography-blockquote-accent-color, var(--color-primary)), transparent);
    border-radius: 1px;
  }

  .author-name {
    font-style: normal;
    font-weight: 700;
    font-size: var(--typography-small-desktop-font-size, 0.95rem);
    color: var(--typography-blockquote-accent-color, var(--color-primary));
    display: block;
    margin-bottom: 0.25rem;
  }

  .author-role {
    font-size: var(--typography-small-desktop-font-size, 0.9rem);
    color: var(--story-text-color, var(--color-secondary));
    font-weight: 500;
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    .quote-container {
      padding: 2rem 1.5rem;
      border-radius: 20px;
    }

    .author-name {
      font-size: var(--typography-small-mobile-font-size, 0.85rem);
    }

    .author-role {
      font-size: var(--typography-small-mobile-font-size, 0.82rem);
    }
  }

  .story-text :global(p) {
    margin: 1.5rem 0;
  }

  .story-text :global(strong) {
    font-weight: 700;
    color: var(--story-text-color, var(--color-primary));
  }

  .story-text :global(em) {
    color: var(--story-text-color, var(--color-accent));
    font-style: italic;
  }

  .story-text :global(a) {
    color: var(--story-text-color, var(--color-primary));
    text-decoration: none;
    border-bottom: 1px solid currentColor;
    transition: all 0.3s ease;
  }

  .story-text :global(a:hover) {
    opacity: 0.8;
    transform: translateY(-1px);
  }
</style>
