#!/usr/bin/env node

// video-to-frames.js - Conversor Automático de Vídeos para Frames
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class VideoToFramesConverter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './generated-frames';
    this.quality = options.quality || 'high'; // 'high', 'medium', 'low'
    this.formats = options.formats || { desktop: 'jpg', mobile: 'webp' };
    this.fps = options.fps || 23; // Frames por segundo para extração
    this.maxWidth = options.maxWidth || { desktop: 1920, mobile: 1080 };
    this.compressionLevel = options.compressionLevel || { jpg: 85, webp: 80 };
  }

  /**
   * Processar vídeo principal - gera frames para desktop e mobile
   */
  async processVideo(videoPath, outputName) {
    console.log(`🎬 Processando vídeo: ${path.basename(videoPath)}`);
    
    try {
      // Verificar se o vídeo existe
      await fs.access(videoPath);
      
      // Obter informações do vídeo
      const videoInfo = await this.getVideoInfo(videoPath);
      console.log(`📊 Duração: ${videoInfo.duration}s | FPS: ${videoInfo.fps} | Resolução: ${videoInfo.width}x${videoInfo.height}`);
      
      // Criar diretórios
      await this.createDirectories(outputName);
      
      // Gerar frames para desktop (JPG)
      const desktopFrames = await this.generateFrames(videoPath, outputName, 'desktop');
      
      // Gerar frames para mobile (WebP)
      const mobileFrames = await this.generateFrames(videoPath, outputName, 'mobile');
      
      // Resultado
      const result = {
        video: videoPath,
        outputName,
        videoInfo,
        desktop: {
          format: 'jpg',
          frames: desktopFrames.length,
          path: path.join(this.outputDir, outputName, 'desktop'),
          pattern: `${outputName}_desktop_`,
          extension: '.jpg'
        },
        mobile: {
          format: 'webp',
          frames: mobileFrames.length,
          path: path.join(this.outputDir, outputName, 'mobile'),
          pattern: `${outputName}_mobile_`,
          extension: '.webp'
        }
      };

      console.log(`✅ Concluído: ${desktopFrames.length} frames desktop + ${mobileFrames.length} frames mobile`);
      return result;

    } catch (error) {
      console.error(`❌ Erro ao processar ${videoPath}:`, error.message);
      throw error;
    }
  }

  /**
   * Obter informações do vídeo
   */
  async getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('Stream de vídeo não encontrado'));
          return;
        }

        resolve({
          duration: parseFloat(videoStream.duration || metadata.format.duration),
          fps: this.parseFPS(videoStream.r_frame_rate),
          width: videoStream.width,
          height: videoStream.height,
          codec: videoStream.codec_name,
          bitrate: parseInt(videoStream.bit_rate || metadata.format.bit_rate)
        });
      });
    });
  }

  /**
   * Criar estrutura de diretórios
   */
  async createDirectories(outputName) {
    const basePath = path.join(this.outputDir, outputName);
    
    await fs.mkdir(path.join(basePath, 'desktop'), { recursive: true });
    await fs.mkdir(path.join(basePath, 'mobile'), { recursive: true });
    
    console.log(`📁 Diretórios criados: ${basePath}`);
  }

  /**
   * Gerar frames otimizados
   */
  async generateFrames(videoPath, outputName, platform) {
    const isDesktop = platform === 'desktop';
    const format = isDesktop ? this.formats.desktop : this.formats.mobile;
    const maxWidth = isDesktop ? this.maxWidth.desktop : this.maxWidth.mobile;
    const compression = this.compressionLevel[format];
    
    const outputDir = path.join(this.outputDir, outputName, platform);
    const filePattern = `${outputName}_${platform}_%04d.${format}`;
    const outputPattern = path.join(outputDir, filePattern);

    console.log(`🔄 Gerando frames ${platform.toUpperCase()} (${format.toUpperCase()})...`);

    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath);

      // Configurar filtros de vídeo
      const filters = [];
      
      // Redimensionar se necessário
      filters.push(`scale=${maxWidth}:-2:flags=lanczos`);
      
      // Aplicar filtros
      if (filters.length > 0) {
        command = command.videoFilters(filters);
      }

      // Configurar codec e qualidade
      command = command
        .fps(this.fps)
        .format('image2')
        .outputOptions([
          '-q:v', compression.toString(), // Qualidade
          '-pix_fmt', format === 'webp' ? 'yuv420p' : 'yuvj420p'
        ]);

      // Configurações específicas do formato
      if (format === 'webp') {
        command = command.outputOptions([
          '-c:v', 'libwebp',
          '-preset', 'picture', // Melhor para imagens estáticas
          '-method', '6' // Compressão máxima
        ]);
      } else if (format === 'jpg') {
        command = command.outputOptions([
          '-c:v', 'mjpeg'
        ]);
      }

      command
        .output(outputPattern)
        .on('start', (commandLine) => {
          console.log(`   Comando: ${commandLine.split(' ').slice(-3).join(' ')}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            process.stdout.write(`\r   Progresso: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', async () => {
          console.log(`\n   ✅ Frames ${platform} gerados com sucesso`);
          
          try {
            // Listar arquivos gerados
            const files = await fs.readdir(outputDir);
            const frameFiles = files
              .filter(f => f.startsWith(`${outputName}_${platform}_`) && f.endsWith(`.${format}`))
              .sort();
            
            resolve(frameFiles);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          console.error(`\n   ❌ Erro ao gerar frames ${platform}:`, err.message);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Processar múltiplos vídeos
   */
  async processMultipleVideos(videoPaths) {
    const results = [];
    
    console.log(`🎯 Processando ${videoPaths.length} vídeos...\n`);
    
    for (let i = 0; i < videoPaths.length; i++) {
      const videoPath = videoPaths[i];
      const outputName = `video_${i + 1}_${Date.now()}`;
      
      console.log(`\n📹 Vídeo ${i + 1}/${videoPaths.length}: ${path.basename(videoPath)}`);
      
      try {
        const result = await this.processVideo(videoPath, outputName);
        results.push(result);
      } catch (error) {
        console.error(`❌ Falha no vídeo ${i + 1}:`, error.message);
        results.push({ error: error.message, video: videoPath });
      }
    }
    
    return results;
  }

  /**
   * Gerar configuração para o componente Svelte
   */
  generateSvelteConfig(results, baseUrl = '') {
    const configs = results
      .filter(r => !r.error)
      .map((result, index) => ({
        id: `scrolly_${index + 1}`,
        framePrefix: `${baseUrl}${result.outputName}/desktop/${result.desktop.pattern}`,
        framePrefixMobile: `${baseUrl}${result.outputName}/mobile/${result.mobile.pattern}`,
        totalFrames: result.desktop.frames,
        frameExtension: result.desktop.extension,
        frameExtensionMobile: result.mobile.extension,
        framePadding: 4,
        startFrame: 1,
        endFrame: result.desktop.frames,
        originalVideo: path.basename(result.video),
        duration: Math.round(result.videoInfo.duration * 100) / 100,
        fps: result.videoInfo.fps
      }));

    return configs;
  }

  /**
   * Utilitários
   */
  parseFPS(frameRate) {
    if (!frameRate) return 30;
    
    const parts = frameRate.split('/');
    if (parts.length === 2) {
      return Math.round((parseInt(parts[0]) / parseInt(parts[1])) * 100) / 100;
    }
    
    return parseFloat(frameRate);
  }

  /**
   * Limpar diretório de saída
   */
  async cleanup(outputName = null) {
    try {
      const targetDir = outputName 
        ? path.join(this.outputDir, outputName)
        : this.outputDir;
        
      await fs.rm(targetDir, { recursive: true, force: true });
      console.log(`🗑️ Limpeza concluída: ${targetDir}`);
    } catch (error) {
      console.warn(`⚠️ Erro na limpeza:`, error.message);
    }
  }

  /**
   * Relatório de performance
   */
  async generateReport(results) {
    const totalFrames = results.reduce((sum, r) => {
      return sum + (r.desktop?.frames || 0) + (r.mobile?.frames || 0);
    }, 0);

    const totalSize = await this.calculateTotalSize(results);
    const avgFramesPerSecond = results.reduce((sum, r) => {
      return sum + (r.desktop?.frames || 0) / (r.videoInfo?.duration || 1);
    }, 0) / results.length;

    const report = {
      processedVideos: results.length,
      totalFrames,
      totalSizeMB: Math.round(totalSize * 100) / 100,
      avgFramesPerSecond: Math.round(avgFramesPerSecond * 100) / 100,
      errors: results.filter(r => r.error).length,
      results
    };

    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE CONVERSÃO');
    console.log('='.repeat(60));
    console.log(`🎬 Vídeos processados: ${report.processedVideos}`);
    console.log(`🖼️ Total de frames: ${report.totalFrames}`);
    console.log(`💾 Tamanho total: ${report.totalSizeMB} MB`);
    console.log(`📈 Média de frames/segundo: ${report.avgFramesPerSecond}`);
    console.log(`❌ Erros: ${report.errors}`);
    console.log('='.repeat(60));

    return report;
  }

  async calculateTotalSize(results) {
    let totalSize = 0;
    
    for (const result of results) {
      if (result.error) continue;
      
      try {
        const desktopPath = result.desktop.path;
        const mobilePath = result.mobile.path;
        
        totalSize += await this.getDirectorySize(desktopPath);
        totalSize += await this.getDirectorySize(mobilePath);
      } catch (error) {
        console.warn(`Erro ao calcular tamanho:`, error.message);
      }
    }
    
    return totalSize;
  }

  async getDirectorySize(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
      let size = 0;
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        size += stats.size;
      }
      
      return size / (1024 * 1024); // MB
    } catch (error) {
      return 0;
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎬 Conversor de Vídeos para Frames - ScrollyTelling

Uso:
  node video-to-frames.js <video1> [video2] [video3] ...
  node video-to-frames.js --dir <diretorio-videos>
  node video-to-frames.js --config <config.json>

Opções:
  --output <dir>      Diretório de saída (padrão: ./generated-frames)
  --quality <level>   Qualidade: high|medium|low (padrão: high)
  --fps <number>      FPS para extração (padrão: 23)
  --mobile-width <px> Largura máxima mobile (padrão: 1080)
  --desktop-width <px> Largura máxima desktop (padrão: 1920)
  --cleanup           Limpar diretório antes de processar

Exemplos:
  node video-to-frames.js video1.mp4 video2.mov
  node video-to-frames.js --dir ./videos --quality medium
  node video-to-frames.js intro.mp4 --fps 30 --mobile-width 720
    `);
    process.exit(1);
  }

  const options = parseArgs(args);
  const converter = new VideoToFramesConverter(options);

  try {
    let videoPaths = [];

    // Determinar vídeos para processar
    if (options.dir) {
      videoPaths = await findVideosInDirectory(options.dir);
    } else if (options.config) {
      const config = JSON.parse(await fs.readFile(options.config, 'utf8'));
      videoPaths = config.videos || [];
    } else {
      videoPaths = args.filter(arg => !arg.startsWith('--'));
    }

    if (videoPaths.length === 0) {
      throw new Error('Nenhum vídeo encontrado para processar');
    }

    // Cleanup se solicitado
    if (options.cleanup) {
      await converter.cleanup();
    }

    console.log(`🚀 Iniciando conversão de ${videoPaths.length} vídeo(s)...\n`);

    // Processar vídeos
    const results = await converter.processMultipleVideos(videoPaths);

    // Gerar relatório
    const report = await converter.generateReport(results);

    // Gerar configuração Svelte
    const svelteConfigs = converter.generateSvelteConfig(results);

    // Salvar configurações
    const configPath = path.join(options.outputDir, 'scrolly-config.json');
    await fs.writeFile(configPath, JSON.stringify({
      generated: new Date().toISOString(),
      videos: svelteConfigs,
      report
    }, null, 2));

    console.log(`\n📄 Configuração salva: ${configPath}`);
    console.log('\n🎉 Conversão concluída com sucesso!');

    // Mostrar exemplo de uso
    console.log('\n📋 EXEMPLO DE USO NO SVELTE:');
    svelteConfigs.forEach((config, index) => {
      console.log(`\n<!-- Vídeo ${index + 1}: ${config.originalVideo} -->`);
      console.log(`<ScrollyFrames`);
      console.log(`  framePrefix="${config.framePrefix}"`);
      console.log(`  totalFrames={${config.totalFrames}}`);
      console.log(`  frameExtension="${config.frameExtension}"`);
      console.log(`  height="100vh"`);
      console.log(`  showProgress={true}`);
      console.log(`/>`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

function parseArgs(args) {
  const options = {
    outputDir: './generated-frames',
    quality: 'high',
    fps: 23,
    maxWidth: { desktop: 1920, mobile: 1080 },
    compressionLevel: { jpg: 85, webp: 80 },
    cleanup: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--output':
        options.outputDir = args[++i];
        break;
      case '--quality':
        const quality = args[++i];
        options.quality = quality;
        // Ajustar compressão baseada na qualidade
        if (quality === 'high') {
          options.compressionLevel = { jpg: 90, webp: 85 };
        } else if (quality === 'medium') {
          options.compressionLevel = { jpg: 80, webp: 75 };
        } else if (quality === 'low') {
          options.compressionLevel = { jpg: 70, webp: 65 };
        }
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
      case '--cleanup':
        options.cleanup = true;
        break;
    }
  }

  return options;
}

async function findVideosInDirectory(dirPath) {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
  
  try {
    const files = await fs.readdir(dirPath);
    const videoPaths = [];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (videoExtensions.includes(ext)) {
        videoPaths.push(path.join(dirPath, file));
      }
    }

    return videoPaths;
  } catch (error) {
    throw new Error(`Erro ao ler diretório ${dirPath}: ${error.message}`);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { VideoToFramesConverter };