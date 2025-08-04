// scripts/smart-deploy-frames.js - Deploy Inteligente para Frames (COMPLETO)
import { QuickVaultUploader } from './quick-upload.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Deploy inteligente que organiza frames na estrutura correta do Vault
 */
export class SmartFramesDeploy {
  constructor(projectName) {
    this.projectName = projectName || `frames-${Date.now()}`;
    this.uploader = new QuickVaultUploader(this.projectName);
    this.localFramesDir = 'static/video-frames';
    this.baseUrl = `https://s3.glbimg.com/v1/AUTH_9897f8564b5c46c9b6e85bda5912fe3b/g1/${this.projectName}`;
  }

  /**
   * Deploy completo: frames + JSON atualizado
   */
  async deployComplete(docPath) {
    console.log('🚀 Deploy completo iniciado...\n');
    
    // 1. Upload dos frames organizados
    console.log('📤 Etapa 1: Upload dos frames...');
    const frameResults = await this.uploadFrames();
    
    // 2. Atualizar JSON com URLs corretas
    console.log('\n📝 Etapa 2: Atualizando documento JSON...');
    const updatedDoc = await this.updateDocumentUrls(docPath, frameResults);
    
    // 3. Upload do JSON atualizado
    console.log('\n📤 Etapa 3: Upload do documento atualizado...');
    const docFilename = path.basename(docPath);
    await this.uploader.uploadFile(docPath, `data/${docFilename}`);
    
    // 4. Resumo final
    this.printDeployReport(frameResults, updatedDoc);
    
    return {
      success: true,
      frameResults,
      documentUrl: `${this.baseUrl}/data/${docFilename}`,
      baseUrl: this.baseUrl
    };
  }

  /**
   * Upload de frames organizando por estrutura
   */
  async uploadFrames() {
    console.log(`📁 Fazendo upload de frames de: ${this.localFramesDir}`);
    
    const results = {
      desktop: [],
      mobile: [],
      errors: []
    };
    
    // Upload frames desktop (JPG)
    const desktopDir = path.join(this.localFramesDir, 'desktop');
    try {
      const desktopFiles = await fs.readdir(desktopDir);
      const jpgFiles = desktopFiles.filter(f => f.endsWith('.jpg'));
      
      console.log(`🖥️ Uploading ${jpgFiles.length} frames desktop (JPG)...`);
      
      for (const file of jpgFiles) {
        try {
          const localPath = path.join(desktopDir, file);
          const remotePath = `video-frames/desktop/${file}`;
          
          const uploadResult = await this.uploader.uploadFile(localPath, remotePath);
          
          results.desktop.push({
            filename: file,
            localPath,
            remotePath,
            publicUrl: uploadResult.publicUrl,
            vaultUrl: uploadResult.vaultUrl
          });
          
          console.log(`  ✅ ${file}`);
          
        } catch (error) {
          console.error(`  ❌ ${file}: ${error.message}`);
          results.errors.push({ file, error: error.message, type: 'desktop' });
        }
      }
    } catch (error) {
      console.warn(`⚠️ Pasta desktop não encontrada: ${desktopDir}`);
    }
    
    // Upload frames mobile (WebP)
    const mobileDir = path.join(this.localFramesDir, 'mobile');
    try {
      const mobileFiles = await fs.readdir(mobileDir);
      const webpFiles = mobileFiles.filter(f => f.endsWith('.webp'));
      
      console.log(`📱 Uploading ${webpFiles.length} frames mobile (WebP)...`);
      
      for (const file of webpFiles) {
        try {
          const localPath = path.join(mobileDir, file);
          const remotePath = `video-frames/mobile/${file}`;
          
          const uploadResult = await this.uploader.uploadFile(localPath, remotePath);
          
          results.mobile.push({
            filename: file,
            localPath,
            remotePath,
            publicUrl: uploadResult.publicUrl,
            vaultUrl: uploadResult.vaultUrl
          });
          
          console.log(`  ✅ ${file}`);
          
        } catch (error) {
          console.error(`  ❌ ${file}: ${error.message}`);
          results.errors.push({ file, error: error.message, type: 'mobile' });
        }
      }
    } catch (error) {
      console.warn(`⚠️ Pasta mobile não encontrada: ${mobileDir}`);
    }
    
    console.log(`\n📊 Upload concluído:`);
    console.log(`   🖥️ Desktop: ${results.desktop.length} arquivos`);
    console.log(`   📱 Mobile: ${results.mobile.length} arquivos`);
    console.log(`   ❌ Erros: ${results.errors.length}`);
    
    return results;
  }

  /**
   * Atualizar URLs no documento JSON
   */
  async updateDocumentUrls(docPath, frameResults) {
    const docContent = await fs.readFile(docPath, 'utf8');
    const doc = JSON.parse(docContent);
    
    // Encontrar componentes VideoScrollytelling
    const videoScrollyComponents = doc.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (videoScrollyComponents.length === 0) {
      console.log('⚠️ Nenhum componente VideoScrollytelling encontrado no documento');
      return doc;
    }
    
    console.log(`🔄 Atualizando ${videoScrollyComponents.length} componentes VideoScrollytelling...`);
    
    // Criar mapeamento de arquivos para URLs
    const urlMap = this.createUrlMapping(frameResults);
    
    videoScrollyComponents.forEach((component, index) => {
      console.log(`\n📝 Atualizando VideoScrolly ${index + 1}...`);
      
      // Detectar padrão dos arquivos baseado no componente
      const componentPattern = `videoscrolly_${index + 1}_frame_`;
      
      // Atualizar imagePrefix e imagePrefixMobile
      component.imagePrefix = `${this.baseUrl}/video-frames/desktop/${componentPattern}`;
      component.imagePrefixMobile = `${this.baseUrl}/video-frames/mobile/${componentPattern}`;
      
      // Contar frames disponíveis para este componente
      const desktopFrames = frameResults.desktop.filter(f => f.filename.includes(componentPattern));
      const mobileFrames = frameResults.mobile.filter(f => f.filename.includes(componentPattern));
      
      component.totalFrames = Math.max(desktopFrames.length, mobileFrames.length);
      
      // ✅ CORREÇÃO: Atualizar fallbackFrames com URLs COMPLETAS
      if (component.fallbackFrames && Array.isArray(component.fallbackFrames)) {
        component.fallbackFrames = component.fallbackFrames.map((frame, frameIndex) => {
          const paddedIndex = String(frameIndex + 1).padStart(4, '0');
          const desktopUrl = `${this.baseUrl}/video-frames/desktop/${componentPattern}${paddedIndex}.jpg`;
          const mobileUrl = `${this.baseUrl}/video-frames/mobile/${componentPattern}${paddedIndex}.webp`;
          
          return {
            ...frame,
            src: desktopUrl,
            desktop: desktopUrl,
            mobile: mobileUrl
          };
        });
      } else {
        // ✅ NOVO: Criar fallbackFrames se não existir
        component.fallbackFrames = [];
        for (let i = 0; i < component.totalFrames; i++) {
          const paddedIndex = String(i + 1).padStart(4, '0');
          const desktopUrl = `${this.baseUrl}/video-frames/desktop/${componentPattern}${paddedIndex}.jpg`;
          const mobileUrl = `${this.baseUrl}/video-frames/mobile/${componentPattern}${paddedIndex}.webp`;
          
          component.fallbackFrames.push({
            index: i,
            time: (i / (component.totalFrames - 1)) * 20, // Assumindo 20s de vídeo
            src: desktopUrl,
            desktop: desktopUrl,
            mobile: mobileUrl
          });
        }
      }
      
      // Adicionar metadados de deploy
      component.deployMetadata = {
        deployedAt: new Date().toISOString(),
        project: this.projectName,
        baseUrl: this.baseUrl,
        desktopFrames: desktopFrames.length,
        mobileFrames: mobileFrames.length,
        patterns: {
          desktop: component.imagePrefix,
          mobile: component.imagePrefixMobile
        }
      };
      
      console.log(`   ✅ imagePrefix: ${component.imagePrefix}XXXX.jpg`);
      console.log(`   ✅ imagePrefixMobile: ${component.imagePrefixMobile}XXXX.webp`);
      console.log(`   ✅ totalFrames: ${component.totalFrames}`);
    });
    
    // Salvar documento atualizado
    await fs.writeFile(docPath, JSON.stringify(doc, null, 2));
    console.log('✅ Documento atualizado com URLs públicas');
    
    return doc;
  }

  /**
   * Criar mapeamento de arquivos para URLs
   */
  createUrlMapping(frameResults) {
    const urlMap = {
      desktop: {},
      mobile: {}
    };
    
    frameResults.desktop.forEach(frame => {
      urlMap.desktop[frame.filename] = frame.publicUrl;
    });
    
    frameResults.mobile.forEach(frame => {
      urlMap.mobile[frame.filename] = frame.publicUrl;
    });
    
    return urlMap;
  }

  /**
   * Testar se URLs estão acessíveis
   */
  async testDeployedUrls(doc) {
    console.log('\n🔍 Testando URLs deployadas...');
    
    const videoScrollyComponents = doc.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    for (let i = 0; i < videoScrollyComponents.length; i++) {
      const component = videoScrollyComponents[i];
      console.log(`\n🧪 Testando VideoScrolly ${i + 1}:`);
      
      // Testar alguns frames de exemplo
      const testUrls = [];
      
      if (component.imagePrefix && component.totalFrames > 0) {
        testUrls.push({
          type: 'desktop',
          url: `${component.imagePrefix}0001.jpg`
        });
      }
      
      if (component.imagePrefixMobile && component.totalFrames > 0) {
        testUrls.push({
          type: 'mobile',
          url: `${component.imagePrefixMobile}0001.webp`
        });
      }
      
      for (const test of testUrls) {
        try {
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(test.url, { method: 'HEAD', timeout: 5000 });
          
          const status = response.ok ? '✅' : '❌';
          console.log(`  ${status} ${test.type}: ${test.url} (${response.status})`);
          
        } catch (error) {
          console.log(`  ❌ ${test.type}: ${test.url} (${error.message})`);
        }
      }
    }
  }

  /**
   * Imprimir relatório final
   */
  printDeployReport(frameResults, doc) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE DEPLOY');
    console.log('='.repeat(60));
    
    console.log(`🚀 Projeto: ${this.projectName}`);
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`📤 Frames Desktop: ${frameResults.desktop.length} (JPG)`);
    console.log(`📤 Frames Mobile: ${frameResults.mobile.length} (WebP)`);
    console.log(`❌ Erros: ${frameResults.errors.length}`);
    
    const videoScrollyComponents = doc.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    console.log(`\n🎬 Componentes VideoScrollytelling configurados: ${videoScrollyComponents.length}`);
    
    videoScrollyComponents.forEach((component, index) => {
      console.log(`\n📱 VideoScrolly ${index + 1}:`);
      console.log(`   🖥️ Desktop: ${component.imagePrefix}XXXX.jpg`);
      console.log(`   📱 Mobile: ${component.imagePrefixMobile}XXXX.webp`);
      console.log(`   📊 Total Frames: ${component.totalFrames}`);
      console.log(`   🎛️ Vault: https://vault.globoi.com/p/especiais_svelte/storage/objects/g1/${this.projectName}/video-frames/`);
    });
    
    if (frameResults.errors.length > 0) {
      console.log(`\n❌ ERROS (${frameResults.errors.length}):`);
      frameResults.errors.forEach(error => {
        console.log(`   ${error.type}: ${error.file} - ${error.error}`);
      });
    }
    
    console.log('\n📋 PARA USAR NO GOOGLE DOCS:');
    videoScrollyComponents.forEach((component, index) => {
      console.log(`\nVideoScrolly ${index + 1}:`);
      console.log(`imagePrefix: ${component.imagePrefix}`);
      console.log(`imagePrefixMobile: ${component.imagePrefixMobile}`);
      console.log(`totalFrames: ${component.totalFrames}`);
    });
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Deploy apenas frames (sem atualizar JSON)
   */
  async deployFramesOnly() {
    console.log('📤 Deploy apenas de frames...\n');
    return await this.uploadFrames();
  }

  /**
   * Limpar projeto no Vault
   */
  async cleanProject() {
    console.log(`🧹 Limpando projeto ${this.projectName} no Vault...`);
    
    // Implementar limpeza se necessário
    console.log('⚠️ Limpeza automática não implementada. Use o Vault manualmente.');
    console.log(`🔗 https://vault.globoi.com/p/especiais_svelte/storage/objects/g1/${this.projectName}/`);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 Smart Deploy - Frames VideoScrollytelling

Deploy inteligente que organiza frames:
- Desktop: JPG em /video-frames/desktop/
- Mobile: WebP em /video-frames/mobile/
- Atualiza JSON com URLs corretas
- Gera padrões para Google Docs

Uso:
  node smart-deploy-frames.js <documento.json> [projeto]
  node smart-deploy-frames.js --frames-only [projeto]
  node smart-deploy-frames.js --test <documento.json>
  node smart-deploy-frames.js --clean [projeto]

Exemplos:
  node smart-deploy-frames.js story.json meu-projeto-2024
  node smart-deploy-frames.js --frames-only frames-especiais
  node smart-deploy-frames.js --test story.json
  node smart-deploy-frames.js --clean old-project
    `);
    process.exit(1);
  }
  
  try {
    const command = args[0];
    
    if (command === '--frames-only') {
      // Deploy apenas frames
      const projectName = args[1] || `frames-${Date.now()}`;
      
      const deployer = new SmartFramesDeploy(projectName);
      const frameResults = await deployer.deployFramesOnly();
      
      console.log(`\n✅ Deploy de frames concluído!`);
      console.log(`🌐 Base URL: ${deployer.baseUrl}`);
      
    } else if (command === '--test') {
      // Testar URLs de um documento
      const docPath = args[1];
      if (!docPath) throw new Error('Especifique o documento JSON');
      
      const docContent = await fs.readFile(docPath, 'utf8');
      const doc = JSON.parse(docContent);
      
      const deployer = new SmartFramesDeploy('test');
      await deployer.testDeployedUrls(doc);
      
    } else if (command === '--clean') {
      // Limpar projeto
      const projectName = args[1] || 'temp';
      
      const deployer = new SmartFramesDeploy(projectName);
      await deployer.cleanProject();
      
    } else {
      // Deploy completo
      const docPath = args[0];
      const projectName = args[1] || `newsroom-${Date.now()}`;
      
      if (!docPath) throw new Error('Especifique o documento JSON');
      
      // Verificar se arquivo existe
      await fs.access(docPath);
      
      const deployer = new SmartFramesDeploy(projectName);
      const result = await deployer.deployComplete(docPath);
      
      // Testar URLs deployadas
      console.log('\n🧪 Testando URLs deployadas...');
      const docContent = await fs.readFile(docPath, 'utf8');
      const doc = JSON.parse(docContent);
      await deployer.testDeployedUrls(doc);
      
      console.log(`\n🎉 Deploy completo finalizado!`);
      console.log(`📄 Documento: ${result.documentUrl}`);
      console.log(`🌐 Base URL: ${result.baseUrl}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}