#!/usr/bin/env node

// auto-upload-frames.js - Upload Automático de Frames para CDN
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class FramesUploader {
  constructor(options = {}) {
    this.projectName = options.projectName || `scrolly-${Date.now()}`;
    this.baseUrl = options.baseUrl || 'https://especiais-interna.globoi.com/';
    this.vaultUrl = 'https://vault.globoi.com/p/especiais_svelte/storage/objects/g1/';
    this.maxConcurrentUploads = options.maxConcurrentUploads || 5;
    this.retryAttempts = options.retryAttempts || 3;
  }

  /**
   * Upload completo de frames gerados
   */
  async uploadGeneratedFrames(framesDir, videoName = null) {
    console.log(`🚀 Iniciando upload de frames: ${framesDir}`);
    
    try {
      // Detectar estrutura de diretórios
      const structure = await this.detectFrameStructure(framesDir);
      console.log(`📁 Estrutura detectada: ${structure.videos.length} vídeo(s)`);

      const results = [];

      for (const video of structure.videos) {
        console.log(`\n📤 Uploadando vídeo: ${video.name}`);
        
        const uploadResult = await this.uploadVideoFrames(video);
        results.push(uploadResult);
      }

      // Gerar configuração final
      const config = this.generateFinalConfig(results);
      await this.saveUploadConfig(config);

      console.log('\n✅ Upload concluído com sucesso!');
      return config;

    } catch (error) {
      console.error('❌ Erro no upload:', error.message);
      throw error;
    }
  }

  /**
   * Detectar estrutura de frames
   */
  async detectFrameStructure(framesDir) {
    const structure = { videos: [] };
    
    try {
      const items = await fs.readdir(framesDir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          const videoPath = path.join(framesDir, item.name);
          const video = await this.analyzeVideoDirectory(videoPath, item.name);
          
          if (video.desktop.frames.length > 0 || video.mobile.frames.length > 0) {
            structure.videos.push(video);
          }
        }
      }

      return structure;
    } catch (error) {
      throw new Error(`Erro ao analisar estrutura: ${error.message}`);
    }
  }

  /**
   * Analisar diretório de um vídeo
   */
  async analyzeVideoDirectory(videoPath, videoName) {
    const video = {
      name: videoName,
      path: videoPath,
      desktop: { frames: [], path: '', pattern: '' },
      mobile: { frames: [], path: '', pattern: '' }
    };

    try {
      // Verificar subdiretórios desktop e mobile
      const desktopPath = path.join(videoPath, 'desktop');
      const mobilePath = path.join(videoPath, 'mobile');

      // Analisar frames desktop
      try {
        await fs.access(desktopPath);
        const desktopFrames = await this.getFramesList(desktopPath, 'jpg');
        video.desktop = {
          frames: desktopFrames,
          path: desktopPath,
          pattern: this.extractPattern(desktopFrames[0] || '', videoName, 'desktop')
        };
      } catch (e) {
        console.warn(`⚠️ Pasta desktop não encontrada: ${desktopPath}`);
      }

      // Analisar frames mobile
      try {
        await fs.access(mobilePath);
        const mobileFrames = await this.getFramesList(mobilePath, 'webp');
        video.mobile = {
          frames: mobileFrames,
          path: mobilePath,
          pattern: this.extractPattern(mobileFrames[0] || '', videoName, 'mobile')
        };
      } catch (e) {
        console.warn(`⚠️ Pasta mobile não encontrada: ${mobilePath}`);
      }

      return video;
    } catch (error) {
      throw new Error(`Erro ao analisar ${videoPath}: ${error.message}`);
    }
  }

  /**
   * Obter lista de frames
   */
  async getFramesList(dirPath, preferredExtension) {
    try {
      const files = await fs.readdir(dirPath);
      const frameFiles = files
        .filter(f => {
          const ext = path.extname(f).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
        })
        .sort();

      return frameFiles;
    } catch (error) {
      return [];
    }
  }

  /**
   * Extrair padrão de nomenclatura
   */
  extractPattern(filename, videoName, platform) {
    if (!filename) return `${videoName}_${platform}_`;
    
    // Remover extensão e números do final
    const nameWithoutExt = path.parse(filename).name;
    const pattern = nameWithoutExt.replace(/\d+$/, '');
    
    return pattern;
  }

  /**
   * Upload de frames de um vídeo
   */
  async uploadVideoFrames(video) {
    const uploadTasks = [];
    const result = {
      name: video.name,
      desktop: { uploaded: 0, failed: 0, urls: [] },
      mobile: { uploaded: 0, failed: 0, urls: [] }
    };

    // Upload frames desktop
    if (video.desktop.frames.length > 0) {
      console.log(`  📸 Desktop: ${video.desktop.frames.length} frames`);
      
      for (const frame of video.desktop.frames) {
        const task = this.uploadFrame(
          path.join(video.desktop.path, frame),
          `${video.name}/desktop/${frame}`,
          'desktop'
        );
        uploadTasks.push(task);
      }
    }

    // Upload frames mobile
    if (video.mobile.frames.length > 0) {
      console.log(`  📱 Mobile: ${video.mobile.frames.length} frames`);
      
      for (const frame of video.mobile.frames) {
        const task = this.uploadFrame(
          path.join(video.mobile.path, frame),
          `${video.name}/mobile/${frame}`,
          'mobile'
        );
        uploadTasks.push(task);
      }
    }

    // Executar uploads em lotes
    const results = await this.executeInBatches(uploadTasks, this.maxConcurrentUploads);

    // Processar resultados
    for (const uploadResult of results) {
      if (uploadResult.success) {
        result[uploadResult.platform].uploaded++;
        result[uploadResult.platform].urls.push(uploadResult.publicUrl);
      } else {
        result[uploadResult.platform].failed++;
        console.error(`❌ Falha: ${uploadResult.error}`);
      }
    }

    return result;
  }

  /**
   * Upload de um frame individual
   */
  async uploadFrame(localPath, remotePath, platform) {
    const objectKey = `${this.projectName}/video-frames/${remotePath}`;
    
    try {
      // Simular upload para o Vault (adapte para sua API)
      const success = await this.uploadToVault(localPath, objectKey);
      
      if (success) {
        const publicUrl = `${this.baseUrl}g1/${objectKey}`;
        
        return {
          success: true,
          platform,
          localPath,
          remotePath,
          objectKey,
          publicUrl
        };
      } else {
        throw new Error('Upload falhou');
      }
    } catch (error) {
      return {
        success: false,
        platform,
        localPath,
        error: error.message
      };
    }
  }

  /**
   * Upload para o Vault (implementar conforme sua API)
   */
  async uploadToVault(localPath, objectKey) {
    try {
      // IMPLEMENTAR: Sua lógica de upload para o Vault
      // Por exemplo, usando AWS SDK, axios, etc.
      
      // Simular delay de upload
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`  ✅ ${path.basename(localPath)}`);
      return true;
      
    } catch (error) {
      console.error(`  ❌ ${path.basename(localPath)}: ${error.message}`);
      return false;
    }
  }

  /**
   * Executar tarefas em lotes
   */
  async executeInBatches(tasks, batchSize) {
    const results = [];
    
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(batch);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Erro desconhecido'
          });
        }
      }

      // Progress
      const progress = Math.round(((i + batchSize) / tasks.length) * 100);
      process.stdout.write(`\r  Progresso: ${Math.min(progress, 100)}%`);
    }
    
    console.log(); // Nova linha
    return results;
  }

  /**
   * Gerar configuração final
   */
  generateFinalConfig(uploadResults) {
    const config = {
      projectName: this.projectName,
      generated: new Date().toISOString(),
      baseUrl: this.baseUrl,
      vaultUrl: `${this.vaultUrl}${this.projectName}/video-frames/`,
      videos: []
    };

    for (const result of uploadResults) {
      const videoConfig = {
        name: result.name,
        desktop: {
          framePrefix: `${this.baseUrl}g1/${this.projectName}/video-frames/${result.name}/desktop/`,
          totalFrames: result.desktop.uploaded,
          extension: '.jpg',
          pattern: `${result.name}_desktop_`
        },
        mobile: {
          framePrefix: `${this.baseUrl}g1/${this.projectName}/video-frames/${result.name}/mobile/`,
          totalFrames: result.mobile.uploaded,
          extension: '.webp',
          pattern: `${result.name}_mobile_`
        },
        stats: {
          totalUploaded: result.desktop.uploaded + result.mobile.uploaded,
          totalFailed: result.desktop.failed + result.mobile.failed
        }
      };

      config.videos.push(videoConfig);
    }

    return config;
  }

  /**
   * Salvar configuração de upload
   */
  async saveUploadConfig(config) {
    const configPath = `./upload-config-${this.projectName}.json`;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    console.log(`\n📄 Configuração salva: ${configPath}`);
    
    // Mostrar configuração para uso
    this.showUsageInstructions(config);
  }

  /**
   * Mostrar instruções de uso
   */
  showUsageInstructions(config) {
    console.log('\n' + '='.repeat(80));
    console.log('📋 CONFIGURAÇÃO PARA USO NO SVELTE');
    console.log('='.repeat(80));

    config.videos.forEach((video, index) => {
      console.log(`\n<!-- Vídeo ${index + 1}: ${video.name} -->`);
      console.log(`<ScrollyFrames`);
      console.log(`  framePrefix="${video.desktop.framePrefix}${video.desktop.pattern}"`);
      console.log(`  totalFrames={${video.desktop.totalFrames}}`);
      console.log(`  frameExtension="${video.desktop.extension}"`);
      console.log(`  framePadding={4}`);
      console.log(`  height="100vh"`);
      console.log(`  showProgress={true}`);
      console.log(`  class="scrolly-video-${index + 1}"`);
      console.log(`/>`);
    });

    console.log('\n🎛️ LINKS ÚTEIS:');
    console.log(`📁 Vault: ${config.vaultUrl}`);
    console.log(`🌐 Base URL: ${config.baseUrl}`);
    console.log('='.repeat(80));
  }

  /**
   * Verificar status do projeto
   */
  async checkProjectStatus() {
    console.log(`🔍 Verificando projeto: ${this.projectName}`);
    
    // IMPLEMENTAR: Verificar se projeto existe no Vault
    // Listar objetos, verificar URLs, etc.
    
    return {
      exists: true,
      objects: 0,
      totalSize: 0
    };
  }

  /**
   * Limpar projeto
   */
  async cleanProject() {
    console.log(`🗑️ Limpando projeto: ${this.projectName}`);
    
    // IMPLEMENTAR: Remover todos os objetos do projeto
    
    console.log('✅ Projeto limpo');
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 Upload Automático de Frames - ScrollyTelling

Uso:
  node auto-upload-frames.js <frames-dir> [projeto]
  node auto-upload-frames.js --check <projeto>
  node auto-upload-frames.js --clean <projeto>

Opções:
  --project <nome>    Nome do projeto (padrão: scrolly-timestamp)
  --concurrent <num>  Uploads simultâneos (padrão: 5)
  --retry <num>       Tentativas de retry (padrão: 3)

Exemplos:
  node auto-upload-frames.js ./generated-frames meu-projeto-2024
  node auto-upload-frames.js ./generated-frames --concurrent 10
  node auto-upload-frames.js --check meu-projeto-2024
  node auto-upload-frames.js --clean meu-projeto-2024
    `);
    process.exit(1);
  }

  try {
    const options = parseUploadArgs(args);
    const uploader = new FramesUploader(options);

    if (options.command === 'check') {
      const status = await uploader.checkProjectStatus();
      console.log('Status:', status);
    } else if (options.command === 'clean') {
      await uploader.cleanProject();
    } else {
      // Upload normal
      const framesDir = args[0];
      await fs.access(framesDir);
      
      const config = await uploader.uploadGeneratedFrames(framesDir);
      console.log('\n🎉 Upload concluído com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

function parseUploadArgs(args) {
  const options = {
    maxConcurrentUploads: 5,
    retryAttempts: 3
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--project':
        options.projectName = args[++i];
        break;
      case '--concurrent':
        options.maxConcurrentUploads = parseInt(args[++i]);
        break;
      case '--retry':
        options.retryAttempts = parseInt(args[++i]);
        break;
      case '--check':
        options.command = 'check';
        options.projectName = args[++i];
        break;
      case '--clean':
        options.command = 'clean';
        options.projectName = args[++i];
        break;
      default:
        if (!arg.startsWith('--') && !options.projectName && args[1]) {
          options.projectName = args[1];
        }
        break;
    }
  }

  return options;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { FramesUploader };