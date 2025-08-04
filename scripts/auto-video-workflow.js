// scripts/auto-video-workflow.js - Workflow Automático Completo
import { SmartFrameGenerator } from './smart-video-frames.js';
import { SmartFramesDeploy } from './smart-deploy-frames.js';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

/**
 * Workflow completo que baixa vídeos automaticamente
 */
export class AutoVideoWorkflow {
  constructor(projectName = null) {
    this.projectName = projectName || `auto-workflow-${Date.now()}`;
    this.videosDir = 'static/videos';
    this.generator = new SmartFrameGenerator();
    this.deployer = new SmartFramesDeploy(this.projectName);
  }

  /**
   * Workflow completo: Download → Frames → Deploy
   */
  async runComplete(docPath) {
    console.log('🚀 WORKFLOW AUTOMÁTICO COMPLETO');
    console.log('=' .repeat(60));
    console.log(`📁 Projeto: ${this.projectName}`);
    console.log(`📄 Documento: ${docPath}`);
    console.log('=' .repeat(60));

    try {
      // Etapa 1: Download de vídeos
      console.log('\n📥 ETAPA 1: DOWNLOAD DE VÍDEOS');
      console.log('-'.repeat(40));
      
      const downloadResults = await this.downloadVideos(docPath);
      
      if (downloadResults.length === 0) {
        console.log('⚠️ Nenhum vídeo para download, tentando usar arquivos locais...');
      } else {
        console.log(`✅ ${downloadResults.length} vídeos baixados`);
      }
      
      // Etapa 2: Gerar frames
      console.log('\n🎬 ETAPA 2: GERANDO FRAMES');
      console.log('-'.repeat(40));
      
      const generationResults = await this.generator.processDocument(docPath);
      
      if (generationResults.length === 0) {
        throw new Error('❌ Não foi possível gerar frames. Verifique os vídeos.');
      }
      
      console.log(`✅ Frames gerados para ${generationResults.length} componentes`);
      
      // Etapa 3: Deploy
      console.log('\n📤 ETAPA 3: DEPLOY PARA VAULT');
      console.log('-'.repeat(40));
      
      const deployResults = await this.deployer.deployComplete(docPath);
      
      // Etapa 4: Relatório final
      this.printFinalReport({
        downloads: downloadResults,
        generation: generationResults,
        deployment: deployResults
      });
      
      return {
        success: true,
        projectName: this.projectName,
        results: {
          downloads: downloadResults,
          generation: generationResults,
          deployment: deployResults
        }
      };
      
    } catch (error) {
      console.error(`\n💥 ERRO NO WORKFLOW: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download de vídeos das URLs no documento
   */
  async downloadVideos(docPath) {
    console.log('📥 Analisando vídeos para download...');
    
    const docContent = await fs.readFile(docPath, 'utf8');
    const doc = JSON.parse(docContent);
    
    // Encontrar VideoScrollytelling com URLs
    const videoScrollyComponents = doc.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (videoScrollyComponents.length === 0) {
      console.log('⚠️ Nenhum VideoScrollytelling encontrado');
      return [];
    }
    
    // Criar diretório de vídeos
    await fs.mkdir(this.videosDir, { recursive: true });
    
    const downloads = [];
    
    for (let i = 0; i < videoScrollyComponents.length; i++) {
      const component = videoScrollyComponents[i];
      
      console.log(`\n🔄 Processando VideoScrolly ${i + 1}/${videoScrollyComponents.length}`);
      
      // Download vídeo principal
      if (component.videoSrc && this.isUrl(component.videoSrc)) {
        try {
          const filename = `videoscrolly_${i + 1}_main.mp4`;
          const result = await this.downloadVideo(component.videoSrc, filename);
          
          // Atualizar componente com path local
          component.videoSrc = `videos/${filename}`;
          
          downloads.push({
            ...result,
            componentIndex: i,
            type: 'main'
          });
          
        } catch (error) {
          console.error(`❌ Erro no download do vídeo principal:`, error.message);
          
          // Tentar usar arquivo local se existir
          const localPath = await this.findLocalVideo(i + 1, 'main');
          if (localPath) {
            component.videoSrc = localPath;
            console.log(`✅ Usando vídeo local: ${localPath}`);
          }
        }
      }
      
      // Download vídeo mobile
      if (component.videoSrcMobile && this.isUrl(component.videoSrcMobile)) {
        try {
          const filename = `videoscrolly_${i + 1}_mobile.mp4`;
          const result = await this.downloadVideo(component.videoSrcMobile, filename);
          
          // Atualizar componente com path local
          component.videoSrcMobile = `videos/${filename}`;
          
          downloads.push({
            ...result,
            componentIndex: i,
            type: 'mobile'
          });
          
        } catch (error) {
          console.error(`❌ Erro no download do vídeo mobile:`, error.message);
          
          // Tentar usar arquivo local se existir
          const localPath = await this.findLocalVideo(i + 1, 'mobile');
          if (localPath) {
            component.videoSrcMobile = localPath;
            console.log(`✅ Usando vídeo local: ${localPath}`);
          }
        }
      }
    }
    
    // Salvar documento atualizado com paths locais
    if (downloads.length > 0) {
      await fs.writeFile(docPath, JSON.stringify(doc, null, 2));
      console.log(`✅ Documento atualizado com paths locais`);
    }
    
    return downloads;
  }

  /**
   * Download de vídeo único
   */
  async downloadVideo(url, filename) {
    console.log(`📥 Baixando: ${url}`);
    console.log(`💾 Destino: ${filename}`);
    
    const outputPath = path.join(this.videosDir, filename);
    
    try {
      // Fazer request
      const response = await fetch(url, { timeout: 300000 }); // 5 minutos
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentLength = parseInt(response.headers.get('content-length') || '0');
      console.log(`📊 Tamanho: ${this.formatSize(contentLength)}`);
      
      // Download com stream
      await pipeline(response.body, createWriteStream(outputPath));
      
      // Verificar arquivo
      const stats = await fs.stat(outputPath);
      console.log(`✅ Download concluído: ${this.formatSize(stats.size)}`);
      
      return {
        url,
        filename,
        outputPath,
        size: stats.size,
        success: true
      };
      
    } catch (error) {
      console.error(`❌ Erro no download:`, error.message);
      
      // Limpar arquivo parcial
      try {
        await fs.unlink(outputPath);
      } catch {
        // Ignorar erro de limpeza
      }
      
      throw error;
    }
  }

  /**
   * Procurar vídeo local existente
   */
  async findLocalVideo(componentIndex, type) {
    const possibleNames = [
      `videoscrolly_${componentIndex}_${type}.mp4`,
      `video_${componentIndex}_${type}.mp4`,
      `component_${componentIndex}_${type}.mp4`,
      `scrolly_${componentIndex}.mp4`
    ];
    
    for (const name of possibleNames) {
      const fullPath = path.join(this.videosDir, name);
      try {
        await fs.access(fullPath);
        return `videos/${name}`;
      } catch {
        // Continuar procurando
      }
    }
    
    return null;
  }

  /**
   * Verificar se string é URL
   */
  isUrl(str) {
    try {
      new URL(str);
      return str.startsWith('http');
    } catch {
      return false;
    }
  }

  /**
   * Formatar tamanho em bytes
   */
  formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Relatório final
   */
  printFinalReport(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL - WORKFLOW AUTOMÁTICO');
    console.log('='.repeat(80));
    
    console.log(`🚀 Projeto: ${this.projectName}`);
    console.log(`⏰ Concluído em: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`🌐 Base URL: ${results.deployment.baseUrl}`);
    
    console.log('\n📈 ESTATÍSTICAS:');
    console.log(`   📥 Vídeos baixados: ${results.downloads.length}`);
    console.log(`   🎬 Componentes processados: ${results.generation.length}`);
    console.log(`   📤 Frames desktop (JPG): ${results.deployment.frameResults.desktop.length}`);
    console.log(`   📤 Frames mobile (WebP): ${results.deployment.frameResults.mobile.length}`);
    console.log(`   ❌ Erros no upload: ${results.deployment.frameResults.errors.length}`);
    
    console.log('\n📋 CONFIGURAÇÃO PARA GOOGLE DOCS:');
    const docContent = JSON.parse(fs.readFileSync(results.deployment.documentUrl.replace(results.deployment.baseUrl, 'static'), 'utf8'));
    const videoScrollyComponents = docContent.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    videoScrollyComponents.forEach((component, index) => {
      console.log(`\nVideoScrolly ${index + 1}:`);
      console.log(`   type: videoscrollytelling`);
      console.log(`   imagePrefix: ${component.imagePrefix}`);
      console.log(`   imagePrefixMobile: ${component.imagePrefixMobile}`);
      console.log(`   totalFrames: ${component.totalFrames}`);
      console.log(`   showProgress: true`);
      console.log(`   showTime: true`);
    });
    
    console.log('\n🎛️ LINKS ÚTEIS:');
    console.log(`   📁 Vault: https://vault.globoi.com/p/especiais_svelte/storage/objects/g1/${this.projectName}/`);
    console.log(`   📄 Documento: ${results.deployment.documentUrl}`);
    
    console.log('\n🎉 STATUS: SUCESSO TOTAL');
    console.log('='.repeat(80));
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 Workflow Automático VideoScrollytelling

Automatiza TUDO:
1. Download automático de vídeos das URLs
2. Gera frames JPG (desktop) + WebP (mobile)
3. Upload organizado para Vault
4. Atualiza JSON com URLs corretas
5. Configuração pronta para Google Docs

Uso:
  node auto-video-workflow.js <documento.json> [projeto]

Exemplos:
  node auto-video-workflow.js static/data/meu-doc.json meu-projeto-2024
  node auto-video-workflow.js static/data/teste.json

O workflow resolve TUDO automaticamente:
✅ Download de vídeos de URLs
✅ Fallback para arquivos locais
✅ Frames otimizados (JPG + WebP)
✅ Upload para estrutura correta
✅ URLs públicas configuradas
✅ Pronto para produção
    `);
    process.exit(1);
  }
  
  try {
    const docPath = args[0];
    const projectName = args[1] || null;
    
    if (!docPath) throw new Error('Especifique o documento JSON');
    await fs.access(docPath);
    
    const workflow = new AutoVideoWorkflow(projectName);
    const result = await workflow.runComplete(docPath);
    
    if (result.success) {
      console.log('\n🎉 WORKFLOW AUTOMÁTICO CONCLUÍDO COM SUCESSO!');
      console.log(`📁 Projeto: ${result.projectName}`);
    }
    
  } catch (error) {
    console.error('💥 ERRO NO WORKFLOW AUTOMÁTICO:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}