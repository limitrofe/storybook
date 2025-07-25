<!-- src/lib/components/story/ScrollyTelling.svelte -->
<script>
  import { onMount } from 'svelte';
  
  export let steps = [];
  export let backgroundImage = '';
  export let stickyHeight = '100vh';
  
  let currentStep = 0;
  let stepsContainer;
  let stickyElement;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.dataset.step);
            currentStep = stepIndex;
          }
        });
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0.5
      }
    );

    const stepElements = stepsContainer.querySelectorAll('.scrolly-step');
    stepElements.forEach((step) => observer.observe(step));

    return () => observer.disconnect();
  });
</script>

<div class="scrolly-container">
  <div class="scrolly-sticky" style="height: {stickyHeight}">
    <div 
      class="scrolly-background"
      style="background-image: url({backgroundImage})"
    ></div>
    
    <div class="scrolly-content">
      {#each steps as step, index}
        <div 
          class="scrolly-visual" 
          class:active={currentStep === index}
        >
          {#if step.image}
            <img src={step.image} alt={step.alt || ''} />
          {/if}
          {#if step.video}
            <video autoplay muted loop>
              <source src={step.video} type="video/mp4" />
            </video>
          {/if}
          {#if step.html}
            {@html step.html}
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div class="scrolly-steps" bind:this={stepsContainer}>
    {#each steps as step, index}
      <div 
        class="scrolly-step"
        data-step={index}
      >
        <div class="scrolly-step-content">
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .scrolly-container {
    position: relative;
  }

  .scrolly-sticky {
    position: sticky;
    top: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scrolly-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0.3;
  }

  .scrolly-content {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scrolly-visual {
    position: absolute;
    opacity: 0;
    transition: opacity 0.5s ease;
    max-width: 90%;
    max-height: 90%;
  }

  .scrolly-visual.active {
    opacity: 1;
  }

  .scrolly-visual img,
  .scrolly-visual video {
    width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .scrolly-steps {
    position: relative;
    z-index: 3;
  }

  .scrolly-step {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 2rem;
  }

  .scrolly-step-content {
    background: var(--color-background);
    color: var(--color-text);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    margin-left: auto;
    margin-right: 2rem;
  }

  .scrolly-step-content h3 {
    font-size: var(--font-size-100);
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--color-primary);
  }

  .scrolly-step-content p {
    font-size: var(--font-size-70);
    line-height: 1.6;
    margin: 0;
  }

  @media (max-width: 768px) {
    .scrolly-step-content {
      margin: 0 auto;
    }
  }
</style>
