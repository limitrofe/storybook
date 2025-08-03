// scripts/generate-video-frames.js - Gerador de Frames para VideoScrollytelling
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Classe para gerar frames de vídeo usando FFmpeg
 */
export class VideoFrameGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || 'static/video-frames';
    this.quality = options.quality || 60; // Qualidade JPEG (0-100)
    this.maxWidth = options.maxWidth || 1920;
    this.maxHeight = options.maxHeight || 1080;
    this.format = options.format || 'jpg';
  }

  /**
   * Gerar frames baseado em tempos específicos (para VideoScrollytelling)
   */
  async generateFramesFromTimes(videoPath, times, outputPrefix) {
    console.log(`🎬 Gerando ${times.length} frames do vídeo: ${videoPath}`);
    
    // Criar diretório de saída
    await fs.mkdir(this.outputDir, { recursive: true });
    
    const frames = [];
    
    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      const filename = `${outputPrefix}_frame_${String(i + 1).padStart(3, '0')}.${this.format}`;
      const outputPath = path.join(this.outputDir, filename);
      
      try {
        console.log(`📸 Frame ${i + 1}/${times.length} - ${time}s → ${filename}`);
        
        await this.extractFrame(videoPath, time, outputPath);
        
        frames.push({
          index: i,
          time: time,
          filename: filename,
          path: outputPath,
          url: `/video-frames/${filename}` // URL relativa para uso no site
        });
        
      } catch (error) {
        console.error(`❌ Erro no frame ${i + 1}:`, error.message);
        // Continuar com os outros frames mesmo se um falhar
      }
    }
    
    console.log(`✅ Gerados ${frames.length}/${times.length} frames com sucesso!`);
    return frames;
  }

  /**
   * Extrair um frame específico do vídeo
   */
  async extractFrame(videoPath, timeInSeconds, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timeInSeconds)
        .frames(1)
        .size(`${this.maxWidth}x${this.maxHeight}`)
        .outputFormat('image2')
        .outputOptions([
          '-q:v', this.quality.toString(),
          '-update', '1'
        ])
        .output(outputPath)
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .run();
    });
  }

  /**
   * Gerar informações sobre o vídeo (duração, dimensões, etc.)
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

        resolve({
          duration: parseFloat(metadata.format.duration),
          width: videoStream.width,
          height: videoStream.height,
          fps: eval(videoStream.r_frame_rate), // "30/1" → 30
          codec: videoStream.codec_name,
          bitrate: parseInt(metadata.format.bit_rate),
          size: parseInt(metadata.format.size)
        });
      });
    });
  }

  /**
   * Processar um documento JSON e gerar frames para todos os VideoScrollytelling
   */
  async processDocument(docPath) {
    console.log(`📖 Processando documento: ${docPath}`);
    
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
      
      // Extrair tempos dos steps
      const times = component.steps?.map(step => step.time || 0).filter(t => t > 0) || [];
      if (times.length === 0) {
        console.warn(`⚠️ VideoScrolly ${i + 1}: nenhum step com tempo definido`);
        continue;
      }
      
      try {
        // Converter path relativo ou URL para path local
        const localVideoPath = await this.resolveVideoPath(videoSrc);
        
        // Gerar frames
        const outputPrefix = `videoscrolly_${i + 1}`;
        const frames = await this.generateFramesFromTimes(localVideoPath, times, outputPrefix);
        
        // Atualizar componente com URLs dos frames
        component.fallbackFrames = frames;
        
        results.push({
          componentIndex: i,
          component,
          frames,
          videoSrc,
          localPath: localVideoPath
        });
        
      } catch (error) {
        console.error(`❌ Erro no VideoScrolly ${i + 1}:`, error.message);
      }
    }
    
    // Salvar documento atualizado
    if (results.length > 0) {
      await fs.writeFile(docPath, JSON.stringify(doc, null, 2));
      console.log(`\n✅ Documento atualizado com ${results.length} VideoScrolly processados`);
    }
    
    return results;
  }

  /**
   * Resolver path do vídeo (URL → local, relativo → absoluto)
   */
  async resolveVideoPath(videoSrc) {
    // Se for URL, baixar primeiro (implementação futura)
    if (videoSrc.startsWith('http')) {
      throw new Error('Download de vídeos via URL ainda não implementado. Use arquivos locais.');
    }
    
    // Se for path relativo, tornar absoluto
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
   * Limpar frames antigos
   */
  async cleanFrames(pattern = '*') {
    try {
      const files = await fs.readdir(this.outputDir);
      const toDelete = files.filter(f => f.includes(pattern));
      
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
🎬 Gerador de Frames para VideoScrollytelling

Uso:
  node generate-video-frames.js <documento.json>
  node generate-video-frames.js --video <video.mp4> --times <t1,t2,t3>
  node generate-video-frames.js --clean

Exemplos:
  node generate-video-frames.js story.json
  node generate-video-frames.js --video intro.mp4 --times 5,10,15,20
  node generate-video-frames.js --clean
    `);
    process.exit(1);
  }
  
  try {
    const generator = new VideoFrameGenerator();
    
    if (args[0] === '--clean') {
      await generator.cleanFrames();
      return;
    }
    
    if (args[0] === '--video') {
      // Modo manual
      const videoIndex = args.indexOf('--video');
      const timesIndex = args.indexOf('--times');
      
      if (videoIndex === -1 || timesIndex === -1) {
        throw new Error('Use: --video <arquivo> --times <t1,t2,t3>');
      }
      
      const videoPath = args[videoIndex + 1];
      const timesStr = args[timesIndex + 1];
      const times = timesStr.split(',').map(t => parseFloat(t.trim()));
      
      const frames = await generator.generateFramesFromTimes(videoPath, times, 'manual');
      console.log(`✅ Gerados ${frames.length} frames`);
      
    } else {
      // Modo documento
      const docPath = args[0];
      const results = await generator.processDocument(docPath);
      console.log(`✅ Processamento concluído: ${results.length} componentes`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}