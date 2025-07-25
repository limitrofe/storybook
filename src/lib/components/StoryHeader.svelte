<script>
  let { title = '', subtitle = '', author = '', date = '' } = $props();
  
  function formatDate(dateStr) {
    if (!dateStr) return '';
    // Adiciona 1 dia para corrigir problemas de fuso horário na conversão
    const dateObj = new Date(dateStr);
    dateObj.setUTCDate(dateObj.getUTCDate() + 1);
    
    return dateObj.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>
<header class="story-header">
  <h1>{title}</h1>
  <h2>{subtitle}</h2>
  </header>

<style>
  .story-header {
    text-align: center;
    padding: 2rem 0;
    border-bottom: 2px solid var(--color-border); /* Usa a cor de borda do tema */
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: var(--font-size-130);
    font-weight: 800;
    color: var(--color-primary); /* Usa a cor primária do tema (#C4170C) */
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  
  h2 {
    font-size: var(--font-size-90);
    color: var(--color-secondary); /* Usa a cor secundária do tema */
    font-weight: 400;
    margin-bottom: 1.5rem;
    line-height: 1.4;
  }
  
  .meta {
    color: var(--color-subtle-text); /* Usa a cor de texto sutil do tema */
    font-size: var(--font-size-60);
    font-weight: 500;
  }

  .meta span {
    margin: 0 1rem;
  }
  
  @media (max-width: 768px) {
    h1 {
      /* Token de 32px para telas menores */
      font-size: var(--font-size-120);
    }
    
    h2 {
      /* Token de 20px para telas menores */
      font-size: var(--font-size-80);
    }
  }
</style>