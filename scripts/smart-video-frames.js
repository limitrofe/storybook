// scripts/smart-video-frames.js - Gerador Inteligente com JPG + WebP
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gerador inteligente que cria JPG para desktop e WebP para mobile
 */
export class SmartFrameGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || 'static/video-frames';
    this.quality = {
      jpg: options.jpgQuality || 85,
      webp: options.webpQuality || 80
    };
    this.resolutions = {
      desktop: { width: 1920, height: 1080 },
      mobile: { width: 800, height: 450 }
    };
    this.targetFPS = options.targetFPS || 10;
  }

  /**
   * Processar documento e gerar frames otimizados
   */
  async processDocument(docPath) {
    console.log(`📖 Processando documento para frames otimizados: ${docPath}`);
    
    const docContent = await fs.readFile(docPath, 'utf8');
    const doc = JSON.parse(docContent);
    
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
      
      const videoSrc = component.videoSrc || component.src;
      if (!videoSrc) {
        console.warn(`⚠️ VideoScrolly ${i + 1}: videoSrc não definido`);
        continue;
      }
      
      try {
        // Resolver path do vídeo
        const localVideoPath = await this.resolveVideoPath(videoSrc);
        
        // Gerar frames para desktop e mobile
        const outputPrefix = `videoscrolly_${i + 1}`;
        const frameData = await this.generateOptimizedFrames(localVideoPath, outputPrefix, component);
        
        // Atualizar componente com dados dos frames
        component.fallbackFrames = frameData.fallbackFrames;
        component.totalFrames = frameData.totalFrames;
        component.imagePrefix = frameData.desktopPattern;
        component.imagePrefixMobile = frameData.mobilePattern;
        
        // Adicionar metadados úteis
        component.frameMetadata = {
          generated: new Date().toISOString(),
          videoInfo: frameData.videoInfo,
          formats: ['jpg', 'webp'],
          resolutions: this.resolutions
        };
        
        results.push({
          componentIndex: i,
          component,
          frameData,
          localPath: localVideoPath
        });
        
      } catch (error) {
        console.error(`❌ Erro no VideoScrolly ${i + 1}:`, error.message);
      }
    }
    
    // Salvar documento atualizado
    if (results.length > 0) {
      await fs.writeFile(docPath, JSON.stringify(doc, null, 2));
      console.log(`\n✅ Documento atualizado com dados dos frames`);
    }
    
    return results;
  }

  /**
   * Gerar frames otimizados (JPG desktop + WebP mobile)
   */
  async generateOptimizedFrames(videoPath, outputPrefix, component) {
    console.log(`🎬 Gerando frames otimizados: ${outputPrefix}`);
    
    // 1. Obter informações do vídeo
    const videoInfo = await this.getVideoInfo(videoPath);
    console.log(`📊 Duração: ${videoInfo.duration}s | FPS: ${videoInfo.fps} | Resolução: ${videoInfo.width}x${videoInfo.height}`);
    
    // 2. Calcular timing dos frames baseado nos steps
    const times = this.calculateFrameTimes(component, videoInfo.duration);
    console.log(`⏰ Extraindo ${times.length} frames em: ${times.map(t => `${t}s`).join(', ')}`);
    
    // 3. Criar diretórios
    const desktopDir = path.join(this.outputDir, 'desktop');
    const mobileDir = path.join(this.outputDir, 'mobile');
    await fs.mkdir(desktopDir, { recursive: true });
    await fs.mkdir(mobileDir, { recursive: true });
    
    // 4. Gerar frames desktop (JPG)
    console.log('📥 Gerando frames desktop (JPG)...');
    const desktopFrames = await this.extractFrames(
      videoPath, 
      times, 
      desktopDir, 
      outputPrefix, 
      'desktop',
      'jpg'
    );
    
    // 5. Gerar frames mobile (WebP)
    console.log('📱 Gerando frames mobile (WebP)...');
    const mobileFrames = await this.extractFrames(
      videoPath, 
      times, 
      mobileDir, 
      outputPrefix, 
      'mobile',
      'webp'
    );
    
    // 6. Criar fallbackFrames array
    const fallbackFrames = times.map((time, index) => ({
      index: index,
      time: time,
      desktop: desktopFrames[index]?.url,
      mobile: mobileFrames[index]?.url,
      src: desktopFrames[index]?.url || mobileFrames[index]?.url // fallback para src único
    }));
    
    console.log(`✅ Gerados ${desktopFrames.length} frames desktop e ${mobileFrames.length} mobile`);
    
    return {
      videoInfo,
      totalFrames: times.length,
      desktopPattern: `/video-frames/desktop/${outputPrefix}_frame_`,
      mobilePattern: `/video-frames/mobile/${outputPrefix}_frame_`,
      fallbackFrames,
      desktopFrames,
      mobileFrames,
      times
    };
  }

  /**
   * Extrair frames com formato e resolução específicos
   */
  async extractFrames(videoPath, times, outputDir, prefix, device, format) {
    const frames = [];
    const resolution = this.resolutions[device];
    const quality = this.quality[format];
    
    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      const paddedIndex = String(i + 1).padStart(4, '0');
      const filename = `${prefix}_frame_${paddedIndex}.${format}`;
      const outputPath = path.join(outputDir, filename);
      
      try {
        console.log(`📸 ${device} Frame ${i + 1}/${times.length} - ${time}s → ${filename}`);
        
        await this.extractSingleFrame(videoPath, time, outputPath, resolution, format, quality);
        
        frames.push({
          index: i,
          time: time,
          filename: filename,
          path: outputPath,
          url: `/video-frames/${device}/${filename}`,
          device: device,
          format: format
        });
        
      } catch (error) {
        console.error(`❌ Erro no frame ${device} ${i + 1}:`, error.message);
      }
    }
    
    return frames;
  }

  /**
   * Extrair um frame específico com configurações otimizadas
   */
  async extractSingleFrame(videoPath, timeInSeconds, outputPath, resolution, format, quality) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(videoPath)
        .seekInput(timeInSeconds)
        .frames(1)
        .size(`${resolution.width}x${resolution.height}`)
        .outputFormat('image2');
      
      // Configurações específicas por formato
      if (format === 'webp') {
        command.outputOptions([
          '-c:v', 'libwebp',
          '-quality', quality.toString(),
          '-method', '6', // Melhor compressão
          '-preset', 'photo'
        ]);
      } else { // jpg
        command.outputOptions([
          '-q:v', Math.round((100 - quality) / 10).toString(), // Converter qualidade WebP para JPEG
          '-update', '1'
        ]);
      }
      
      command
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
        .run();
    });
  }

  /**
   * Calcular tempos dos frames baseado no FPS alvo (CORRIGIDO + SEGURO)
   */
  calculateFrameTimes(component, videoDuration) {
    // ✅ CORREÇÃO: SEMPRE usar distribuição uniforme baseada no targetFPS
    const totalFrames = Math.ceil(videoDuration * this.targetFPS);
    const times = [];
    
    console.log(`⏰ Calculando tempos: ${videoDuration}s × ${this.targetFPS}fps = ${totalFrames} frames`);
    
    for (let i = 0; i < totalFrames; i++) {
      // ✅ SEGURANÇA: Garantir que não ultrapassa a duração do vídeo
      const time = (i / totalFrames) * videoDuration; // Mudança: totalFrames ao invés de (totalFrames - 1)
      const safeTime = Math.min(time, videoDuration - 0.1); // Garantir margem de 0.1s antes do final
      times.push(Math.round(safeTime * 100) / 100); // Arredondar para 2 decimais
    }
    
    // 🎯 OPCIONAL: Se há steps com tempos explícitos, adicionar esses tempos também
    const steps = component.steps || [];
    const explicitTimes = steps
      .map(step => step.time)
      .filter(time => typeof time === 'number' && time >= 0 && time < videoDuration - 0.1); // Segurança aqui também
    
    if (explicitTimes.length > 0) {
      console.log(`📍 Adicionando ${explicitTimes.length} tempos explícitos dos steps`);
      // Adicionar tempos dos steps (sem duplicar)
      explicitTimes.forEach(stepTime => {
        if (!times.some(t => Math.abs(t - stepTime) < 0.1)) {
          times.push(stepTime);
        }
      });
      
      // Ordenar e remover duplicatas
      times.sort((a, b) => a - b);
    }
    
    // ✅ SEGURANÇA FINAL: Filtrar qualquer tempo que ultrapassou
    const safeTimes = times.filter(time => time < videoDuration - 0.1);
    
    console.log(`📸 Total de frames a extrair: ${safeTimes.length}`);
    console.log(`⏱️ Primeiros tempos: ${safeTimes.slice(0, 5).join('s, ')}s...`);
    console.log(`⏱️ Últimos tempos: ...${safeTimes.slice(-3).join('s, ')}s`);
    
    return safeTimes;
  }

  /**
   * Resolver path do vídeo
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
   * Obter informações do vídeo
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

        let fps = 30;
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
          bitrate: parseInt(metadata.format.bit_rate) || 0
        });
      });
    });
  }

  /**
   * Limpar frames gerados
   */
  async cleanFrames() {
    try {
      const desktopDir = path.join(this.outputDir, 'desktop');
      const mobileDir = path.join(this.outputDir, 'mobile');
      
      for (const dir of [desktopDir, mobileDir]) {
        try {
          const files = await fs.readdir(dir);
          for (const file of files) {
            if (file.includes('videoscrolly_')) {
              await fs.unlink(path.join(dir, file));
            }
          }
          console.log(`🧹 Limpeza concluída: ${dir}`);
        } catch (error) {
          console.warn(`⚠️ Erro ao limpar ${dir}:`, error.message);
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro na limpeza:', error.message);
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎬 Smart Video Frame Generator - JPG + WebP

Gera frames otimizados:
- Desktop: JPG alta qualidade
- Mobile: WebP compacto
- Organização automática em pastas

Uso:
  node smart-video-frames.js <documento.json> [opções]
  node smart-video-frames.js --clean

Opções:
  --jpg-quality=N     Qualidade JPG desktop (padrão: 85)
  --webp-quality=N    Qualidade WebP mobile (padrão: 80)
  --fps=N             FPS de extração (padrão: 10)

Exemplos:
  node smart-video-frames.js story.json
  node smart-video-frames.js story.json --jpg-quality=90 --webp-quality=75
  node smart-video-frames.js --clean
    `);
    process.exit(1);
  }
  
  try {
    // Parsear opções
    const options = {};
    args.forEach(arg => {
      if (arg.startsWith('--jpg-quality=')) options.jpgQuality = parseInt(arg.split('=')[1]);
      if (arg.startsWith('--webp-quality=')) options.webpQuality = parseInt(arg.split('=')[1]);
      if (arg.startsWith('--fps=')) options.targetFPS = parseInt(arg.split('=')[1]);
    });
    
    const generator = new SmartFrameGenerator(options);
    
    if (args[0] === '--clean') {
      await generator.cleanFrames();
      console.log('✅ Limpeza concluída!');
      return;
    }
    
    const docPath = args[0];
    const results = await generator.processDocument(docPath);
    
    console.log(`\n🎉 Processamento concluído: ${results.length} componentes`);
    
    // Relatório detalhado
    results.forEach((result, index) => {
      console.log(`\n📊 VideoScrolly ${index + 1}:`);
      console.log(`   🖥️ Desktop (JPG): ${result.frameData.desktopFrames.length} frames`);
      console.log(`   📱 Mobile (WebP): ${result.frameData.mobileFrames.length} frames`);
      console.log(`   ⏱️ Duração: ${result.frameData.videoInfo.duration}s`);
      console.log(`   🔗 Desktop Pattern: ${result.frameData.desktopPattern}XXXX.jpg`);
      console.log(`   🔗 Mobile Pattern: ${result.frameData.mobilePattern}XXXX.webp`);
    });
    
    console.log(`\n📋 Para usar no Google Docs, configure:`);
    results.forEach((result, index) => {
      console.log(`\nVideoScrolly ${index + 1}:`);
      console.log(`imagePrefix: ${result.frameData.desktopPattern}0001.jpg`);
      console.log(`imagePrefixMobile: ${result.frameData.mobilePattern}0001.webp`);
      console.log(`totalFrames: ${result.frameData.totalFrames}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}