// src/lib/utils/componentManager.js
import { writable, derived } from 'svelte/store';
import { analytics } from './analytics.js';

/**
 * Sistema centralizado para gerenciar componentes de stories
 * Inclui lazy loading, performance tracking e error handling
 */

class ComponentManager {
  constructor() {
    this.components = new Map();
    this.loadedComponents = new Set();
    this.errors = writable(new Map());
    this.loading = writable(new Set());
    this.performance = writable(new Map());
    
    this.initializeObserver();
  }

  // Registrar componente com metadados
  registerComponent(type, componentModule, config = {}) {
    this.components.set(type, {
      module: componentModule,
      config: {
        lazyLoad: true,
        trackPerformance: true,
        errorFallback: null,
        ...config
      },
      stats: {
        loads: 0,
        errors: 0,
        avgLoadTime: 0
      }
    });
  }

  // Carregar componente dinamicamente
  async loadComponent(type, props = {}) {
    const startTime = performance.now();
    
    try {
      this.loading.update(set => set.add(type));
      
      const componentData = this.components.get(type);
      if (!componentData) {
        throw new Error(`Componente '${type}' não registrado`);
      }

      let Component;
      
      // Se for função (lazy), carregar dinamicamente
      if (typeof componentData.module === 'function') {
        const module = await componentData.module();
        Component = module.default || module;
      } else {
        Component = componentData.module;
      }

      const loadTime = performance.now() - startTime;
      
      // Atualizar estatísticas
      this.updateStats(type, loadTime);
      
      // Marcar como carregado
      this.loadedComponents.add(type);
      
      // Analytics
      analytics.track('component_loaded', {
        componentType: type,
        loadTime,
        success: true
      });

      return Component;

    } catch (error) {
      const loadTime = performance.now() - startTime;
      
      // Registrar erro
      this.errors.update(map => map.set(type, {
        message: error.message,
        timestamp: Date.now(),
        props
      }));

      // Atualizar estatísticas de erro
      const componentData = this.components.get(type);
      if (componentData) {
        componentData.stats.errors++;
      }

      // Analytics
      analytics.track('component_error', {
        componentType: type,
        error: error.message,
        loadTime
      });

      // Retornar fallback se disponível
      return this.getFallbackComponent(type, error);

    } finally {
      this.loading.update(set => {
        set.delete(type);
        return set;
      });
    }
  }

  // Atualizar estatísticas de performance
  updateStats(type, loadTime) {
    const componentData = this.components.get(type);
    if (!componentData) return;

    componentData.stats.loads++;
    componentData.stats.avgLoadTime = 
      (componentData.stats.avgLoadTime * (componentData.stats.loads - 1) + loadTime) / 
      componentData.stats.loads;

    this.performance.update(map => map.set(type, {
      ...componentData.stats,
      lastLoad: loadTime,
      timestamp: Date.now()
    }));
  }

  // Componente de fallback para erros
  getFallbackComponent(type, error) {
    const componentData = this.components.get(type);
    
    if (componentData?.config.errorFallback) {
      return componentData.config.errorFallback;
    }

    // Fallback genérico
    return {
      default: (props) => `
        <div class="component-error">
          <h4>Erro ao carregar ${type}</h4>
          <p>${error.message}</p>
          <button onclick="window.location.reload()">Recarregar</button>
        </div>
      `
    };
  }

  // Observer para lazy loading baseado em intersecção
  initializeObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const componentType = element.dataset.lazyComponent;
            
            if (componentType && !this.loadedComponents.has(componentType)) {
              await this.loadComponent(componentType);
              this.intersectionObserver.unobserve(element);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px', // Carrega 50px antes de entrar na viewport
        threshold: 0.1
      }
    );
  }

  // Observar elemento para lazy loading
  observeElement(element, componentType) {
    element.dataset.lazyComponent = componentType;
    this.intersectionObserver.observe(element);
  }

  // Pré-carregar componentes críticos
  async preloadCriticalComponents(types = []) {
    const promises = types.map(type => this.loadComponent(type));
    await Promise.allSettled(promises);
  }

  // Limpeza de recursos
  cleanup() {
    this.intersectionObserver?.disconnect();
    this.components.clear();
    this.loadedComponents.clear();
  }

  // Relatório de performance
  getPerformanceReport() {
    const report = {
      totalComponents: this.components.size,
      loadedComponents: this.loadedComponents.size,
      components: []
    };

    this.components.forEach((data, type) => {
      report.components.push({
        type,
        stats: data.stats,
        loaded: this.loadedComponents.has(type)
      });
    });

    return report;
  }
}

// Instância singleton
export const componentManager = new ComponentManager();

// Registrar todos os componentes do sistema
export function registerStoryComponents() {
  // Componentes básicos (carregamento imediato)
  componentManager.registerComponent('text', 
    () => import('../components/story/StoryText.svelte'),
    { lazyLoad: false }
  );

  componentManager.registerComponent('header', 
    () => import('../components/story/Header.svelte'),
    { lazyLoad: false }
  );

  // Componentes de mídia (lazy loading)
  componentManager.registerComponent('photo', 
    () => import('../components/story/PhotoWithCaption.svelte')
  );

  componentManager.registerComponent('video', 
    () => import('../components/story/VideoPlayer.svelte')
  );

  componentManager.registerComponent('globoplayer', 
    () => import('../components/story/GloboPlayer.svelte')
  );

  // Componentes interativos (lazy loading)
  componentManager.registerComponent('before-after', 
    () => import('../components/story/BeforeAfter.svelte')
  );

  componentManager.registerComponent('parallax', 
    () => import('../components/story/Parallax.svelte')
  );

  componentManager.registerComponent('scrolly', 
    () => import('../components/story/ScrollyTelling.svelte')
  );

  componentManager.registerComponent('gallery', 
    () => import('../components/story/PhotoGallery.svelte')
  );

  componentManager.registerComponent('carousel', 
    () => import('../components/story/Carousel.svelte')
  );

  componentManager.registerComponent('section-title', 
    () => import('../components/story/SectionTitle.svelte'),
    { lazyLoad: false }
  );
}

// Hook para usar em componentes Svelte
export function useComponent(type) {
  return {
    async load(props = {}) {
      return await componentManager.loadComponent(type, props);
    },
    
    isLoaded() {
      return componentManager.loadedComponents.has(type);
    },
    
    observe(element) {
      componentManager.observeElement(element, type);
    }
  };
}

// Utilitários para performance
export const performanceUtils = {
  // Medir tempo de renderização de componente
  measureRender: (componentType, renderFn) => {
    return new Promise(async (resolve) => {
      const startTime = performance.now();
      
      await renderFn();
      
      const renderTime = performance.now() - startTime;
      
      analytics.track('component_render', {
        componentType,
        renderTime
      });
      
      resolve(renderTime);
    });
  },

  // Detectar componentes pesados
  getSlowComponents: (threshold = 100) => {
    const report = componentManager.getPerformanceReport();
    return report.components.filter(c => 
      c.stats.avgLoadTime > threshold
    );
  },

  // Otimizar ordem de carregamento
  optimizeLoadOrder: (components) => {
    // Ordena por prioridade: críticos primeiro, depois por tamanho estimado
    return components.sort((a, b) => {
      const aCritical = ['header', 'text', 'section-title'].includes(a.type);
      const bCritical = ['header', 'text', 'section-title'].includes(b.type);
      
      if (aCritical && !bCritical) return -1;
      if (!aCritical && bCritical) return 1;
      
      // Se ambos são críticos ou ambos não são, ordena por performance
      return (a.stats?.avgLoadTime || 0) - (b.stats?.avgLoadTime || 0);
    });
  }
};

// Middleware para capturar erros de componentes
export function withErrorBoundary(Component, fallback = null) {
  return (props) => {
    try {
      return Component(props);
    } catch (error) {
      analytics.track('component_runtime_error', {
        componentName: Component.name,
        error: error.message
      });
      
      return fallback || `<div class="component-error">
        <p>Erro no componente ${Component.name}</p>
        <details>
          <summary>Detalhes técnicos</summary>
          <pre>${error.message}</pre>
        </details>
      </div>`;
    }
  };
}

// Inicialização automática
if (typeof window !== 'undefined') {
  registerStoryComponents();
}

export default componentManager;