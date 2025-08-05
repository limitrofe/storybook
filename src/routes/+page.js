// src/routes/+page.js - Load function para página inicial
import { browser } from '$app/environment';

/** @type {import('./$types').PageLoad} */
export async function load({ params, url, fetch }) {
  // 🔧 CORREÇÃO: Só acessar searchParams no browser
  let slug = 'default';
  
  if (browser) {
    const searchParams = url.searchParams;
    slug = searchParams.get('story') || 'default';
  }
  
  try {
    // Tentar carregar a story específica (apenas se não for default)
    if (browser && slug !== 'default') {
      const response = await fetch(`/data/${slug}.json`);
      
      if (response.ok) {
        const story = await response.json();
        return {
          story,
          slug
        };
      }
    }
    
    // Durante o prerendering ou se não encontrou story específica,
    // tentar carregar lista de stories
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
    
    // Fallback: tentar carregar a story hardcoded
    try {
      const fallbackResponse = await fetch('/data/diario-de-um-legendario-a-fe-o-cansaco-e-as-regras.json');
      if (fallbackResponse.ok) {
        const story = await fallbackResponse.json();
        return {
          story,
          slug: 'diario-de-um-legendario-a-fe-o-cansaco-e-as-regras'
        };
      }
    } catch (e) {
      console.log('Não foi possível carregar story padrão');
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