<script>
  export let stepText;
  export let i;
  export let length;
</script>

<section class="step-container" class:last-section={i === length}>
  <div class="step-content">
    {@html stepText}
  </div>
</section>

<style>
    .step-container {
        display: flex;
justify-content: flex-end; /* Alinha card à direita no desktop */
        align-items: center;
min-height: 100vh; /* Cria a distância de rolagem */
        padding: 2rem 5vw;
/* Espaçamento lateral */
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
            justify-content: center;
/* Centraliza o card no mobile */
            min-height: 90vh;
}
        .step-content {
          max-width: 90%;
}
    }
</style>