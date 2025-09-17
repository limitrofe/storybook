<script>
  import { onMount } from 'svelte';
  import Toolbar from './Toolbar.svelte';
  import ComponentPalette from './ComponentPalette.svelte';
  import Canvas from './Canvas.svelte';
  import Inspector from './Inspector.svelte';
  import { loadStoryFromServer } from '../story-service.js';
  import { storyStore, selectedBlockId } from '../stores/storyStore.js';

  onMount(() => {
    loadStoryFromServer();
  });

  const handleAddComponent = (event) => {
    const { type } = event.detail;
    if (!type) return;
    const block = storyStore.addBlock(type);
    if (block) {
      selectedBlockId.set(block.__id);
    }
  };
</script>

<div class="builder-shell">
  <Toolbar />
  <div class="main">
    <aside class="sidebar">
      <ComponentPalette on:add={handleAddComponent} />
    </aside>
    <Canvas />
    <Inspector />
  </div>
</div>

<style>
  .builder-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f1f5f9;
  }

  .main {
    flex: 1;
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr) 360px;
    background: #f8fafc;
  }

  .sidebar {
    border-right: 1px solid #e2e8f0;
    background: #ffffff;
    overflow-y: auto;
  }
</style>
