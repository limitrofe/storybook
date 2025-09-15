<!-- src/routes/builder/+page.svelte -->
<script>
  import VisualBuilder from '../VisualBuilder.svelte';
</script>

<svelte:head>
  <title>Visual Builder - Editor de Componentes</title>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@4.6.0/dist/full.css" rel="stylesheet" type="text/css" />
  <script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<VisualBuilder />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', system-ui, sans-serif;
  }
</style>