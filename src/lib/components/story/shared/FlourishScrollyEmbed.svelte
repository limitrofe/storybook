<script>
  import { fade } from 'svelte/transition';

  export let src = '';
  export let index = 0;
// Lógica para extrair tipo e ID do src
  $: type = src ? src.split('/')[0] : 'story';
$: id = src ? src.split('/')[1] : '1';
</script>

<div class="embed-container">
    <div class="w-full flex items-center">
        <figure class="w-full" in:fade={{ duration: 1000 }}>
            <iframe
                src="https://flo.uri.sh/{type}/{id}/embed#slide-{index}"
                title="Interactive visual content"
                class="flourish-embed-iframe"
         
       frameborder="0"
                scrolling="no"
                style="width:100%;height:100%;"
sandbox="allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            />
        </figure>
    </div>
</div>

<style>
    .embed-container {
        width: 100%;
height: 100%; /* ALTERADO: de 80vh para 100% */
        display: flex;
        align-items: center;
justify-content: center;
    }
    figure, .w-full, .flex, .items-center {
        width: 100%;
height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>