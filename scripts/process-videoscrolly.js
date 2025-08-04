#!/usr/bin/env node

// process-videoscrolly.js - Script customizado para os vídeos do Guilherme
import { VideoToFramesConverter } from './video-to-frames.js';
import { FramesUploader } from './auto-upload-frames.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class VideoScrollyProcessor {
  constructor(projectName = 'newsroom-videoscrolly') {
    this.projectName = projectName;
    this.videoPaths = {
      desktop: '/Users/guilhermegomes/dev/newsroom-system/static/videos/videoscrolly_1_main.mp4',
      mobile: '/Users/guilhermegomes/dev/newsroom-system/static/videos/videoscrolly_1_mobile.mp4'
    };
    this.outputDir = './generated-frames';
    this.tempDir = './temp-process';
  }

  /**
   * Processar os vídeos específicos do Guilherme
   */
  async processVideos() {
    console.log('🚀 Processando VideoScrollytelling - Guilherme');
    console.log('='.repeat(60));
    
    try {
      // 1. Verificar se os vídeos existem
      await this.verifyVideos();
      
      // 2. Converter vídeos para frames
      const conversionResults = await this.convertToFrames();
      
      // 3. Upload para CDN
      const uploadResults = await this.uploadFrames();
      
      // 4. Gerar configuração para o Google Docs
      const config = await this.generateDocsConfig(uploadResults);
      
      // 5. Atualizar qualquer documento JSON existente
      await this.updateExistingDocs(config);
      
      console.log('\n🎉 Processamento concluído com sucesso!');
      return config;
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error.message);
      throw error;
    }
  }

  /**
   * Verificar se os vídeos existem
   */
  async verifyVideos() {
    console.log('\n📁 1. Verificando vídeos...');
    
    try {
      await fs.access(this.videoPaths.desktop);
      console.log('   ✅ Desktop: videoscrolly_1_main.mp4');
    } catch (error) {
      throw new Error(`Vídeo desktop não encontrado: ${this.videoPaths.desktop}`);
    }
    
    try {
      await fs.access(this.videoPaths.mobile);
      console.log('   ✅ Mobile: videoscrolly_1_mobile.mp4');
    } catch (error) {
      throw new Error(`Vídeo mobile não encontrado: ${this.videoPaths.mobile}`);
    }
  }

  /**
   * Converter vídeos para frames
   */
  async convertToFrames() {
    console.log('\n🎬 2. Convertendo vídeos para frames...');
    
    const converter = new VideoToFramesConverter({
      outputDir: this.outputDir,
      quality: 'high',
      fps: 23,
      formats: { desktop: 'jpg', mobile: 'webp' },
      maxWidth: { desktop: 1920, mobile: 1080 },
      compressionLevel: { jpg: 90, webp: 85 }
    });

    // Processar vídeo desktop
    console.log('   🖥️ Processando vídeo desktop...');
    const desktopResult = await converter.processVideo(
      this.videoPaths.desktop, 
      'videoscrolly_1_desktop'
    );

    // Processar vídeo mobile
    console.log('   📱 Processando vídeo mobile...');
    const mobileResult = await converter.processVideo(
      this.videoPaths.mobile, 
      'videoscrolly_1_mobile'
    );

    console.log(`   ✅ Desktop: ${desktopResult.desktop.frames} frames`);
    console.log(`   ✅ Mobile: ${mobileResult.mobile.frames} frames`);

    return { desktop: desktopResult, mobile: mobileResult };
  }

  /**
   * Upload dos frames
   */
  async uploadFrames() {
    console.log('\n📤 3. Fazendo upload dos frames...');
    
    const uploader = new FramesUploader({
      projectName: this.projectName,
      maxConcurrentUploads: 8
    });

    const uploadConfig = await uploader.uploadGeneratedFrames(this.outputDir);
    
    console.log(`   ✅ Upload concluído: ${uploadConfig.videos.length} conjunto(s) de frames`);
    
    return uploadConfig;
  }

  /**
   * Gerar configuração para Google Docs
   */
  async generateDocsConfig(uploadResults) {
    console.log('\n⚙️ 4. Gerando configuração para Google Docs...');
    
    // Encontrar os resultados dos nossos vídeos específicos
    const desktopVideo = uploadResults.videos.find(v => v.name.includes('desktop'));
    const mobileVideo = uploadResults.videos.find(v => v.name.includes('mobile'));
    
    if (!desktopVideo || !mobileVideo) {
      throw new Error('Não foi possível encontrar os vídeos processados no resultado do upload');
    }

    const config = {
      // Configuração para usar no Google Docs
      googleDocsConfig: {
        type: 'videoscrollytelling',
        
        // URLs dos frames
        imagePrefix: desktopVideo.desktop.framePrefix + desktopVideo.desktop.pattern,
        imagePrefixMobile: mobileVideo.mobile.framePrefix + mobileVideo.mobile.pattern,
        
        // Configurações de frames
        totalFrames: desktopVideo.desktop.totalFrames,
        frameStart: 1,
        frameStop: desktopVideo.desktop.totalFrames,
        
        // Extensões
        imageSuffix: '.jpg',
        imageSuffixMobile: '.webp',
        
        // Performance
        preloadFrames: 10,
        bufferSize: 20,
        smoothTransition: true,
        lazyLoading: true,
        
        // UI
        showProgress: true,
        showTime: true,
        showControls: false
      },
      
      // Configuração para o componente Svelte
      svelteConfig: {
        framePrefix: desktopVideo.desktop.framePrefix + desktopVideo.desktop.pattern,
        framePrefixMobile: mobileVideo.mobile.framePrefix + mobileVideo.mobile.pattern,
        totalFrames: desktopVideo.desktop.totalFrames,
        frameExtension: '.jpg',
        frameExtensionMobile: '.webp',
        framePadding: 4,
        startFrame: 1,
        endFrame: desktopVideo.desktop.totalFrames,
        height: '100vh',
        showProgress: true,
        preloadRadius: 10,
        maxMemoryMB: 80
      },
      
      // Metadados
      metadata: {
        projectName: this.projectName,
        generated: new Date().toISOString(),
        desktopFrames: desktopVideo.desktop.totalFrames,
        mobileFrames: mobileVideo.mobile.totalFrames,
        baseUrl: uploadResults.baseUrl,
        vaultUrl: uploadResults.vaultUrl
      }
    };

    // Salvar configuração
    const configPath = `./videoscrolly-config-${this.projectName}.json`;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    console.log(`   📄 Configuração salva: ${configPath}`);
    
    // Mostrar configuração para copiar no Google Docs
    this.showGoogleDocsInstructions(config.googleDocsConfig);
    
    return config;
  }

  /**
   * Mostrar instruções para Google Docs
   */
  showGoogleDocsInstructions(config) {
    console.log('\n' + '='.repeat(80));
    console.log('📋 CONFIGURAÇÃO PARA GOOGLE DOCS');
    console.log('='.repeat(80));
    console.log('\nCopie e cole no seu Google Docs:');
    console.log('\ntype: videoscrollytelling');
    console.log(`imagePrefix: ${config.imagePrefix}`);
    console.log(`imagePrefixMobile: ${config.imagePrefixMobile}`);
    console.log(`totalFrames: ${config.totalFrames}`);
    console.log(`frameStart: ${config.frameStart}`);
    console.log(`frameStop: ${config.frameStop}`);
    console.log(`imageSuffix: ${config.imageSuffix}`);
    console.log(`imageSuffixMobile: ${config.imageSuffixMobile}`);
    console.log(`preloadFrames: ${config.preloadFrames}`);
    console.log(`showProgress: ${config.showProgress}`);
    console.log(`showTime: ${config.showTime}`);
    console.log('='.repeat(80));
  }

  /**
   * Atualizar documentos JSON existentes com a nova configuração
   */
  async updateExistingDocs(config) {
    console.log('\n🔄 5. Atualizando documentos existentes...');
    
    try {
      const dataDir = path.join(__dirname, '../static/data');
      const files = await fs.readdir(dataDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(dataDir, file);
          const docContent = JSON.parse(await fs.readFile(filePath, 'utf8'));
          
          // Verificar se tem componentes videoscrollytelling
          if (docContent.paragraphs) {
            let updated = false;
            
            for (const paragraph of docContent.paragraphs) {
              if (['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(paragraph.type?.toLowerCase())) {
                // Atualizar com a nova configuração
                Object.assign(paragraph, config.googleDocsConfig);
                updated = true;
                
                console.log(`   ✅ Atualizado: ${file}`);
              }
            }
            
            if (updated) {
              await fs.writeFile(filePath, JSON.stringify(docContent, null, 2));
            }
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Aviso: Erro ao atualizar documentos existentes: ${error.message}`);
    }
  }

  /**
   * Processar documento específico
   */
  async processSpecificDoc(docSlug) {
    console.log(`\n📄 Processando documento específico: ${docSlug}`);
    
    try {
      const docPath = path.join(__dirname, '../static/data', `${docSlug}.json`);
      const docContent = JSON.parse(await fs.readFile(docPath, 'utf8'));
      
      // Primeiro processar os vídeos
      const config = await this.processVideos();
      
      // Depois atualizar o documento específico
      if (docContent.paragraphs) {
        let updated = false;
        
        for (const paragraph of docContent.paragraphs) {
          if (['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(paragraph.type?.toLowerCase())) {
            Object.assign(paragraph, config.googleDocsConfig);
            updated = true;
          }
        }
        
        if (updated) {
          await fs.writeFile(docPath, JSON.stringify(docContent, null, 2));
          console.log(`   ✅ Documento ${docSlug}.json atualizado com a nova configuração`);
        }
      }
      
      return { config, docPath };
      
    } catch (error) {
      console.error(`❌ Erro ao processar documento ${docSlug}:`, error.message);
      throw error;
    }
  }

  /**
   * Cleanup
   */
  async cleanup() {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
      console.log('🧹 Arquivos temporários removidos');
    } catch (error) {
      // Ignorar erros de cleanup
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎬 VideoScrolly Processor - Sistema do Guilherme

Processa os vídeos específicos:
- Desktop: /Users/guilhermegomes/dev/newsroom-system/static/videos/videoscrolly_1_main.mp4
- Mobile: /Users/guilhermegomes/dev/newsroom-system/static/videos/videoscrolly_1_mobile.mp4

Uso:
  node process-videoscrolly.js                    # Processar vídeos
  node process-videoscrolly.js --doc <slug>       # Processar e atualizar documento específico
  node process-videoscrolly.js --project <nome>   # Definir nome do projeto

Exemplos:
  node process-videoscrolly.js
  node process-videoscrolly.js --doc minha-historia
  node process-videoscrolly.js --project eleicoes-2024

O script irá:
1. ✅ Verificar se os vídeos existem
2. 🎬 Converter para frames (JPG desktop + WebP mobile)
3. 📤 Upload para CDN
4. ⚙️ Gerar configuração para Google Docs
5. 🔄 Atualizar documentos JSON existentes
    `);
    process.exit(1);
  }

  try {
    const options = parseArgs(args);
    const processor = new VideoScrollyProcessor(options.projectName);

    if (options.docSlug) {
      // Processar documento específico
      const result = await processor.processSpecificDoc(options.docSlug);
      console.log(`\n🎉 Documento ${options.docSlug} processado e atualizado!`);
      console.log(`📄 Arquivo: ${result.docPath}`);
    } else {
      // Processar apenas os vídeos
      const config = await processor.processVideos();
      console.log('\n🎉 Vídeos processados com sucesso!');
    }

    // Cleanup
    await processor.cleanup();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

function parseArgs(args) {
  const options = {
    projectName: 'newsroom-videoscrolly'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--doc':
        options.docSlug = args[++i];
        break;
      case '--project':
        options.projectName = args[++i];
        break;
    }
  }

  return options;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { VideoScrollyProcessor };