// src/routes/+page.js - Load function para página inicial
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, url, fetch }) {
  // Verificar se há um slug específico na URL
  const searchParams = url.searchParams;
  const slug = searchParams.get('story') || 'default';
  
  try {
    // Tentar carregar a story específica
    if (slug !== 'default') {
      const response = await fetch(`/data/${slug}.json`);
      
      if (response.ok) {
        const story = await response.json();
        return {
          story,
          slug
        };
      }
    }
    
    // Se não encontrou story específica ou é default, carregar lista
    // ou story padrão se existir
    try {
      const defaultResponse = await fetch('/data/index.json');
      if (defaultResponse.ok) {
        const storyList = await defaultResponse.json();
        const firstStory = storyList[0];
        
        if (firstStory) {
          const storyResponse = await fetch(`/data/${firstStory.slug}.json`);
          if (storyResponse.ok) {
            const story = await storyResponse.json();
            return {
              story,
              slug: firstStory.slug
            };
          }
        }
      }
    } catch (e) {
      console.log('Não foi possível carregar lista de stories');
    }
    
    // Retornar estado vazio se nada foi encontrado
    return {
      story: null,
      slug: null
    };
    
  } catch (err) {
    console.error('Erro ao carregar story:', err);
    
    // Em caso de erro, retornar estado vazio em vez de falhar
    return {
      story: null,
      slug: null,
      error: err.message
    };
  }
}