<!-- src/lib/components/story/VideoPlayer.svelte -->
<script>
  export let src = '';
  export let poster = '';
  export let caption = '';
  export let credit = '';
  export let fullWidth = false;
  export let autoplay = false;
  export let controls = true;
  export let loop = false;
  export let showCaption = true; // Nova opção para mostrar/esconder legenda
  export let alignment = 'center'; // 'left', 'center', 'right'
  
  let videoElement;
  let isPlaying = false;
  let currentTime = 0;
  let duration = 0;
  let showCustomControls = false;

  function togglePlay() {
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }

  function handleTimeUpdate() {
    currentTime = videoElement.currentTime;
  }

  function handleLoadedMetadata() {
    duration = videoElement.duration;
  }

  function handlePlay() {
    isPlaying = true;
  }

  function handlePause() {
    isPlaying = false;
  }

  function seek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoElement.currentTime = percent * duration;
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<figure 
  class="video-player" 
  class:full-width={fullWidth}
>
  <div class="video-player__container">
    <video
      bind:this={videoElement}
      {src}
      {poster}
      {autoplay}
      muted={autoplay}
      {controls}
      {loop}
      playsinline
      on:timeupdate={handleTimeUpdate}
      on:loadedmetadata={handleLoadedMetadata}
      on:play={handlePlay}
      on:pause={handlePause}
    >
      Seu navegador não suporta vídeos HTML5.
    </video>

    {#if showCustomControls}
      <div class="video-player__controls">
        <button 
          class="video-player__play-button" 
          on:click={togglePlay}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button 
          class="video-player__progress" 
          on:click={seek}
          aria-label="Seek video"
          role="slider"
          tabindex="0"
        >
          <div 
            class="video-player__progress-bar"
            style="width: {duration ? (currentTime / duration) * 100 : 0}%"
          ></div>
        </button>
        
        <div class="video-player__time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    {/if}
  </div>
  
  {#if showCaption && (caption || credit)}
    <figcaption class="video-player__caption">
      {#if caption}<p class="video-player__text">{@html caption}</p>{/if}
      {#if credit}<small class="video-player__credit">{@html credit}</small>{/if}
    </figcaption>
  {/if}
</figure>

<style>
  .video-player {
    margin: 2rem auto;
    max-width: 800px;
  }

  .video-player.full-width {
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
  }

  .video-player__container {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: #000;
  }

  .video-player video {
    width: 100%;
    height: auto;
    display: block;
  }

  .video-player__controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .video-player__container:hover .video-player__controls {
    opacity: 1;
  }

  .video-player__play-button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: background 0.3s ease;
  }

  .video-player__play-button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .video-player__progress {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    cursor: pointer;
    position: relative;
    border: none;
    outline: none;
  }

  .video-player__progress-bar {
    height: 100%;
    background: var(--color-primary);
    border-radius: 3px;
    transition: width 0.1s ease;
  }

  .video-player__time {
    color: white;
    font-size: var(--font-size-40);
    font-weight: 500;
    min-width: 80px;
    text-align: right;
  }

  .video-player__caption {
    padding: 1rem 0.5rem;
    text-align: center;
  }

  .video-player__text {
    font-size: var(--font-size-50);
    line-height: 1.4;
    color: var(--color-secondary);
    margin: 0 0 0.5rem 0;
    font-style: italic;
  }

  .video-player__credit {
    font-size: var(--font-size-40);
    color: var(--color-subtle-text);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .video-player__controls {
      padding: 0.5rem;
    }

    .video-player__play-button {
      width: 35px;
      height: 35px;
      font-size: 1.2rem;
    }

    .video-player__time {
      font-size: var(--font-size-30);
      min-width: 70px;
    }
  }
</style>