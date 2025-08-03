// scripts/upload-video-frames.js - Upload de Frames para Vault
import { VideoFrameGenerator } from './generate-video-frames.js';
import { QuickVaultUploader } from './quick-upload.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Sistema completo: Gerar frames + Upload para Vault
 */
export class VideoFramesUploader {
  constructor(projectName, options = {}) {
    this.projectName = projectName;
    this.generator = new VideoFrameGenerator(options);
    this.uploader = new QuickVaultUploader(projectName);
    this.baseUrl = `https://s3.glbimg.com/v1/AUTH_9897f8564b5c46c9b6e85bda5912fe3b/g1/${projectName}`;
  }

  /**
   * Processo completo: Download → Gerar frames → Upload
   */
  async processVideoScrolly(docPath) {
    console.log('🚀 Iniciando processo completo de VideoScrollytelling...\n');
    
    // 0. Download de vídeos se necessário
    console.log('📥 Etapa 0: Verificando e baixando vídeos...');
    const { VideoDownloader } = await import('./video-downloader.js');
    const downloader = new VideoDownloader();
    await downloader.processDocument(docPath);
    
    // 1. Gerar frames localmente
    console.log('\n📝 Etapa 1: Gerando frames do vídeo...');
    const results = await this.generator.processDocument(docPath);
    
    if (results.length === 0) {
      console.log('⚠️ Nenhum VideoScrolly processado. Finalizando.');
      return [];
    }
    
    // 2. Upload dos frames para Vault
    console.log('\n📤 Etapa 2: Fazendo upload dos frames...');
    const uploadResults = [];
    
    for (const result of results) {
      console.log(`\n🔄 Upload VideoScrolly ${result.componentIndex + 1}...`);
      
      const frameUploads = [];
      
      for (const frame of result.frames) {
        try {
          console.log(`  📸 Uploading ${frame.filename}...`);
          
          // Upload para pasta video-frames/
          const remotePath = `video-frames/${frame.filename}`;
          const uploadResult = await this.uploader.uploadFile(frame.path, remotePath);
          
          frameUploads.push({
            ...frame,
            publicUrl: uploadResult.publicUrl,
            vaultUrl: uploadResult.vaultUrl,
            remotePath
          });
          
        } catch (error) {
          console.error(`  ❌ Erro no upload de ${frame.filename}:`, error.message);
        }
      }
      
      uploadResults.push({
        ...result,
        uploadedFrames: frameUploads,
        success: frameUploads.length === result.frames.length
      });
      
      console.log(`  ✅ Upload concluído: ${frameUploads.length}/${result.frames.length} frames`);
    }
    
    // 3. Atualizar JSON com URLs públicas
    console.log('\n📝 Etapa 3: Atualizando documento com URLs públicas...');
    await this.updateDocumentWithPublicUrls(docPath, uploadResults);
    
    // 4. Upload do JSON atualizado
    console.log('\n📤 Etapa 4: Fazendo upload do documento atualizado...');
    const docFilename = path.basename(docPath);
    await this.uploader.uploadFile(docPath, `data/${docFilename}`);
    
    // 5. Resumo final
    this.printSummary(uploadResults);
    
    return uploadResults;
  }

  /**
   * Atualizar documento JSON com URLs públicas dos frames
   */
  async updateDocumentWithPublicUrls(docPath, uploadResults) {
    const docContent = await fs.readFile(docPath, 'utf8');
    const doc = JSON.parse(docContent);
    
    // Atualizar cada componente VideoScrolly
    uploadResults.forEach(result => {
      const component = doc.paragraphs[result.componentIndex];
      
      if (component) {
        // Adicionar URLs públicas dos frames
        component.fallbackFrames = result.uploadedFrames.map(frame => ({
          index: frame.index,
          time: frame.time,
          src: frame.publicUrl,
          alt: `Frame do vídeo aos ${this.formatTime(frame.time)}`
        }));
        
        // Adicionar metadados úteis
        component.frameMetadata = {
          totalFrames: result.uploadedFrames.length,
          generatedAt: new Date().toISOString(),
          videoSrc: result.videoSrc,
          project: this.projectName
        };
      }
    });
    
    // Salvar documento atualizado
    await fs.writeFile(docPath, JSON.stringify(doc, null, 2));
    console.log('✅ Documento atualizado com URLs públicas');
  }

  /**
   * Gerar apenas frames (sem upload)
   */
  async generateOnly(docPath) {
    console.log('📸 Gerando apenas frames (sem upload)...');
    return await this.generator.processDocument(docPath);
  }

  /**
   * Upload apenas (frames já existem)
   */
  async uploadOnly(docPath) {
    console.log('📤 Fazendo upload de frames existentes...');
    
    const framesDir = this.generator.outputDir;
    
    try {
      const files = await fs.readdir(framesDir);
      const frameFiles = files.filter(f => f.includes('videoscrolly_') && f.endsWith('.jpg'));
      
      console.log(`📁 Encontrados ${frameFiles.length} frames para upload`);
      
      const uploads = [];
      
      for (const file of frameFiles) {
        const localPath = path.join(framesDir, file);
        const remotePath = `video-frames/${file}`;
        
        try {
          const result = await this.uploader.uploadFile(localPath, remotePath);
          uploads.push({ file, ...result });
        } catch (error) {
          console.error(`❌ Erro no upload de ${file}:`, error.message);
        }
      }
      
      console.log(`✅ Upload concluído: ${uploads.length}/${frameFiles.length} frames`);
      return uploads;
      
    } catch (error) {
      throw new Error(`Erro ao acessar diretório de frames: ${error.message}`);
    }
  }

  /**
   * Limpar frames locais e remotos
   */
  async clean(cleanRemote = false) {
    console.log('🧹 Limpando frames...');
    
    // Limpar arquivos locais
    await this.generator.cleanFrames();
    
    if (cleanRemote) {
      console.log('🧹 Limpando frames remotos...');
      // Implementar limpeza remota se necessário
      console.log('⚠️ Limpeza remota não implementada ainda');
    }
  }

  /**
   * Imprimir resumo do processamento
   */
  printSummary(uploadResults) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DO PROCESSAMENTO');
    console.log('='.repeat(60));
    
    const totalComponents = uploadResults.length;
    const successfulComponents = uploadResults.filter(r => r.success).length;
    const totalFrames = uploadResults.reduce((sum, r) => sum + r.uploadedFrames.length, 0);
    
    console.log(`📺 Componentes VideoScrolly: ${successfulComponents}/${totalComponents}`);
    console.log(`📸 Frames gerados e enviados: ${totalFrames}`);
    console.log(`🌐 Projeto: ${this.projectName}`);
    console.log(`🔗 Base URL: ${this.baseUrl}`);
    
    uploadResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`\n${status} VideoScrolly ${index + 1}:`);
      console.log(`   📁 Vídeo: ${path.basename(result.videoSrc)}`);
      console.log(`   📸 Frames: ${result.uploadedFrames.length}`);
      
      if (result.uploadedFrames.length > 0) {
        console.log(`   🔗 Exemplo: ${result.uploadedFrames[0].publicUrl}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Formatar tempo em mm:ss
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎬 Upload de Frames para VideoScrollytelling

Uso:
  node upload-video-frames.js <documento.json> [projeto]
  node upload-video-frames.js --generate-only <documento.json>
  node upload-video-frames.js --upload-only [projeto]
  node upload-video-frames.js --clean [projeto]

Exemplos:
  node upload-video-frames.js story.json my-project
  node upload-video-frames.js --generate-only story.json
  node upload-video-frames.js --upload-only my-project
  node upload-video-frames.js --clean my-project
    `);
    process.exit(1);
  }
  
  try {
    const command = args[0];
    
    if (command === '--generate-only') {
      const docPath = args[1];
      if (!docPath) throw new Error('Especifique o documento JSON');
      
      const uploader = new VideoFramesUploader('temp');
      await uploader.generateOnly(docPath);
      
    } else if (command === '--upload-only') {
      const projectName = args[1] || 'newsroom-system-2024';
      
      const uploader = new VideoFramesUploader(projectName);
      await uploader.uploadOnly();
      
    } else if (command === '--clean') {
      const projectName = args[1] || 'newsroom-system-2024';
      
      const uploader = new VideoFramesUploader(projectName);
      await uploader.clean(true);
      
    } else {
      // Processo completo
      const docPath = args[0];
      const projectName = args[1] || 'newsroom-system-2024';
      
      const uploader = new VideoFramesUploader(projectName);
      await uploader.processVideoScrolly(docPath);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}