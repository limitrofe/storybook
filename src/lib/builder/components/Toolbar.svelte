<script>
  import { storyStore } from '../stores/storyStore.js';
  import { loadStoryFromServer, saveStoryToServer, exportStoryFile } from '../story-service.js';

  let statusMessage = '';
  let statusType = 'idle';
  let fileInput;

  const setStatus = (message, type = 'info') => {
    statusMessage = message;
    statusType = type;
    if (message) {
      setTimeout(() => {
        statusMessage = '';
        statusType = 'idle';
      }, 4000);
    }
  };

  const handleNewStory = () => {
    if (confirm('Tem certeza? Isto limpará a história atual.')) {
      storyStore.reset();
      setStatus('História resetada.', 'info');
    }
  };

  const handleSave = async () => {
    try {
      const response = await saveStoryToServer();
      setStatus(response?.message || 'Arquivo story.json atualizado.', 'success');
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Não foi possível salvar o arquivo.', 'error');
    }
  };

  const handleExport = () => {
    exportStoryFile();
    setStatus('Download iniciado.', 'success');
  };

  const handleImportClick = () => {
    fileInput?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      storyStore.setStory(data);
      setStatus('História importada com sucesso.', 'success');
    } catch (error) {
      setStatus('JSON inválido. Revise o arquivo selecionado.', 'error');
    } finally {
      event.currentTarget.value = '';
    }
  };

  const handleReload = async () => {
    const data = await loadStoryFromServer();
    if (data) {
      setStatus('story.json carregado do disco.', 'success');
    } else {
      setStatus('Nenhum story.json encontrado ainda.', 'info');
    }
  };
</script>

<header class="toolbar">
  <div class="actions">
    <button on:click={handleNewStory}>Novo projeto</button>
    <button on:click={handleReload}>Carregar story.json</button>
    <button class="primary" on:click={handleSave}>Salvar story.json</button>
    <button on:click={handleExport}>Exportar JSON</button>
    <button on:click={handleImportClick}>Importar JSON</button>
    <input type="file" accept="application/json" bind:this={fileInput} on:change={handleFileChange} hidden />
  </div>
  {#if statusMessage}
    <div class="status" class:success={statusType === 'success'} class:error={statusType === 'error'}>
      {statusMessage}
    </div>
  {/if}
</header>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f9fafb;
    gap: 1rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  button {
    border: 1px solid transparent;
    background: white;
    border-radius: 8px;
    padding: 0.5rem 0.85rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.15s ease, box-shadow 0.15s ease;
  }

  button:hover {
    background: #e2e8f0;
  }

  .primary {
    background: #2563eb;
    color: white;
  }

  .primary:hover {
    background: #1d4ed8;
  }

  .status {
    font-size: 0.85rem;
    color: #475569;
  }

  .status.success {
    color: #15803d;
  }

  .status.error {
    color: #b91c1c;
  }
</style>
