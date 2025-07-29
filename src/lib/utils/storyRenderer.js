// src/lib/utils/storyRenderer.js
/**
 * Renderiza componentes de história baseado em dados do ArchieML
 */
export function parseStoryComponents(paragraphs) {
  if (!paragraphs || !Array.isArray(paragraphs)) {
    return [];
  }

  return paragraphs.map((paragraph, index) => {
    const component = {
      id: `component-${index}`,
      type: paragraph.type || 'text',
      ...paragraph
    };

    // Normalização de tipos específicos
    switch (component.type) {
      case 'titulo':
      case 'intertitulo':
        component.type = 'section-title';
        component.title = component.text;
        break;
        
      case 'frase':
      case 'citacao':
        component.type = 'text';
        component.variant = 'quote';
        break;
        
      case 'texto':
        component.type = 'text';
        component.variant = 'body';
        component.content = component.text;
        break;
        
      case 'foto':
      case 'imagem':
        component.type = '