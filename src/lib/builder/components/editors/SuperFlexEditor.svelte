<script>
  import SuperFlexEditorImpl from '$lib/components/builder/editors/SuperFlexEditor.svelte';
  export let data;
</script>

<SuperFlexEditorImpl bind:data on:update />
