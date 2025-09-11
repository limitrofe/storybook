<!-- src/lib/components/story/shared/Step.svelte -->
<script>
  export let stepText;
  export let i;
  export let length;
  export let position = 'right'; // NOVO: posição do step
</script>

<section class="step-container position-{position}" class:last-section={i === length}>
  <div class="step-content">
    {@html stepText}
  </div>
</section>

<style>
    .step-container {
        display: flex;
        align-items: center;
        min-height: 100vh;
        padding: 2rem 5vw;
    }

    /* NOVO: Posicionamentos baseados na classe */
    .position-left {
        justify-content: flex-start;
    }
    
    .position-center {
        justify-content: center;
    }
    
    .position-right {
        justify-content: flex-end;
    }

    .step-content {
        background-color: rgba(var(--color-background-rgb), 0.9);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: var(--color-text);
        padding: 2rem;
        border: 1px solid var(--color-border);
        border-radius: 12px;
        max-width: 450px;
        width: 100%;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    :global(.step-content h3) {
        font-size: var(--font-size-90);
        font-weight: 700;
        margin: 0 0 1rem 0;
        color: var(--color-primary);
        line-height: 1.2;
    }

    :global(.step-content div) {
        font-size: var(--font-size-60);
        line-height: 1.6;
    }

    .last-section {
        margin-bottom: 0;
        min-height: 0;
        padding-bottom: 50vh;
    }
    
    @media (max-width: 768px) {
        .step-container {
            justify-content: center !important; /* Mobile sempre centralizado */
            min-height: 90vh;
        }
        
        .step-content {
            max-width: 90%;
        }
    }
</style>