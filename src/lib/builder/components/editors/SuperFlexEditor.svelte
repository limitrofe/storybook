<script>
  import { createEventDispatcher } from 'svelte';
  import SuperFlexEditorImpl from '$lib/components/builder/editors/SuperFlexEditor.svelte';

  export let data;

  const dispatch = createEventDispatcher();

  const createDefaultData = () => ({
    type: 'super-flex',
    container: {},
    items: []
  });

  let normalizedData = createDefaultData();

  $: {
    if (data && typeof data === 'object') {
      normalizedData = data;
    } else {
      normalizedData = createDefaultData();
      data = normalizedData;
    }
  }

  $: if (normalizedData && normalizedData !== data) {
    data = normalizedData;
  }

  const forwardUpdate = () => dispatch('update');
</script>

<SuperFlexEditorImpl bind:data={normalizedData} on:update={forwardUpdate} />
