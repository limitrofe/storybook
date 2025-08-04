// scripts/workflow-videoscrolly.js - Workflow Completo VideoScrollytelling
import { SmartFrameGenerator } from './smart-video-frames.js';
import { SmartFramesDeploy } from './smart-deploy-frames.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Workflow completo do zero ao deploy
 */
export class VideoScrollyWorkflow {
  constructor(projectName = null) {
    this.projectName = projectName || `videoscrolly-${Date.now()}`;
    this.generator = new SmartFrameGenerator();
    this.deployer = new SmartFramesDeploy(this.projectName);
  }

  /**
   * Workflow completo: Gerar → Deploy → Configurar
   */
  async runComplete(docPath) {
    console.log('🚀 WORKFLOW COMPLETO VIDEOSCROLLYTELLING');
    console.log('=' .repeat(60));
    console.log(`📁 Projeto: ${this.projectName}`);
    console.log(`📄 Documento: ${docPath}`);
    console.log('=' .repeat(60));

    try {
      // Etapa 1: Gerar frames localmente
      console.log('\n🎬 ETAPA 1: GERANDO FRAMES');
      console.log('-'.repeat(40));
      
      const generationResults = await this.generator.processDocument(docPath);
      
      if (generationResults.length === 0) {
        throw new Error('❌ Nenhum VideoScrollytelling encontrado ou processado');
      }
      
      console.log(`✅ Gerados frames para ${generationResults.length} componentes`);
      
      // Etapa 2: Deploy para Vault
      console.log('\n📤 ETAPA 2: DEPLOY PARA VAULT');
      console.log('-'.repeat(40));
      
      const deployResults = await this.deployer.deployComplete(docPath);
      
      // Etapa 3: Validação
      console.log('\n🔍 ETAPA 3: VALIDAÇÃO');
      console.log('-'.repeat(40));
      
      const validationResults = await this.validateDeployment(docPath);
      
      // Etapa 4: Configuração final
      console.log('\n⚙️ ETAPA 4: CONFIGURAÇÃO FINAL');
      console.log('-'.repeat(40));
      
      const configResults = await this.generateFinalConfig(docPath, deployResults);
      
      // Relatório final
      this.printFinalReport({
        generation: generationResults,
        deployment: deployResults,
        validation: validationResults,
        config: configResults
      });
      
      return {
        success: true,
        projectName: this.projectName,
        results: {
          generation: generationResults,
          deployment: deployResults,
          validation: validationResults,
          config: configResults
        }
      };
      
    } catch (error) {
      console.error(`\n💥 ERRO NO WORKFLOW: ${error.message}`);
      throw error;
    }
  }

  /**
   * Workflow rápido: apenas o essencial
   */
  async runQuick(docPath) {
    console.log('⚡ WORKFLOW RÁPIDO VIDEOSCROLLYTELLING');
    console.log('=' .repeat(50));
    
    try {
      // Gerar frames
      console.log('🎬 Gerando frames...');
      const generationResults = await this.generator.processDocument(docPath);
      
      if (generationResults.length === 0) {
        throw new Error('❌ Nenhum VideoScrollytelling encontrado');
      }
      
      // Deploy frames
      console.log('📤 Fazendo deploy...');
      const deployResults = await this.deployer.deployComplete(docPath);
      
      // Configuração rápida
      const quickConfig = await this.generateQuickConfig(docPath);
      
      console.log('\n⚡ WORKFLOW RÁPIDO CONCLUÍDO!');
      console.log(`🌐 Base URL: ${deployResults.baseUrl}`);
      
      return {
        success: true,
        projectName: this.projectName,
        baseUrl: deployResults.baseUrl,
        config: quickConfig
      };
      
    } catch (error) {
      console.error(`💥 ERRO: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validar deployment
   */
  async validateDeployment(docPath) {
    console.log('🔍 Validando deployment...');
    
    const docContent = await fs.readFile(docPath, 'utf8');
    const doc = JSON.parse(docContent);
    
    const videoScrollyComponents = doc.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    const validationResults = [];
    
    for (let i = 0; i < videoScrollyComponents.length; i++) {
      const component = videoScrollyComponents[i];
      
      console.log(`  🧪 Validando VideoScrolly ${i + 1}...`);
      
      const validation = {
        componentIndex: i,
        hasImagePrefix: !!component.imagePrefix,
        hasImagePrefixMobile: !!component.imagePrefixMobile,
        hasTotalFrames: !!component.totalFrames,
        hasFallbackFrames: !!(component.fallbackFrames && component.fallbackFrames.length > 0),
        urlTests: []
      };
      
      // Testar URLs se existirem
      if (component.imagePrefix && component.totalFrames > 0) {
        const testUrl = `${component.imagePrefix}0001.jpg`;
        const testResult = await this.testUrl(testUrl);
        validation.urlTests.push({
          type: 'desktop',
          url: testUrl,
          accessible: testResult
        });
      }
      
      if (component.imagePrefixMobile && component.totalFrames > 0) {
        const testUrl = `${component.imagePrefixMobile}0001.webp`;
        const testResult = await this.testUrl(testUrl);
        validation.urlTests.push({
          type: 'mobile',
          url: testUrl,
          accessible: testResult
        });
      }
      
      // Calcular score de validação
      validation.score = 0;
      if (validation.hasImagePrefix) validation.score += 25;
      if (validation.hasImagePrefixMobile) validation.score += 25;
      if (validation.hasTotalFrames) validation.score += 25;
      if (validation.urlTests.some(test => test.accessible)) validation.score += 25;
      
      validation.status = validation.score >= 75 ? 'OK' : validation.score >= 50 ? 'AVISO' : 'ERRO';
      
      const statusIcon = validation.status === 'OK' ? '✅' : validation.status === 'AVISO' ? '⚠️' : '❌';
      console.log(`    ${statusIcon} Score: ${validation.score}% (${validation.status})`);
      
      validationResults.push(validation);
    }
    
    const overallScore = Math.round(
      validationResults.reduce((sum, v) => sum + v.score, 0) / validationResults.length
    );
    
    console.log(`  📊 Score geral: ${overallScore}%`);
    
    return {
      overallScore,
      components: validationResults,
      success: overallScore >= 75
    };
  }

  /**
   * Testar se URL está acessível
   */
  async testUrl(url) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url, { 
        method: 'HEAD', 
        timeout: 5000 
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gerar configuração final completa
   */
  async generateFinalConfig(docPath, deployResults) {
    console.log('⚙️ Gerando configuração final...');
    
    const docContent = await fs.readFile(docPath, 'utf8');
    const doc = JSON.parse(docContent);
    
    const videoScrollyComponents = doc.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    const configs = [];
    
    videoScrollyComponents.forEach((component, index) => {
      const config = {
        componentIndex: index,
        googleDocsConfig: {
          type: 'videoscrollytelling',
          imagePrefix: component.imagePrefix,
          imagePrefixMobile: component.imagePrefixMobile,
          totalFrames: component.totalFrames,
          showProgress: 'true',
          showTime: 'true',
          height: component.height || '400vh'
        },
        technicalInfo: {
          project: this.projectName,
          baseUrl: deployResults.baseUrl,
          desktopPattern: `${component.imagePrefix}XXXX.jpg`,
          mobilePattern: `${component.imagePrefixMobile}XXXX.webp`,
          vaultUrl: `https://vault.globoi.com/p/especiais_svelte/storage/objects/g1/${this.projectName}/video-frames/`
        }
      };
      
      configs.push(config);
    });
    
    // Salvar configuração em arquivo
    const configFile = `videoscrolly-config-${this.projectName}.json`;
    await fs.writeFile(configFile, JSON.stringify({
      project: this.projectName,
      generatedAt: new Date().toISOString(),
      components: configs
    }, null, 2));
    
    console.log(`  📄 Configuração salva: ${configFile}`);
    
    return configs;
  }

  /**
   * Gerar configuração rápida
   */
  async generateQuickConfig(docPath) {
    const docContent = await fs.readFile(docPath, 'utf8');
    const doc = JSON.parse(docContent);
    
    const videoScrollyComponents = doc.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    return videoScrollyComponents.map((component, index) => ({
      componentIndex: index,
      imagePrefix: component.imagePrefix,
      imagePrefixMobile: component.imagePrefixMobile,
      totalFrames: component.totalFrames
    }));
  }

  /**
   * Relatório final detalhado
   */
  printFinalReport(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL - VIDEOSCROLLYTELLING WORKFLOW');
    console.log('='.repeat(80));
    
    console.log(`🚀 Projeto: ${this.projectName}`);
    console.log(`⏰ Concluído em: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`🌐 Base URL: ${results.deployment.baseUrl}`);
    
    console.log('\n📈 ESTATÍSTICAS:');
    console.log(`   🎬 Componentes processados: ${results.generation.length}`);
    console.log(`   📤 Frames desktop (JPG): ${results.deployment.frameResults.desktop.length}`);
    console.log(`   📤 Frames mobile (WebP): ${results.deployment.frameResults.mobile.length}`);
    console.log(`   ❌ Erros no upload: ${results.deployment.frameResults.errors.length}`);
    console.log(`   🔍 Score validação: ${results.validation.overallScore}%`);
    
    console.log('\n📋 CONFIGURAÇÃO PARA GOOGLE DOCS:');
    results.config.forEach((config, index) => {
      console.log(`\nVideoScrolly ${index + 1}:`);
      console.log(`   type: videoscrollytelling`);
      console.log(`   imagePrefix: ${config.googleDocsConfig.imagePrefix}`);
      console.log(`   imagePrefixMobile: ${config.googleDocsConfig.imagePrefixMobile}`);
      console.log(`   totalFrames: ${config.googleDocsConfig.totalFrames}`);
      console.log(`   showProgress: true`);
      console.log(`   showTime: true`);
      console.log(`   height: ${config.googleDocsConfig.height}`);
    });
    
    console.log('\n🎛️ LINKS ÚTEIS:');
    console.log(`   📁 Vault: https://vault.globoi.com/p/especiais_svelte/storage/objects/g1/${this.projectName}/`);
    console.log(`   📄 Documento: ${results.deployment.documentUrl}`);
    
    const successIcon = results.validation.success ? '🎉' : '⚠️';
    const successText = results.validation.success ? 'SUCESSO TOTAL' : 'CONCLUÍDO COM AVISOS';
    
    console.log(`\n${successIcon} STATUS: ${successText}`);
    console.log('='.repeat(80));
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎬 Workflow Completo VideoScrollytelling

Automatiza todo o processo:
1. Gera frames JPG (desktop) + WebP (mobile)
2. Upload organizando em pastas corretas
3. Atualiza JSON com URLs públicas
4. Valida deployment
5. Gera configuração para Google Docs

Uso:
  node workflow-videoscrolly.js <documento.json> [projeto]        # Workflow completo
  node workflow-videoscrolly.js --quick <documento.json> [projeto]  # Workflow rápido
  node workflow-videoscrolly.js --validate <documento.json>        # Apenas validar

Exemplos:
  node workflow-videoscrolly.js story.json meu-projeto-2024
  node workflow-videoscrolly.js --quick story.json 
  node workflow-videoscrolly.js --validate story.json

O workflow resolve automaticamente:
✅ Frames em formatos otimizados (JPG + WebP)
✅ Upload para estrutura correta do Vault
✅ Configuração automática do imagePrefix/imagePrefixMobile
✅ Validação de URLs públicas
✅ Configuração pronta para Google Docs
    `);
    process.exit(1);
  }
  
  try {
    const command = args[0];
    
    if (command === '--quick') {
      // Workflow rápido
      const docPath = args[1];
      const projectName = args[2] || null;
      
      if (!docPath) throw new Error('Especifique o documento JSON');
      await fs.access(docPath);
      
      const workflow = new VideoScrollyWorkflow(projectName);
      const result = await workflow.runQuick(docPath);
      
      console.log('\n📋 CONFIGURAÇÃO RÁPIDA:');
      result.config.forEach((config, index) => {
        console.log(`\nVideoScrolly ${index + 1}:`);
        console.log(`imagePrefix: ${config.imagePrefix}`);
        console.log(`imagePrefixMobile: ${config.imagePrefixMobile}`);
        console.log(`totalFrames: ${config.totalFrames}`);
      });
      
    } else if (command === '--validate') {
      // Apenas validar
      const docPath = args[1];
      
      if (!docPath) throw new Error('Especifique o documento JSON');
      await fs.access(docPath);
      
      const workflow = new VideoScrollyWorkflow();
      const validationResults = await workflow.validateDeployment(docPath);
      
      console.log('\n📊 RESULTADO DA VALIDAÇÃO:');
      console.log(`Score geral: ${validationResults.overallScore}%`);
      console.log(`Status: ${validationResults.success ? '✅ OK' : '❌ Problemas detectados'}`);
      
    } else {
      // Workflow completo
      const docPath = args[0];
      const projectName = args[1] || null;
      
      if (!docPath) throw new Error('Especifique o documento JSON');
      await fs.access(docPath);
      
      const workflow = new VideoScrollyWorkflow(projectName);
      const result = await workflow.runComplete(docPath);
      
      if (result.success) {
        console.log('\n🎉 WORKFLOW CONCLUÍDO COM SUCESSO!');
        console.log(`📁 Projeto: ${result.projectName}`);
      }
    }
    
  } catch (error) {
    console.error('💥 ERRO NO WORKFLOW:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}