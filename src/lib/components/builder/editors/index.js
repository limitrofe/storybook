// src/lib/components/builder/editors/index.js
export { default as SuperFlexEditor } from './SuperFlexEditor.svelte';
export { default as SimpleEditor } from './SimpleEditor.svelte';
export { default as GenericEditor } from './SimpleEditor.svelte'; // Alias

// Função helper para obter editor específico
export function getEditor(componentType) {
  switch(componentType) {
    case 'super-flex':
      return import('./SuperFlexEditor.svelte').then(m => m.default);
    // Adicionar outros editores específicos aqui no futuro
    case 'header':
      // return import('./HeaderEditor.svelte').then(m => m.default);
      return import('./SimpleEditor.svelte').then(m => m.default);
    case 'text':
      // return import('./TextEditor.svelte').then(m => m.default);
      return import('./SimpleEditor.svelte').then(m => m.default);
    default:
      return import('./SimpleEditor.svelte').then(m => m.default);
  }
}