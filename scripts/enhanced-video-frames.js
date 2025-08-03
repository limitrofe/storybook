// scripts/enhanced-video-frames.js - Extração Completa de Frames
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gerador avançado de frames com extração completa
 */
export class EnhancedFrameGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || 'static/video-frames';
    this.quality = options.quality || 85;
    this.maxWidth = options.maxWidth || 1920;
    this.maxHeight = options.maxHeight || 1080;
    this.targetFPS = options.targetFPS || 10; // FPS para extração
    this.format = options.format || 'jpg';
  }

  /**
   * Analisar vídeo e extrair TODOS os frames necessários
   */
  async extractAllFrames(videoPath, outputPrefix, options = {}) {
    console.log(`🎬 Analisando vídeo: ${videoPath}`);
    
    // 1. Obter informações do vídeo
    const videoInfo = await this.getVideoInfo(videoPath);
    console.log(`📊 Duração: ${videoInfo.duration}s | FPS: ${videoInfo.fps} | Resolução: ${videoInfo.width}x${videoInfo.height}`);
    
    // 2. Calcular quantos frames extrair
    const totalFrames = Math.ceil(videoInfo.duration * this.targetFPS);
    const interval = videoInfo.duration / totalFrames;
    
    console.log(`📸 Extraindo ${totalFrames} frames (${this.targetFPS} FPS)`);
    
    // 3. Criar diretório
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // 4. Extrair todos os frames de uma vez (mais eficiente)
    const frames = await this.extractFrameSequence(videoPath, outputPrefix, {
      totalFrames,
      interval,
      ...options
    });
    
    console.log(`✅ Extraídos ${frames.length} frames com sucesso!`);
    return {
      frames,
      videoInfo,
      totalFrames,
      interval,
      fps: this.targetFPS
    };
  }

  /**
   * Extrair sequência completa de frames usando FFmpeg
   */
  async extractFrameSequence(videoPath, outputPrefix, options = {}) {
    const { totalFrames, interval } = options;
    
    return new Promise((resolve, reject) => {
      const frames = [];
      const outputPattern = path.join(this.outputDir, `${outputPrefix}_frame_%04d.${this.format}`);
      
      ffmpeg(videoPath)
        // Configurar filtro para extrair frames em intervalo específico
        .videoFilters([
          `fps=${this.targetFPS}`, // Definir FPS de saída
          `scale=${this.maxWidth}:${this.maxHeight}:force_original_aspect_ratio=decrease:force_divisible_by=2`,
          'pad=ceil(iw/2)*2:ceil(ih/2)*2'
        ])
        .outputFormat('image2')
        .outputOptions([
          '-q:v', this.quality.toString(),
          '-start_number', '1'
        ])
        .output(outputPattern)
        .on('start', (commandLine) => {
          console.log('🔄 FFmpeg iniciado:', commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            process.stdout.write(`\r📸 Progresso: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', async () => {
          console.log('\n✅ Extração concluída!');
          
          // Listar frames gerados
          try {
            const files = await fs.readdir(this.outputDir);
            const frameFiles = files
              .filter(f => f.startsWith(outputPrefix) && f.endsWith(`.${this.format}`))
              .sort();
            
            // Criar metadados dos frames
            for (let i = 0; i < frameFiles.length; i++) {
              const time = i * interval;
              frames.push({
                index: i,
                filename: frameFiles[i],
                path: path.join(this.outputDir, frameFiles[i]),
                time: time,
                url: `/video-frames/${frameFiles[i]}`
              });
            }
            
            resolve(frames);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          console.error('\n❌ Erro no FFmpeg:', err.message);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Processar documento e gerar frames para VideoScrollytelling
   */
  async processDocumentAdvanced(docPath) {
    console.log(`📖 Processando documento avançado: ${docPath}`);
    
    const docContent = await fs.readFile(docPath, 'utf8');
    const doc = JSON.parse(docContent);
    
    // Encontrar componentes VideoScrollytelling
    const videoScrollyComponents = doc.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (videoScrollyComponents.length === 0) {
      console.log('⚠️ Nenhum componente VideoScrollytelling encontrado');
      return [];
    }
    
    console.log(`🎥 Encontrados ${videoScrollyComponents.length} componentes VideoScrollytelling`);
    
    const results = [];
    
    for (let i = 0; i < videoScrollyComponents.length; i++) {
      const component = videoScrollyComponents[i];
      
      console.log(`\n🔄 Processando VideoScrolly ${i + 1}/${videoScrollyComponents.length}`);
      
      // Determinar vídeo source
      const videoSrc = component.videoSrc || component.src;
      if (!videoSrc) {
        console.warn(`⚠️ VideoScrolly ${i + 1}: videoSrc não definido`);
        continue;
      }
      
      try {
        // Resolver path do vídeo
        const localVideoPath = await this.resolveVideoPath(videoSrc);
        
        // Extrair TODOS os frames
        const outputPrefix = `videoscrolly_${i + 1}`;
        const extraction = await this.extractAllFrames(localVideoPath, outputPrefix);
        
        // 🎯 NOVO: Calcular timing automático dos steps baseado nos frames
        const stepTimings = this.calculateStepTimings(component.steps, extraction.videoInfo.duration, extraction.totalFrames);
        
        // Atualizar componente com dados completos
        component.fallbackFrames = extraction.frames;
        component.videoMetadata = {
          duration: extraction.videoInfo.duration,
          fps: extraction.fps,
          totalFrames: extraction.totalFrames,
          interval: extraction.interval,
          stepTimings: stepTimings
        };
        
        // Atualizar steps com timing calculado
        component.steps = component.steps.map((step, stepIndex) => ({
          ...step,
          calculatedTime: stepTimings[stepIndex],
          frameIndex: Math.floor(stepTimings[stepIndex] / extraction.interval)
        }));
        
        results.push({
          componentIndex: i,
          component,
          extraction,
          stepTimings,
          localPath: localVideoPath
        });
        
      } catch (error) {
        console.error(`❌ Erro no VideoScrolly ${i + 1}:`, error.message);
      }
    }
    
    // Salvar documento atualizado
    if (results.length > 0) {
      await fs.writeFile(docPath, JSON.stringify(doc, null, 2));
      console.log(`\n✅ Documento atualizado com dados avançados`);
    }
    
    return results;
  }

  /**
   * Calcular timing automático dos steps baseado na duração do vídeo
   */
  calculateStepTimings(steps, videoDuration, totalFrames) {
    if (!steps || steps.length === 0) return [];
    
    // Se steps já têm time definido, usar esses valores
    const hasExplicitTimes = steps.some(step => step.time !== undefined);
    
    if (hasExplicitTimes) {
      console.log('⏰ Usando timings explícitos dos steps');
      return steps.map(step => step.time || 0);
    }
    
    // Calcular timing automático distribuído
    console.log('🤖 Calculando timing automático dos steps');
    const timings = [];
    
    for (let i = 0; i < steps.length; i++) {
      // Distribuir uniformemente ao longo do vídeo
      const progress = (i + 0.5) / steps.length; // +0.5 para centralizar
      const time = progress * videoDuration;
      timings.push(Math.round(time * 10) / 10); // Arredondar para 1 decimal
    }
    
    console.log('📍 Timings calculados:', timings.map(t => `${t}s`).join(', '));
    return timings;
  }

  /**
   * Resolver path do vídeo (mesmo do código anterior)
   */
  async resolveVideoPath(videoSrc) {
    if (videoSrc.startsWith('http')) {
      throw new Error('Download de vídeos via URL ainda não implementado. Use arquivos locais.');
    }
    
    if (!path.isAbsolute(videoSrc)) {
      const possiblePaths = [
        path.join(process.cwd(), 'static', videoSrc),
        path.join(process.cwd(), 'static', 'videos', videoSrc),
        path.join(process.cwd(), videoSrc)
      ];
      
      for (const possiblePath of possiblePaths) {
        try {
          await fs.access(possiblePath);
          return possiblePath;
        } catch {
          // Continuar tentando
        }
      }
      
      throw new Error(`Vídeo não encontrado: ${videoSrc}. Tentados: ${possiblePaths.join(', ')}`);
    }
    
    return videoSrc;
  }

  /**
   * Obter informações detalhadas do vídeo
   */
  async getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(new Error(`FFprobe error: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        // Calcular FPS real
        let fps = 30; // default
        if (videoStream.r_frame_rate) {
          const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
          fps = den ? num / den : num;
        }

        resolve({
          duration: parseFloat(metadata.format.duration),
          width: videoStream.width,
          height: videoStream.height,
          fps: Math.round(fps * 100) / 100,
          codec: videoStream.codec_name,
          bitrate: parseInt(metadata.format.bit_rate) || 0,
          size: parseInt(metadata.format.size) || 0
        });
      });
    });
  }

  /**
   * Limpar frames antigos
   */
  async cleanFrames(pattern = '*') {
    try {
      const files = await fs.readdir(this.outputDir);
      const toDelete = files.filter(f => f.includes(pattern) && f.endsWith(`.${this.format}`));
      
      for (const file of toDelete) {
        await fs.unlink(path.join(this.outputDir, file));
      }
      
      console.log(`🧹 Removidos ${toDelete.length} frames antigos`);
    } catch (error) {
      console.warn('⚠️ Erro ao limpar frames:', error.message);
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎬 Enhanced Frame Generator - Extração Completa

Uso:
  node enhanced-video-frames.js <documento.json> [--fps=10] [--quality=85]
  node enhanced-video-frames.js --video <video.mp4> [--fps=10] [--quality=85]
  node enhanced-video-frames.js --clean

Opções:
  --fps=N        FPS para extração (padrão: 10)
  --quality=N    Qualidade JPEG 1-100 (padrão: 85)
  --width=N      Largura máxima (padrão: 1920)
  --height=N     Altura máxima (padrão: 1080)

Exemplos:
  node enhanced-video-frames.js story.json --fps=15 --quality=90
  node enhanced-video-frames.js --video intro.mp4 --fps=5
  node enhanced-video-frames.js --clean
    `);
    process.exit(1);
  }
  
  try {
    // Parsear opções
    const options = {};
    args.forEach(arg => {
      if (arg.startsWith('--fps=')) options.targetFPS = parseInt(arg.split('=')[1]);
      if (arg.startsWith('--quality=')) options.quality = parseInt(arg.split('=')[1]);
      if (arg.startsWith('--width=')) options.maxWidth = parseInt(arg.split('=')[1]);
      if (arg.startsWith('--height=')) options.maxHeight = parseInt(arg.split('=')[1]);
    });
    
    const generator = new EnhancedFrameGenerator(options);
    
    if (args[0] === '--clean') {
      await generator.cleanFrames();
      return;
    }
    
    if (args[0] === '--video') {
      // Modo vídeo direto
      const videoPath = args[1];
      if (!videoPath) throw new Error('Especifique o arquivo de vídeo');
      
      const result = await generator.extractAllFrames(videoPath, 'manual');
      console.log(`✅ Extraídos ${result.frames.length} frames`);
      
    } else {
      // Modo documento
      const docPath = args[0];
      const results = await generator.processDocumentAdvanced(docPath);
      console.log(`✅ Processamento avançado concluído: ${results.length} componentes`);
      
      // Relatório detalhado
      results.forEach((result, index) => {
        console.log(`\n📊 VideoScrolly ${index + 1}:`);
        console.log(`   🎬 Duração: ${result.extraction.videoInfo.duration}s`);
        console.log(`   📸 Frames: ${result.extraction.totalFrames} (${result.extraction.fps} FPS)`);
        console.log(`   ⏰ Steps: ${result.stepTimings.map(t => `${t}s`).join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}