
<script>
  import { createEventDispatcher } from 'svelte';
  import RichTextEditor from '../RichTextEditor.svelte';

  export let value = [];

  const dispatch = createEventDispatcher();
  let steps = [];
  let isUpdating = false;

  const buildDefaults = () => ({
    title: '',
    text: '',
    position: 'right',
    variant: 'default',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    overlayColor: 'rgba(0, 0, 0, 0.35)',
    textColor: '#F9FAFB',
    accentColor: '#C4170C',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: '2rem',
    maxWidth: '460px',
    maxWidthMobile: '92%',
    cardVisibility: 'card',
    slideFromBottom: true,
    travelDistance: '45vh',
    image: '',
    imageMobile: '',
    video: '',
    videoMobile: '',
    alt: '',
    caption: ''
  });

  $: if (!isUpdating) {
    steps = Array.isArray(value) && value.length
      ? value.map((step) => ({ ...buildDefaults(), ...structuredClone(step) }))
      : [buildDefaults()];
  }

  function emit(updated) {
    isUpdating = true;
    dispatch('change', { value: updated });
    Promise.resolve().then(() => {
      isUpdating = false;
    });
  }

  function addStep() {
    const updated = [...steps, buildDefaults()];
    steps = updated;
    emit(updated);
  }

  function duplicateStep(index) {
    const clone = { ...steps[index] };
    const updated = [
      ...steps.slice(0, index + 1),
      { ...clone },
      ...steps.slice(index + 1)
    ];
    steps = updated;
    emit(updated);
  }

  function removeStep(index) {
    if (steps.length === 1) {
      const updated = [buildDefaults()];
      steps = updated;
      emit(updated);
      return;
    }
    const updated = steps.filter((_, i) => i !== index);
    steps = updated;
    emit(updated);
  }

  function moveStep(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const updated = [...steps];
    const [item] = updated.splice(index, 1);
    updated.splice(target, 0, item);
    steps = updated;
    emit(updated);
  }

  function updateStep(index, key, value) {
    const updated = steps.map((step, i) => (i === index ? { ...step, [key]: value } : step));
    steps = updated;
    emit(updated);
  }

  const positions = [
    { label: 'Direita', value: 'right' },
    { label: 'Centro', value: 'center' },
    { label: 'Esquerda', value: 'left' }
  ];

  const variants = [
    { label: 'Padrão', value: 'default' },
    { label: 'Destaque', value: 'destaque' }
  ];

  const cardVisibilityOptions = [
    { label: 'Card visível', value: 'card' },
    { label: 'Card transparente', value: 'transparent' },
    { label: 'Sem card (apenas mídia)', value: 'hidden' }
  ];
</script>

<div class="steps-editor">
  {#each steps as step, index}
    <article class="step-card">
      <header>
        <div>
          <strong>Step {index + 1}</strong>
          <span>{step.title || 'Sem título'}</span>
        </div>
        <div class="actions">
          <button type="button" on:click={() => moveStep(index, -1)} title="Mover para cima" disabled={index === 0}>↑</button>
          <button type="button" on:click={() => moveStep(index, +1)} title="Mover para baixo" disabled={index === steps.length - 1}>↓</button>
          <button type="button" on:click={() => duplicateStep(index)} title="Duplicar">⧉</button>
          <button type="button" class="danger" on:click={() => removeStep(index)} title="Remover">✕</button>
        </div>
      </header>

      <div class="fields">
        <label>
          <span>Título</span>
          <input type="text" value={step.title} on:input={(event) => updateStep(index, 'title', event.currentTarget.value)} />
        </label>

        <label>
          <span>Texto (HTML permitido)</span>
          <RichTextEditor
            value={step.text || ''}
            rows={4}
            placeholder="Conteúdo do step"
            on:change={(event) => updateStep(index, 'text', event.detail.value)}
          />
        </label>

        <div class="grid">
          <label>
            <span>Posicionamento</span>
            <select value={step.position} on:change={(event) => updateStep(index, 'position', event.currentTarget.value)}>
              {#each positions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>Variante</span>
            <select value={step.variant} on:change={(event) => updateStep(index, 'variant', event.currentTarget.value)}>
              {#each variants as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>Card de texto</span>
            <select value={step.cardVisibility || 'card'} on:change={(event) => updateStep(index, 'cardVisibility', event.currentTarget.value)}>
              {#each cardVisibilityOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <small>Use “Sem card” para deixar apenas a mídia em destaque.</small>
          </label>

          <label class="toggle-field">
            <span>Animar do rodapé ao topo</span>
            <input
              type="checkbox"
              checked={Boolean(step.slideFromBottom ?? true)}
              on:change={(event) => updateStep(index, 'slideFromBottom', event.currentTarget.checked)}
            />
          </label>

          <label>
            <span>Distância da animação</span>
            <input
              type="text"
              value={step.travelDistance || '45vh'}
              placeholder="ex: 45vh"
              on:input={(event) => updateStep(index, 'travelDistance', event.currentTarget.value)}
            />
            <small>Use unidades como px ou vh. Padrão: 45vh.</small>
          </label>
        </div>

        <div class="grid colors">
          <label>
            <span>Cor do card</span>
            <div class="color-input">
              <input type="color" value={step.backgroundColor?.startsWith('#') ? step.backgroundColor : '#1f2933'} on:input={(event) => updateStep(index, 'backgroundColor', event.currentTarget.value)} />
              <input type="text" value={step.backgroundColor} placeholder="rgba(15, 23, 42, 0.82)" on:input={(event) => updateStep(index, 'backgroundColor', event.currentTarget.value)} />
            </div>
          </label>

          <label>
            <span>Overlay da mídia</span>
            <input type="text" value={step.overlayColor} placeholder="rgba(0,0,0,0.35)" on:input={(event) => updateStep(index, 'overlayColor', event.currentTarget.value)} />
          </label>

          <label>
            <span>Cor do texto</span>
            <input type="color" value={step.textColor || '#F9FAFB'} on:input={(event) => updateStep(index, 'textColor', event.currentTarget.value)} />
          </label>

          <label>
            <span>Cor de destaque</span>
            <input type="color" value={step.accentColor || '#C4170C'} on:input={(event) => updateStep(index, 'accentColor', event.currentTarget.value)} />
          </label>

          <label>
            <span>Cor da borda</span>
            <div class="color-input">
              <input type="color" value={step.borderColor?.startsWith('#') ? step.borderColor : '#FFFFFF'} on:input={(event) => updateStep(index, 'borderColor', event.currentTarget.value)} />
              <input type="text" value={step.borderColor} placeholder="rgba(255,255,255,0.12)" on:input={(event) => updateStep(index, 'borderColor', event.currentTarget.value)} />
            </div>
          </label>
        </div>

        <div class="grid">
          <label>
            <span>Imagem desktop</span>
            <input type="url" value={step.image} placeholder="https://..." on:input={(event) => updateStep(index, 'image', event.currentTarget.value)} />
          </label>
          <label>
            <span>Imagem mobile</span>
            <input type="url" value={step.imageMobile} placeholder="https://..." on:input={(event) => updateStep(index, 'imageMobile', event.currentTarget.value)} />
          </label>
        </div>

        <div class="grid">
          <label>
            <span>Vídeo desktop</span>
            <input type="url" value={step.video} placeholder="https://...mp4" on:input={(event) => updateStep(index, 'video', event.currentTarget.value)} />
          </label>
          <label>
            <span>Vídeo mobile</span>
            <input type="url" value={step.videoMobile} placeholder="https://...mp4" on:input={(event) => updateStep(index, 'videoMobile', event.currentTarget.value)} />
          </label>
        </div>

        <div class="grid">
          <label>
            <span>Alt da mídia</span>
            <input type="text" value={step.alt} on:input={(event) => updateStep(index, 'alt', event.currentTarget.value)} />
          </label>
          <label>
            <span>Legenda</span>
            <input type="text" value={step.caption} on:input={(event) => updateStep(index, 'caption', event.currentTarget.value)} />
          </label>
        </div>

        <div class="grid">
          <label>
            <span>Padding</span>
            <input type="text" value={step.padding} placeholder="2rem" on:input={(event) => updateStep(index, 'padding', event.currentTarget.value)} />
          </label>
          <label>
            <span>Largura máxima (desktop)</span>
            <input type="text" value={step.maxWidth} placeholder="460px" on:input={(event) => updateStep(index, 'maxWidth', event.currentTarget.value)} />
          </label>
          <label>
            <span>Largura máxima (mobile)</span>
            <input type="text" value={step.maxWidthMobile} placeholder="92%" on:input={(event) => updateStep(index, 'maxWidthMobile', event.currentTarget.value)} />
          </label>
        </div>
      </div>
    </article>
  {/each}

  <button type="button" class="add-step" on:click={addStep}>Adicionar passo</button>
</div>

<style>
  .steps-editor {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .step-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    background: #fff;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.07);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  header strong {
    display: block;
    font-size: 0.95rem;
    color: #0f172a;
  }

  header span {
    display: block;
    font-size: 0.8rem;
    color: #6b7280;
  }

  .actions {
    display: inline-flex;
    gap: 0.35rem;
  }

  .actions button {
    border: 1px solid #cbd5f5;
    background: #fff;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.75rem;
  }

  .actions button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .actions button.danger {
    border-color: #fecaca;
    color: #b91c1c;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.8rem;
    color: #334155;
  }

  .toggle-field {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  input[type='text'],
  input[type='url'],
  textarea,
  select {
    border: 1px solid #cbd5f5;
    border-radius: 8px;
    padding: 0.45rem 0.6rem;
    font-size: 0.85rem;
  }

  textarea {
    resize: vertical;
  }

  input[type='color'] {
    width: 44px;
    height: 32px;
    padding: 0;
    border: none;
    background: transparent;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.75rem;
  }

  .grid.colors {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .color-input {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
    align-items: center;
  }

  .add-step {
    align-self: flex-start;
    border: 1px dashed #94a3b8;
    background: #f8fafc;
    border-radius: 10px;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    cursor: pointer;
    color: #334155;
  }

  .add-step:hover {
    background: #e2e8f0;
  }
</style>
