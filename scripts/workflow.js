#!/usr/bin/env node

// scripts/workflow.js
// SCRIPT MAESTRO - Orquestra todo o workflow

import PROJECT_CONFIG from '../project.config.js';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

class ProjectWorkflow {
  constructor() {
    this.config = PROJECT_CONFIG;
  }

  /**
   * Executar comando e mostrar output
   */
  exec(command, silent = false) {
    if (!silent) console.log(`\n⚡ Executando: ${command}`);
    try {
      execSync(command, { 
        stdio: silent ? 'pipe' : 'inherit',
        cwd: rootDir 
      });
      return true;
    } catch (error) {
      if (!silent) console.error(`❌ Falha: ${error.message}`);
      return false;
    }
  }

  /**
   * 1. CONFIGURAR PROJETO
   */
  async setup() {
    console.log('\n🔧 CONFIGURAÇÃO DO PROJETO');
    console.log('=' .repeat(60));
    
    // Validar configuração
    if (!this.config.validate()) {
      console.error('\n❌ Corrija a configuração em project.config.js');
      process.exit(1);
    }
    
    this.config.print();
    
    // Criar estrutura de pastas
    const dirs = [
      'static/videos',
      'static/img/frames/desktop',
      'static/img/frames/mobile',
      'static/data'
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(path.join(rootDir, dir), { recursive: true });
    }
    
    console.log('\n✅ Estrutura de pastas criada');
    return true;
  }

  /**
   * 2. PROCESSAR VÍDEOS
   */
  async processVideos() {
    console.log('\n🎬 PROCESSAMENTO DE VÍDEOS');
    console.log('=' .repeat(60));
    
    // Verificar se existem vídeos
    const videosDir = path.join(rootDir, 'static/videos');
    const files = await fs.readdir(videosDir).catch(() => []);
    
    if (files.length === 0) {
      console.log('⚠️  Nenhum vídeo encontrado em static/videos/');
      console.log('   Adicione vídeos com nomes como: intro_desktop.mp4 e intro_mobile.mp4');
      return false;
    }
    
    // Processar todos os vídeos
    const fps = this.config.frames.fps;
    const quality = this.config.frames.quality;
    
    console.log(`⚙️  Configuração: ${fps} FPS, ${quality}% qualidade`);
    
    const success = this.exec(
      `node scripts/extract-frames.js --process-all --fps ${fps} --quality ${quality}`
    );
    
    return success;
  }

  /**
   * 3. FAZER UPLOAD DOS FRAMES
   */
  async uploadFrames() {
    console.log('\n☁️  UPLOAD DE FRAMES PARA O VAULT');
    console.log('=' .repeat(60));
    
    const framesBase = path.join(rootDir, 'static/img/frames');
    
    try {
      // Listar pastas de frames
      const desktopDirs = await fs.readdir(path.join(framesBase, 'desktop')).catch(() => []);
      const mobileDirs = await fs.readdir(path.join(framesBase, 'mobile')).catch(() => []);
      
      if (desktopDirs.length === 0 && mobileDirs.length === 0) {
        console.log('⚠️  Nenhum frame encontrado para upload');
        return false;
      }
      
      console.log(`📦 Encontrados: ${desktopDirs.length} vídeos para upload`);
      
      // Upload de cada vídeo
      for (const videoName of desktopDirs) {
        console.log(`\n📤 Uploading: ${videoName}`);
        
        // Desktop
        if (desktopDirs.includes(videoName)) {
          console.log('   🖥️  Desktop...');
          this.exec(
            `node scripts/upload-globo-storage.js --frames static/img/frames/desktop/${videoName} ${videoName}_desktop ${this.config.projectName}`,
            true
          );
        }
        
        // Mobile
        if (mobileDirs.includes(videoName)) {
          console.log('   📱 Mobile...');
          this.exec(
            `node scripts/upload-globo-storage.js --frames static/img/frames/mobile/${videoName} ${videoName}_mobile ${this.config.projectName}`,
            true
          );
        }
      }
      
      console.log('\n✅ Upload concluído!');
      return true;
      
    } catch (error) {
      console.error('❌ Erro no upload:', error.message);
      return false;
    }
  }

  /**
   * 4. GERAR CONFIGURAÇÃO PARA GOOGLE DOCS
   */
  async generateDocsConfig() {
    console.log('\n📄 CONFIGURAÇÃO PARA GOOGLE DOCS');
    console.log('=' .repeat(60));
    
    const framesBase = path.join(rootDir, 'static/img/frames');
    const configs = [];
    
    try {
      const desktopDirs = await fs.readdir(path.join(framesBase, 'desktop')).catch(() => []);
      
      for (const videoName of desktopDirs) {
        // Contar frames
        const desktopFrames = await fs.readdir(path.join(framesBase, 'desktop', videoName)).catch(() => []);
        const frameCount = desktopFrames.filter(f => f.endsWith('.jpg')).length;
        
        const config = this.config.getGoogleDocsConfig(videoName, frameCount);
        configs.push({ name: videoName, ...config });
        
        console.log(`\n📹 ${videoName}:`);
        console.log('```');
        console.log('type: videoscrollytelling');
        console.log(`imagePrefix: ${config.imagePrefix}`);
        console.log(`imagePrefixMobile: ${config.imagePrefixMobile}`);
        console.log(`totalFrames: ${config.totalFrames}`);
        console.log('```');
      }
      
      // Salvar configurações em arquivo
      const configPath = path.join(rootDir, 'frames-config.json');
      await fs.writeFile(configPath, JSON.stringify(configs, null, 2));
      console.log(`\n💾 Configurações salvas em: frames-config.json`);
      
      return configs;
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
      return [];
    }
  }

  /**
   * 5. FETCH DO GOOGLE DOCS
   */
  async fetchDocs() {
    console.log('\n📥 FETCH DO GOOGLE DOCS');
    console.log('=' .repeat(60));
    
    if (!this.config.googleDocsId) {
      console.log('⚠️  Google Docs ID não configurado em project.config.js');
      return false;
    }
    
    return this.exec(`node scripts/fetch-docs.js ${this.config.googleDocsId}`);
  }

  /**
   * 6. BUILD
   */
  async build() {
    console.log('\n🔨 BUILD DO PROJETO');
    console.log('=' .repeat(60));
    
    return this.exec('npm run build');
  }

  /**
   * 7. DEPLOY
   */
  async deploy() {
    console.log('\n🚀 DEPLOY PARA O VAULT');
    console.log('=' .repeat(60));
    
    // Usar simple-deploy.js em vez de smart-deploy.js!
    return this.exec(`node scripts/simple-deploy.js ${this.config.projectName}`);
  }

  /**
   * WORKFLOW COMPLETO
   */
  async runComplete() {
    console.log('\n');
    console.log('🚀 WORKFLOW COMPLETO DO PROJETO');
    console.log('=' .repeat(70));
    console.log(`📁 Projeto: ${this.config.projectName}`);
    console.log(`📄 Título: ${this.config.pageTitle}`);
    console.log('=' .repeat(70));
    
    const steps = [
      { name: 'Setup', fn: () => this.setup() },
      { name: 'Processar Vídeos', fn: () => this.processVideos() },
      { name: 'Upload Frames', fn: () => this.uploadFrames() },
      { name: 'Gerar Config', fn: () => this.generateDocsConfig() },
      { name: 'Fetch Docs', fn: () => this.fetchDocs() },
      { name: 'Build', fn: () => this.build() },
      { name: 'Deploy', fn: () => this.deploy() }
    ];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`\n[${i + 1}/${steps.length}] ${step.name}...`);
      
      const success = await step.fn();
      
      if (!success && step.name !== 'Fetch Docs') {
        console.error(`\n❌ Falha em: ${step.name}`);
        process.exit(1);
      }
    }
    
    // Resumo final
    console.log('\n');
    console.log('=' .repeat(70));
    console.log('✅ WORKFLOW CONCLUÍDO COM SUCESSO!');
    console.log('=' .repeat(70));
    
    console.log('\n📋 RESUMO:');
    console.log(`   📁 Projeto: ${this.config.projectName}`);
    console.log(`   🌐 URL: ${this.config.baseProjectUrl}`);
    console.log(`   🎛️ Vault: ${this.config.urls.vault}`);
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Copie as configurações para o Google Docs');
    console.log('   2. Execute: npm run workflow:update');
    console.log('   3. Acesse a página publicada');
    
    console.log('\n🎉 Tudo pronto!');
  }

  /**
   * UPDATE (após atualizar Google Docs)
   */
  async runUpdate() {
    console.log('\n🔄 ATUALIZANDO PROJETO');
    console.log('=' .repeat(60));
    
    await this.fetchDocs();
    await this.build();
    await this.deploy();
    
    console.log('\n✅ Atualização concluída!');
    console.log(`🌐 URL: ${this.config.baseProjectUrl}`);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const workflow = new ProjectWorkflow();
  
  if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
🎯 WORKFLOW MAESTRO - FAZ TUDO!

Comandos:
  node workflow.js              Roda workflow completo
  node workflow.js update        Atualiza (fetch + build + deploy)
  node workflow.js setup         Apenas configuração inicial
  node workflow.js videos        Apenas processar vídeos
  node workflow.js upload        Apenas upload de frames
  node workflow.js config        Gerar config para Google Docs
  node workflow.js deploy        Apenas deploy

Workflow Completo:
  1. Setup (cria pastas)
  2. Processa vídeos (extrai frames)
  3. Upload frames para Vault
  4. Gera configuração para Google Docs
  5. Fetch do Google Docs
  6. Build
  7. Deploy

IMPORTANTE:
  Configure primeiro em project.config.js!
    `);
    process.exit(0);
  }
  
  try {
    if (args[0] === 'update') {
      await workflow.runUpdate();
    } else if (args[0] === 'setup') {
      await workflow.setup();
    } else if (args[0] === 'videos') {
      await workflow.processVideos();
    } else if (args[0] === 'upload') {
      await workflow.uploadFrames();
    } else if (args[0] === 'config') {
      await workflow.generateDocsConfig();
    } else if (args[0] === 'deploy') {
      await workflow.deploy();
    } else if (args[0] === '--help' || args[0] === '-h') {
      // Mostra help e sai
      process.exit(0);
    } else {
      // SEM ARGUMENTOS = RODAR WORKFLOW COMPLETO
      await workflow.runComplete();
    }
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export default ProjectWorkflow;