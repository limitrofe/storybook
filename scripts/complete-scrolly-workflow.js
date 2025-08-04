#!/usr/bin/env node

// complete-scrolly-workflow.js - Workflow Completo ScrollyTelling
import { VideoToFramesConverter } from './video-to-frames.js';
import { FramesUploader } from './auto-upload-frames.js';
import fs from 'fs/promises';
import path from 'path';

class CompleteScrollyWorkflow {
  constructor(options = {}) {
    this.projectName = options.projectName || `scrolly-${Date.now()}`;
    this.tempDir = options.tempDir || './temp-scrolly';
    this.outputDir = options.outputDir || './generated-frames';
    this.quality = options.quality || 'high';
    this.fps = options.fps || 23;
    this.maxWidth = options.maxWidth || { desktop: 1920, mobile: 1080 };
    this.keepTempFiles = options.keepTempFiles || false;
    
    // Configurações de performance
    this.preloadRadius = options.preloadRadius || 5;
    this.maxMemoryMB = options.maxMemoryMB || 50;
    this.maxConcurrentUploads = options.maxConcurrentUploads || 5;
  }

  /**
   * Workflow completo: vídeo → frames → upload → config
   */
  async runCompleteWorkflow(videos, generateConfig = true) {
    console.log('🚀 INICIANDO WORKFLOW COMPLETO SCROLLYTELLING');
    console.log('='.repeat(60));
    
    const startTime = performance.now();
    let tempDirCreated = false;

    try {
      // 1. Preparar ambiente
      console.log('\n📁 1. Preparando ambiente...');
      await this.setupEnvironment();
      tempDirCreated = true;

      // 2. Converter vídeos para frames
      console.log('\n🎬 2. Convertendo vídeos para frames...');
      const conversionResults = await this.convertVideos(videos);

      // 3. Upload dos frames
      console.log('\n📤 3. Fazendo upload dos frames...');
      const uploadResults = await this.uploadFrames();

      // 4. Gerar configuração final
      console.log('\n⚙️ 4. Gerando configuração final...');
      const finalConfig = await this.generateFinalConfiguration(conversionResults, uploadResults);

      // 5. Gerar componentes Svelte se solicitado
      if (generateConfig) {
        console.log('\n🎯 5. Gerando componentes Svelte...');
        await this.generateSvelteComponents(finalConfig);
      }

      // 6. Cleanup
      if (!this.keepTempFiles) {
        console.log('\n🧹 6. Limpando arquivos temporários...');
        await this.cleanup();
      }

      const endTime = performance.now();
      const totalTime = Math.round((endTime - startTime) / 1000);

      console.log('\n' + '='.repeat(60));
      console.log('🎉 WORKFLOW CONCLUÍDO COM SUCESSO!');
      console.log(`⏱️ Tempo total: ${totalTime}s`);
      console.log('='.repeat(60));

      return {
        success: true,
        projectName: this.projectName,
        totalTime,
        conversionResults,
        uploadResults,
        finalConfig
      };

    } catch (error) {
      console.error('\n❌ ERRO NO WORKFLOW:', error.message);
      
      if (tempDirCreated && !this.keepTempFiles) {
        await this.cleanup().catch(() => {});
      }
      
      throw error;
    }
  }

  /**
   * Preparar ambiente de trabalho
   */
  async setupEnvironment() {
    // Criar diretórios necessários
    await fs.mkdir(this.tempDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });
    
    console.log(`   📁 Diretório temporário: ${this.tempDir}`);
    console.log(`   📁 Diretório de saída: ${this.outputDir}`);
    console.log(`   🏷️ Projeto: ${this.projectName}`);
  }

  /**
   * Converter vídeos para frames
   */
  async convertVideos(videos) {
    const converter = new VideoToFramesConverter({
      outputDir: this.outputDir,
      quality: this.quality,
      fps: this.fps,
      maxWidth: this.maxWidth
    });

    // Normalizar entrada de vídeos
    const videoList = Array.isArray(videos) ? videos : [videos];
    const resolvedVideos = [];

    for (const video of videoList) {
      if (typeof video === 'string') {
        // Path simples
        resolvedVideos.push(video);
      } else if (video.desktop || video.mobile) {
        // Vídeos separados para desktop/mobile
        if (video.desktop) resolvedVideos.push(video.desktop);
        if (video.mobile && video.mobile !== video.desktop) {
          resolvedVideos.push(video.mobile);
        }
      }
    }

    console.log(`   🎬 Processando ${resolvedVideos.length} vídeo(s)...`);

    const results = await converter.processMultipleVideos(resolvedVideos);
    
    console.log(`   ✅ Conversão concluída: ${results.length} resultado(s)`);
    
    return results;
  }

  /**
   * Upload dos frames gerados
   */
  async uploadFrames() {
    const uploader = new FramesUploader({
      projectName: this.projectName,
      maxConcurrentUploads: this.maxConcurrentUploads
    });

    console.log(`   📤 Fazendo upload do projeto: ${this.projectName}`);

    const uploadConfig = await uploader.uploadGeneratedFrames(this.outputDir);
    
    console.log(`   ✅ Upload concluído: ${uploadConfig.videos.length} vídeo(s)`);
    
    return uploadConfig;
  }

  /**
   * Gerar configuração final
   */
  async generateFinalConfiguration(conversionResults, uploadResults) {
    const config = {
      project: {
        name: this.projectName,
        generated: new Date().toISOString(),
        version: '1.0.0'
      },
      settings: {
        fps: this.fps,
        quality: this.quality,
        maxWidth: this.maxWidth,
        preloadRadius: this.preloadRadius,
        maxMemoryMB: this.maxMemoryMB
      },
      videos: [],
      deployment: {
        baseUrl: uploadResults.baseUrl,
        vaultUrl: uploadResults.vaultUrl
      },
      performance: {
        totalFrames: 0,
        totalSizeMB: 0,
        estimatedLoadTime: 0
      }
    };

    // Combinar dados de conversão e upload
    for (let i = 0; i < uploadResults.videos.length; i++) {
      const uploadVideo = uploadResults.videos[i];
      const conversionVideo = conversionResults[i] || {};

      const videoConfig = {
        id: `scrolly_${i + 1}`,
        name: uploadVideo.name,
        originalVideo: conversionVideo.video ? path.basename(conversionVideo.video) : uploadVideo.name,
        
        // Configuração para desktop
        desktop: {
          framePrefix: uploadVideo.desktop.framePrefix + uploadVideo.desktop.pattern,
          totalFrames: uploadVideo.desktop.totalFrames,
          frameExtension: uploadVideo.desktop.extension,
          framePadding: 4,
          startFrame: 1,
          endFrame: uploadVideo.desktop.totalFrames
        },
        
        // Configuração para mobile
        mobile: {
          framePrefix: uploadVideo.mobile.framePrefix + uploadVideo.mobile.pattern,
          totalFrames: uploadVideo.mobile.totalFrames,
          frameExtension: uploadVideo.mobile.extension,
          framePadding: 4,
          startFrame: 1,
          endFrame: uploadVideo.mobile.totalFrames
        },
        
        // Metadados do vídeo original
        metadata: {
          duration: conversionVideo.videoInfo?.duration || 0,
          fps: conversionVideo.videoInfo?.fps || this.fps,
          originalWidth: conversionVideo.videoInfo?.width || 0,
          originalHeight: conversionVideo.videoInfo?.height || 0
        },
        
        // Estatísticas
        stats: uploadVideo.stats || {
          totalUploaded: uploadVideo.desktop.totalFrames + uploadVideo.mobile.totalFrames,
          totalFailed: 0
        }
      };

      config.videos.push(videoConfig);
      
      // Atualizar estatísticas globais
      config.performance.totalFrames += videoConfig.stats.totalUploaded;
    }

    // Estimar métricas de performance
    config.performance.estimatedLoadTime = this.estimateLoadTime(config.videos);
    config.performance.totalSizeMB = await this.estimateTotalSize(config.videos);

    // Salvar configuração
    const configPath = `./scrolly-config-${this.projectName}.json`;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    console.log(`   📄 Configuração salva: ${configPath}`);
    
    return config;
  }

  /**
   * Gerar componentes Svelte prontos para uso
   */
  async generateSvelteComponents(config) {
    const componentsDir = `./components-${this.projectName}`;
    await fs.mkdir(componentsDir, { recursive: true });

    // Gerar componente principal
    const mainComponent = this.generateMainComponent(config);
    await fs.writeFile(
      path.join(componentsDir, 'ScrollyStory.svelte'),
      mainComponent
    );

    // Gerar componentes individuais
    for (const video of config.videos) {
      const individualComponent = this.generateIndividualComponent(video, config);
      await fs.writeFile(
        path.join(componentsDir, `${video.id}.svelte`),
        individualComponent
      );
    }

    // Gerar exemplo de uso
    const exampleUsage = this.generateUsageExample(config);
    await fs.writeFile(
      path.join(componentsDir, 'example-usage.svelte'),
      exampleUsage
    );

    // Gerar documentação
    const documentation = this.generateDocumentation(config);
    await fs.writeFile(
      path.join(componentsDir, 'README.md'),
      documentation
    );

    console.log(`   📁 Componentes gerados em: ${componentsDir}`);
    console.log(`   📄 Arquivos: ScrollyStory.svelte, ${config.videos.length} componentes individuais, exemplo e docs`);
  }

  /**
   * Gerar componente principal
   */
  generateMainComponent(config) {
    return `<script>
  // ScrollyStory.svelte - Componente Principal
  import ScrollyFrames from './ScrollyFrames.svelte';
  
  export let currentVideo = 0;
  export let showNavigation = true;
  export let autoplay = false;
  export let className = '';
  
  const videos = ${JSON.stringify(config.videos, null, 2)};
  
  let activeVideo = currentVideo;
  
  function nextVideo() {
    if (activeVideo < videos.length - 1) {
      activeVideo++;
    }
  }
  
  function prevVideo() {
    if (activeVideo > 0) {
      activeVideo--;
    }
  }
  
  function goToVideo(index) {
    activeVideo = index;
  }
</script>

<div class="scrolly-story {className}">
  <!-- Vídeo Ativo -->
  <div class="video-container">
    {#each videos as video, index}
      {#if index === activeVideo}
        <ScrollyFrames
          framePrefix={video.desktop.framePrefix}
          totalFrames={video.desktop.totalFrames}
          frameExtension={video.desktop.frameExtension}
          framePadding={video.desktop.framePadding}
          height="100vh"
          showProgress={true}
          showFrameCounter={false}
          preloadRadius={${config.settings.preloadRadius}}
          maxMemoryMB={${config.settings.maxMemoryMB}}
          class="video-{index + 1}"
        />
      {/if}
    {/each}
  </div>

  <!-- Navegação -->
  {#if showNavigation && videos.length > 1}
    <div class="story-navigation">
      <button 
        class="nav-btn prev" 
        on:click={prevVideo}
        disabled={activeVideo === 0}
      >
        ←
      </button>
      
      <div class="video-dots">
        {#each videos as video, index}
          <button 
            class="dot {index === activeVideo ? 'active' : ''}"
            on:click={() => goToVideo(index)}
            title={video.name}
          >
            {index + 1}
          </button>
        {/each}
      </div>
      
      <button 
        class="nav-btn next" 
        on:click={nextVideo}
        disabled={activeVideo === videos.length - 1}
      >
        →
      </button>
    </div>
  {/if}

  <!-- Info do Vídeo -->
  <div class="video-info">
    <h3>{videos[activeVideo]?.name || 'Vídeo'}</h3>
    <p>{videos[activeVideo]?.desktop.totalFrames} frames • {Math.round(videos[activeVideo]?.metadata.duration || 0)}s</p>
  </div>
</div>

<style>
  .scrolly-story {
    position: relative;
    width: 100%;
    height: 100vh;
    background: #000;
  }

  .video-container {
    width: 100%;
    height: 100%;
  }

  .story-navigation {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 20px;
    background: rgba(0, 0, 0, 0.8);
    padding: 15px 25px;
    border-radius: 50px;
    backdrop-filter: blur(10px);
    z-index: 1000;
  }

  .nav-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.3s ease;
  }

  .nav-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .video-dots {
    display: flex;
    gap: 10px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0;
  }

  .dot.active {
    background: white;
    border-color: white;
  }

  .dot:hover {
    border-color: white;
    transform: scale(1.2);
  }

  .video-info {
    position: fixed;
    top: 30px;
    left: 30px;
    color: white;
    background: rgba(0, 0, 0, 0.7);
    padding: 15px 20px;
    border-radius: 8px;
    backdrop-filter: blur(10px);
    z-index: 1000;
  }

  .video-info h3 {
    margin: 0 0 5px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .video-info p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    .story-navigation {
      bottom: 20px;
      padding: 12px 20px;
    }

    .nav-btn {
      width: 35px;
      height: 35px;
      font-size: 16px;
    }

    .video-info {
      top: 20px;
      left: 20px;
      right: 20px;
      padding: 12px 15px;
    }

    .video-info h3 {
      font-size: 16px;
    }

    .video-info p {
      font-size: 13px;
    }
  }
</style>`;
  }

  /**
   * Gerar componente individual
   */
  generateIndividualComponent(video, config) {
    return `<script>
  // ${video.id}.svelte - ${video.name}
  import ScrollyFrames from './ScrollyFrames.svelte';
  
  export let className = '';
  export let showProgress = true;
  export let showFrameCounter = false;
  export let height = '100vh';
</script>

<!-- ${video.name} -->
<ScrollyFrames
  framePrefix="${video.desktop.framePrefix}"
  totalFrames={${video.desktop.totalFrames}}
  frameExtension="${video.desktop.frameExtension}"
  framePadding={${video.desktop.framePadding}}
  startFrame={${video.desktop.startFrame}}
  endFrame={${video.desktop.endFrame}}
  {height}
  {showProgress}
  {showFrameCounter}
  preloadRadius={${config.settings.preloadRadius}}
  maxMemoryMB={${config.settings.maxMemoryMB}}
  class="scrolly-${video.id} {className}"
/>

<style>
  :global(.scrolly-${video.id}) {
    /* Estilos específicos para ${video.name} */
  }
</style>`;
  }

  /**
   * Gerar exemplo de uso
   */
  generateUsageExample(config) {
    return `<script>
  // example-usage.svelte - Exemplo de Uso
  import ScrollyStory from './ScrollyStory.svelte';
  ${config.videos.map(v => `import ${v.id} from './${v.id}.svelte';`).join('\n  ')}
</script>

<!-- Exemplo 1: História completa com navegação -->
<section class="story-section">
  <h1>Nossa História em Vídeo</h1>
  <ScrollyStory 
    showNavigation={true}
    currentVideo={0}
    class="main-story"
  />
</section>

<!-- Exemplo 2: Vídeos individuais -->
<section class="individual-videos">
  <h2>Vídeos Individuais</h2>
  
  ${config.videos.map((video, index) => `
  <div class="video-section">
    <h3>${video.name}</h3>
    <${video.id} 
      height="60vh"
      showProgress={true}
      showFrameCounter={true}
      class="video-${index + 1}"
    />
  </div>`).join('\n  ')}
</section>

<!-- Exemplo 3: Configuração personalizada -->
<section class="custom-config">
  <h2>Configuração Personalizada</h2>
  <ScrollyFrames
    framePrefix="${config.videos[0]?.desktop.framePrefix || ''}"
    totalFrames={${config.videos[0]?.desktop.totalFrames || 100}}
    frameExtension=".jpg"
    framePadding={4}
    height="80vh"
    showProgress={true}
    showFrameCounter={true}
    preloadRadius={10}
    maxMemoryMB={100}
    class="custom-scrolly"
  />
</section>

<style>
  .story-section {
    margin-bottom: 100vh;
  }

  .individual-videos {
    padding: 50px 0;
  }

  .video-section {
    margin-bottom: 60vh;
  }

  .custom-config {
    padding: 50px 0;
    background: #f5f5f5;
  }

  h1, h2, h3 {
    text-align: center;
    margin-bottom: 30px;
  }
</style>`;
  }

  /**
   * Gerar documentação
   */
  generateDocumentation(config) {
    return `# ScrollyTelling - ${config.project.name}

Componentes de scrollytelling gerados automaticamente em ${new Date(config.project.generated).toLocaleString('pt-BR')}.

## 📊 Estatísticas do Projeto

- **Vídeos processados:** ${config.videos.length}
- **Total de frames:** ${config.performance.totalFrames}
- **Tamanho estimado:** ${config.performance.totalSizeMB} MB
- **Tempo de carregamento estimado:** ${config.performance.estimatedLoadTime}s
- **FPS de extração:** ${config.settings.fps}
- **Qualidade:** ${config.settings.quality}

## 🎬 Vídeos Incluídos

${config.videos.map((video, index) => `
### ${index + 1}. ${video.name}

- **Frames:** ${video.desktop.totalFrames}
- **Duração original:** ${Math.round(video.metadata.duration)}s
- **Resolução original:** ${video.metadata.originalWidth}x${video.metadata.originalHeight}
- **Desktop:** [${video.desktop.framePrefix}](${video.desktop.framePrefix})
- **Mobile:** [${video.mobile.framePrefix}](${video.mobile.framePrefix})
`).join('')}

## 🚀 Como Usar

### 1. Componente Principal (História Completa)

\`\`\`svelte
<script>
  import ScrollyStory from './ScrollyStory.svelte';
</script>

<ScrollyStory 
  showNavigation={true}
  currentVideo={0}
  class="my-story"
/>
\`\`\`

### 2. Componentes Individuais

\`\`\`svelte
<script>
  import ${config.videos[0]?.id || 'scrolly_1'} from './${config.videos[0]?.id || 'scrolly_1'}.svelte';
</script>

<${config.videos[0]?.id || 'scrolly_1'} 
  height="100vh"
  showProgress={true}
  showFrameCounter={false}
/>
\`\`\`

### 3. Configuração Manual

\`\`\`svelte
<script>
  import ScrollyFrames from './ScrollyFrames.svelte';
</script>

<ScrollyFrames
  framePrefix="${config.videos[0]?.desktop.framePrefix || ''}"
  totalFrames={${config.videos[0]?.desktop.totalFrames || 100}}
  frameExtension=".jpg"
  framePadding={4}
  height="100vh"
  showProgress={true}
  preloadRadius={${config.settings.preloadRadius}}
  maxMemoryMB={${config.settings.maxMemoryMB}}
/>
\`\`\`

## ⚙️ Configurações de Performance

- **preloadRadius:** ${config.settings.preloadRadius} (frames pré-carregados ao redor do atual)
- **maxMemoryMB:** ${config.settings.maxMemoryMB} (limite de memória em MB)
- **throttleMs:** 16 (60fps para scroll suave)

## 📱 Suporte Mobile

Todos os componentes são totalmente responsivos e otimizados para dispositivos móveis:

- Frames WebP para mobile (melhor compressão)
- Controles touch-friendly
- Gerenciamento inteligente de memória
- Loading progressivo

## 🔧 Arquivos Gerados

- **ScrollyStory.svelte** - Componente principal com navegação
- **${config.videos.map(v => v.id + '.svelte').join(', ')}** - Componentes individuais
- **example-usage.svelte** - Exemplos de uso
- **README.md** - Esta documentação

## 🌐 URLs de Deploy

- **Base URL:** ${config.deployment.baseUrl}
- **Vault URL:** ${config.deployment.vaultUrl}

## 📈 Performance Tips

1. **Pré-carregamento:** Use \`preloadRadius\` adequado (5-10 frames)
2. **Memória:** Monitore \`maxMemoryMB\` para evitar crashes
3. **Scroll:** Implemente debouncing em dispositivos lentos
4. **Fallback:** Sempre tenha imagens estáticas como fallback

## 🐛 Troubleshooting

### Frames não carregam
- Verifique as URLs dos frames
- Confirme CORS configurado no CDN
- Teste a conectividade de rede

### Performance lenta
- Reduza \`preloadRadius\`
- Diminua \`maxMemoryMB\`
- Use qualidade \`medium\` ou \`low\`

### Mobile não funciona
- Confirme frames WebP para mobile
- Teste em dispositivos reais
- Verifique uso de memória

---

*Gerado automaticamente pelo Complete Scrolly Workflow v1.0*`;
  }

  /**
   * Estimar tempo de carregamento
   */
  estimateLoadTime(videos) {
    // Estimar baseado no número de frames e velocidade média de conexão
    const totalFrames = videos.reduce((sum, v) => sum + v.desktop.totalFrames, 0);
    const avgFrameSize = 0.05; // 50KB por frame (estimativa)
    const avgConnectionSpeed = 5; // 5 Mbps
    
    const totalSizeMB = totalFrames * avgFrameSize;
    const loadTimeSeconds = (totalSizeMB * 8) / avgConnectionSpeed; // converter para bits
    
    return Math.round(loadTimeSeconds * 100) / 100;
  }

  /**
   * Estimar tamanho total
   */
  async estimateTotalSize(videos) {
    // Estimativa baseada no número de frames
    const totalFrames = videos.reduce((sum, v) => sum + v.desktop.totalFrames + v.mobile.totalFrames, 0);
    const avgFrameSize = 0.04; // 40KB por frame (média entre JPG e WebP)
    
    return Math.round(totalFrames * avgFrameSize * 100) / 100;
  }

  /**
   * Cleanup de arquivos temporários
   */
  async cleanup() {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
      console.log(`   🗑️ Arquivos temporários removidos: ${this.tempDir}`);
    } catch (error) {
      console.warn(`   ⚠️ Aviso: Não foi possível remover ${this.tempDir}:`, error.message);
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 Workflow Completo ScrollyTelling

Automatiza TUDO: conversão, upload e geração de componentes

Uso:
  node complete-scrolly-workflow.js <video1> [video2] ...
  node complete-scrolly-workflow.js --dir <videos-dir>
  node complete-scrolly-workflow.js --config <config.json>

Opções:
  --project <nome>        Nome do projeto
  --quality <level>       Qualidade: high|medium|low
  --fps <number>          FPS de extração
  --mobile-width <px>     Largura máxima mobile
  --desktop-width <px>    Largura máxima desktop
  --keep-temp             Manter arquivos temporários
  --no-components         Não gerar componentes Svelte

Exemplos:
  node complete-scrolly-workflow.js intro.mp4 --project minha-historia
  node complete-scrolly-workflow.js --dir ./videos --quality medium
  node complete-scrolly-workflow.js video1.mp4 video2.mov --fps 30
    `);
    process.exit(1);
  }

  try {
    const options = parseWorkflowArgs(args);
    const workflow = new CompleteScrollyWorkflow(options);

    // Determinar vídeos para processar
    let videos = [];
    
    if (options.dir) {
      const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
      const files = await fs.readdir(options.dir);
      videos = files
        .filter(f => videoExtensions.includes(path.extname(f).toLowerCase()))
        .map(f => path.join(options.dir, f));
    } else if (options.config) {
      const config = JSON.parse(await fs.readFile(options.config, 'utf8'));
      videos = config.videos || [];
    } else {
      videos = args.filter(arg => !arg.startsWith('--'));
    }

    if (videos.length === 0) {
      throw new Error('Nenhum vídeo encontrado para processar');
    }

    console.log(`🎯 Processando ${videos.length} vídeo(s) para o projeto: ${options.projectName}`);

    // Executar workflow completo
    const result = await workflow.runCompleteWorkflow(videos, !options.noComponents);

    console.log('\n📋 RESULTADO FINAL:');
    console.log(`   🏷️ Projeto: ${result.projectName}`);
    console.log(`   ⏱️ Tempo total: ${result.totalTime}s`);
    console.log(`   🎬 Vídeos processados: ${result.conversionResults.length}`);
    console.log(`   📤 Upload concluído: ${result.uploadResults.videos.length} vídeo(s)`);
    console.log(`   📄 Componentes gerados: ${!options.noComponents ? 'Sim' : 'Não'}`);

  } catch (error) {
    console.error('❌ Erro no workflow:', error.message);
    process.exit(1);
  }
}

function parseWorkflowArgs(args) {
  const options = {
    projectName: `scrolly-${Date.now()}`,
    quality: 'high',
    fps: 23,
    maxWidth: { desktop: 1920, mobile: 1080 },
    keepTempFiles: false,
    noComponents: false,
    preloadRadius: 5,
    maxMemoryMB: 50,
    maxConcurrentUploads: 5
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--project':
        options.projectName = args[++i];
        break;
      case '--quality':
        options.quality = args[++i];
        break;
      case '--fps':
        options.fps = parseInt(args[++i]);
        break;
      case '--mobile-width':
        options.maxWidth.mobile = parseInt(args[++i]);
        break;
      case '--desktop-width':
        options.maxWidth.desktop = parseInt(args[++i]);
        break;
      case '--dir':
        options.dir = args[++i];
        break;
      case '--config':
        options.config = args[++i];
        break;
      case '--keep-temp':
        options.keepTempFiles = true;
        break;
      case '--no-components':
        options.noComponents = true;
        break;
    }
  }

  return options;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CompleteScrollyWorkflow };