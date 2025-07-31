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
    padding: 4rem 2rem; /* Aumenta o espaçamento vertical */
    margin-top: 4rem;
    border-top: 1px solid var(--color-border); /* Usa a cor de borda do tema */
    /* A mudança principal: alinhamento à esquerda */
    text-align: left;
  }

  .credits-section {
    max-width: 700px; /* Um pouco mais estreito para conforto de leitura */
    margin: 0 auto;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 2rem;
  }

  h3 {
    font-size: var(--font-size-60); /* Tamanho de título mais sutil */
    font-weight: 700; /* Negrito para destaque */
    color: var(--color-text); /* Cor de texto normal para um look mais sóbrio */
    margin-top: 2.5rem; /* Aumenta o espaço entre seções */
    margin-bottom: 1rem;
    text-transform: none; /* Remove o 'uppercase' */
    letter-spacing: normal; /* Remove o espaçamento extra */
  }

  /* Estilo para o primeiro H3, para não ter margem extra no topo */
  .credits-section > h3:first-child {
    margin-top: 0;
  }

  p {
    font-size: var(--font-size-60); /* Usa token de fonte */
    line-height: 1.7; /* Altura de linha para legibilidade */
    margin-bottom: 1rem;
    color: var(--color-secondary); /* Usa a cor secundária do tema */
  }

  .credits-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .credits-list li {
    font-size: var(--font-size-60); /* Mesmo tamanho do parágrafo para consistência */
    line-height: 1.7;
    color: var(--color-text);
    margin-bottom: 0.5rem; /* Espaçamento entre os nomes */
  }

  .credits-powered-by {
    max-width: 700px;
    margin: 0 auto;
    font-size: var(--font-size-40); /* Usa token de fonte */
    color: var(--color-subtle-text); /* Usa a cor de texto sutil do tema */
  }

  /* Ajustes para Mobile */
  @media (max-width: 768px) {
    .final-credits {
      padding: 2.5rem 1rem;
    }

    h3 {
      font-size: var(--font-size-50); /* Ajuste de token para mobile */
    }

    p, .credits-list li {
      font-size: var(--font-size-50);
    }
  }
</style>