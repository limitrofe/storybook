<script>
  import { createEventDispatcher, onMount } from "svelte";

  export let value = "";
  export let placeholder = "";

  const dispatch = createEventDispatcher();
  let editor;
  let isFocused = false;

  function emit() {
    const html = editor?.innerHTML?.trim() || "";
    dispatch("change", { value: html });
  }

  function exec(command, arg = null) {
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  function toggleLink() {
    const selection = document.getSelection()?.toString();
    const current = selection && selection.startsWith("http") ? selection : "";
    const url = prompt("Insira o URL:", current);
    if (url) {
      exec("createLink", url);
    } else if (url === "") {
      exec("unlink");
    }
  }

  function handleInput() {
    emit();
  }

  function handlePaste(event) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    emit();
  }

  $: if (editor && !isFocused) {
    const current = editor.innerHTML;
    const next = value || "";
    if (current !== next) {
      editor.innerHTML = next;
    }
  }

  onMount(() => {
    if (editor && value) {
      editor.innerHTML = value;
    }
  });
</script>

<div class="rich-text-editor">
  <div class="toolbar" role="toolbar" aria-label="Editor de texto">
    <button type="button" on:click={() => exec("bold")} aria-label="Negrito"><strong>B</strong></button>
    <button type="button" on:click={() => exec("italic")} aria-label="Itálico"><em>I</em></button>
    <button type="button" on:click={() => exec("underline")} aria-label="Sublinhado"><u>U</u></button>
    <button type="button" on:click={() => exec("insertOrderedList")} aria-label="Lista numerada">1.</button>
    <button type="button" on:click={() => exec("insertUnorderedList")} aria-label="Lista não ordenada">•</button>
    <button type="button" on:click={toggleLink} aria-label="Inserir link">🔗</button>
    <button type="button" on:click={() => exec("removeFormat")} aria-label="Limpar formatação">⌫</button>
  </div>

  <div
    class="editor"
    class:empty={!value}
    contenteditable
    bind:this={editor}
    data-placeholder={placeholder}
    on:input={handleInput}
    on:paste={handlePaste}
    on:focus={() => (isFocused = true)}
    on:blur={() => {
      isFocused = false;
      emit();
    }}
  ></div>
</div>

<style>
  .rich-text-editor {
    display: flex;
    flex-direction: column;
    border: 1px solid #cbd5f5;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }

  .toolbar {
    display: flex;
    gap: 0.25rem;
    padding: 0.4rem;
    background: #f1f5f9;
    border-bottom: 1px solid #cbd5f5;
  }

  .toolbar button {
    border: none;
    background: #fff;
    border-radius: 6px;
    padding: 0.3rem 0.5rem;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .toolbar button:hover,
  .toolbar button:focus {
    background: #e2e8f0;
    outline: none;
  }

  .editor {
    min-height: 160px;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #0f172a;
    outline: none;
  }

  .editor.empty::before {
    content: attr(data-placeholder);
    color: #94a3b8;
    pointer-events: none;
    display: block;
  }
</style>

