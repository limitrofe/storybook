<script>
  export let notes = '';
  export let sources = []; // Array de strings ou objetos para fontes
  export let additionalGraphics = []; // Array de strings para contribuidores de gráficos
  export let editedBy = []; // Array de strings para editores
  export let authors = []; // Array de strings para autores principais (caso não venha do storyData)
</script>

<footer class="final-credits">
  <div class="credits-section">
    {#if authors.length > 0}
      <h3>Autores</h3>
      <ul class="credits-list">
        {#each authors as author}
          <li>{author}</li>
        {/each}
      </ul>
    {/if}

    {#if notes}
      <h3>Notas</h3>
      <p>{notes}</p>
    {/if}

    {#if sources.length > 0}
      <h3>Fontes</h3>
      <ul class="credits-list">
        {#each sources as source}
          <li>{source}</li>
        {/each}
      </ul>
    {/if}

    {#if additionalGraphics.length > 0}
      <h3>Contribuições Gráficas Adicionais</h3>
      <ul class="credits-list">
        {#each additionalGraphics as contributor}
          <li>{contributor}</li>
        {/each}
      </ul>
    {/if}

    {#if editedBy.length > 0}
      <h3>Edição</h3>
      <ul class="credits-list">
        {#each editedBy as editor}
          <li>{editor}</li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="credits-powered-by">
    <p>Projeto desenvolvido com &#x2764;&#xfe0f; e Svelte.</p>
  </div>
</footer>

<style>
  .final-credits {
    background-color: var(--color-highlight-bg); /* Usa a cor de fundo de destaque do tema */
    color: var(--color-text); /* Usa a cor de texto padrão do tema */
    padding: 3rem 1.5rem;
    margin-top: 4rem;
    border-top: 1px solid var(--color-border); /* Usa a cor de borda do tema */
    text-align: center;
  }

  .credits-section {
    max-width: 800px;
    margin: 0 auto;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 2rem;
  }

  h3 {
    font-size: var(--font-size-90); /* Usa token de fonte */
    font-weight: 700; /* Negrito */
    color: var(--color-primary); /* Usa a cor primária do tema */
    margin-top: 2rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  p {
    font-size: var(--font-size-60); /* Usa token de fonte */
    line-height: 1.6; /* Altura de linha para legibilidade */
    margin-bottom: 1rem;
    color: var(--color-secondary); /* Usa a cor secundária do tema */
  }

  .credits-list {
    list-style: none;
    padding: 0;
    margin-bottom: 1rem;
  }

  .credits-list li {
    font-size: var(--font-size-50); /* Usa token de fonte */
    line-height: 1.5;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .credits-powered-by {
    font-size: var(--font-size-40); /* Usa token de fonte */
    color: var(--color-subtle-text); /* Usa a cor de texto sutil do tema */
    margin-top: 2rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .final-credits {
      padding: 2rem 1rem;
    }

    h3 {
      font-size: var(--font-size-80); /* Ajuste de token para mobile */
    }

    p {
      font-size: var(--font-size-50);
    }

    .credits-list li {
      font-size: var(--font-size-40);
    }
  }
</style>