#!/usr/bin/env node

// workflow-integrado.js - Integração completa com fetch-docs.js
import { VideoScrollyProcessor } from './process-videoscrolly.js';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class IntegratedWorkflow {
  constructor() {
    this.dataDir = path.join(__dirname, '../static/data');
  }

  /**
   * Workflow completo: Google Docs → JSON → VideoScrolly → Atualização
   */
  async runCompleteWorkflow(docId, projectName = 'newsroom-videoscrolly') {
    console.log('🚀 WORKFLOW INTEGRADO - NEWSROOM SYSTEM');
    console.log('='.repeat(60));
    console.log(`📄 Google Docs ID: ${docId}`);
    console.log(`🏷️ Projeto: ${projectName}`);
    console.log('='.repeat(60));

    try {
      // 1. Buscar documento do Google Docs
      console.log('\n📥 1. Buscando documento do Google Docs...');
      const docSlug = await this.fetchGoogleDoc(docId);
      
      // 2. Verificar se tem componentes VideoScrollytelling
      console.log('\n🔍 2. Analisando componentes VideoScrollytelling...');
      const hasVideoScrolly = await this.checkForVideoScrolly(docSlug);
      
      if (!hasVideoScrolly) {
        console.log('   ℹ️ Nenhum componente VideoScrollytelling encontrado');
        console.log('   📄 Documento salvo sem processamento de vídeo');
        return { docSlug, videoProcessed: false };
      }
      
      // 3. Processar vídeos e gerar frames
      console.log('\n🎬 3. Processando vídeos...');
      const processor = new VideoScrollyProcessor(projectName);
      const videoConfig = await processor.processSpecificDoc(docSlug);
      
      // 4. Validar resultado final
      console.log('\n✅ 4. Validando resultado...');
      await this.validateResult(docSlug);
      
      console.log('\n🎉 WORKFLOW CONCLUÍDO COM SUCESSO!');
      console.log('='.repeat(60));
      console.log(`📄 Documento: static/data/${docSlug}.json`);
      console.log(`🎬 VideoScrolly: Configurado e pronto`);
      console.log(`🌐 CDN: Frames upados e disponíveis`);
      console.log('='.repeat(60));
      
      return {
        docSlug,
        docPath: `static/data/${docSlug}.json`,
        videoProcessed: true,
        config: videoConfig.config
      };

    } catch (error) {
      console.error('\n❌ ERRO NO WORKFLOW:', error.message);
      throw error;
    }
  }

  /**
   * Buscar documento do Google Docs usando o fetch-docs.js existente
   */
  async fetchGoogleDoc(docId) {
    try {
      console.log(`   📥 Executando: npm run fetch ${docId}`);
      
      // Executar o fetch-docs.js existente
      const output = execSync(`npm run fetch ${docId}`, { 
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Extrair o slug do output
      const slugMatch = output.match(/🔗 Slug: ([\w-]+)/);
      const titleMatch = output.match(/📝 Título: (.+)/);
      
      if (!slugMatch) {
        throw new Error('Não foi possível determinar o slug do documento');
      }
      
      const slug = slugMatch[1];
      const title = titleMatch ? titleMatch[1] : 'Documento';
      
      console.log(`   ✅ Documento baixado: ${title}`);
      console.log(`   🔗 Slug: ${slug}`);
      
      return slug;
      
    } catch (error) {
      if (error.message.includes('Documento não encontrado')) {
        throw new Error('Documento do Google Docs não encontrado. Verifique se está público.');
      }
      throw new Error(`Erro ao buscar documento: ${error.message}`);
    }
  }

  /**
   * Verificar se o documento tem componentes VideoScrollytelling
   */
  async checkForVideoScrolly(docSlug) {
    try {
      const docPath = path.join(this.dataDir, `${docSlug}.json`);
      const docContent = JSON.parse(await fs.readFile(docPath, 'utf8'));
      
      if (!docContent.paragraphs) {
        return false;
      }
      
      const videoScrollyComponents = docContent.paragraphs.filter(p => 
        ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
      );
      
      if (videoScrollyComponents.length > 0) {
        console.log(`   🎬 Encontrados ${videoScrollyComponents.length} componente(s) VideoScrollytelling`);
        
        // Mostrar detalhes dos componentes
        videoScrollyComponents.forEach((comp, index) => {
          console.log(`   ${index + 1}. Tipo: ${comp.type}`);
          console.log(`      videoSrc: ${comp.videoSrc ? '✅' : '❌'}`);
          console.log(`      videoSrcMobile: ${comp.videoSrcMobile ? '✅' : '❌'}`);
          console.log(`      imagePrefix: ${comp.imagePrefix ? '✅' : '❌'}`);
        });
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      throw new Error(`Erro ao analisar documento: ${error.message}`);
    }
  }

  /**
   * Validar resultado final
   */
  async validateResult(docSlug) {
    try {
      const docPath = path.join(this.dataDir, `${docSlug}.json`);
      const docContent = JSON.parse(await fs.readFile(docPath, 'utf8'));
      
      const videoScrollyComponents = docContent.paragraphs?.filter(p => 
        ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
      ) || [];
      
      let allValid = true;
      
      for (const comp of videoScrollyComponents) {
        const isValid = comp.imagePrefix && comp.imagePrefixMobile && comp.totalFrames;
        
        if (!isValid) {
          console.log(`   ❌ Componente inválido: faltando imagePrefix, imagePrefixMobile ou totalFrames`);
          allValid = false;
        } else {
          console.log(`   ✅ Componente válido: ${comp.totalFrames} frames configurados`);
        }
      }
      
      if (!allValid) {
        throw new Error('Alguns componentes VideoScrollytelling não foram configurados corretamente');
      }
      
    } catch (error) {
      throw new Error(`Erro na validação: ${error.message}`);
    }
  }

  /**
   * Workflow apenas para vídeos (sem buscar do Google Docs)
   */
  async processVideosOnly(projectName = 'newsroom-videoscrolly') {
    console.log('🎬 PROCESSAMENTO APENAS DE VÍDEOS');
    console.log('='.repeat(60));
    
    try {
      const processor = new VideoScrollyProcessor(projectName);
      const config = await processor.processVideos();
      
      console.log('\n🎉 VÍDEOS PROCESSADOS COM SUCESSO!');
      console.log('='.repeat(60));
      
      return config;
      
    } catch (error) {
      console.error('\n❌ ERRO NO PROCESSAMENTO:', error.message);
      throw error;
    }
  }

  /**
   * Atualizar documento existente com nova configuração de vídeo
   */
  async updateExistingDoc(docSlug, projectName = 'newsroom-videoscrolly') {
    console.log(`🔄 ATUALIZANDO DOCUMENTO EXISTENTE: ${docSlug}`);
    console.log('='.repeat(60));
    
    try {
      const processor = new VideoScrollyProcessor(projectName);
      const result = await processor.processSpecificDoc(docSlug);
      
      console.log('\n🎉 DOCUMENTO ATUALIZADO COM SUCESSO!');
      console.log('='.repeat(60));
      
      return result;
      
    } catch (error) {
      console.error('\n❌ ERRO NA ATUALIZAÇÃO:', error.message);
      throw error;
    }
  }

  /**
   * Listar documentos com VideoScrollytelling
   */
  async listVideoScrollyDocs() {
    console.log('📋 DOCUMENTOS COM VIDEOSCROLLYTELLING');
    console.log('='.repeat(60));
    
    try {
      const files = await fs.readdir(this.dataDir);
      const videoScrollyDocs = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.dataDir, file);
          const docContent = JSON.parse(await fs.readFile(filePath, 'utf8'));
          
          const videoScrollyComponents = docContent.paragraphs?.filter(p => 
            ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
          ) || [];
          
          if (videoScrollyComponents.length > 0) {
            const slug = path.parse(file).name;
            videoScrollyDocs.push({
              slug,
              title: docContent.title || 'Sem título',
              components: videoScrollyComponents.length,
              configured: videoScrollyComponents.every(c => c.imagePrefix && c.imagePrefixMobile)
            });
          }
        }
      }
      
      if (videoScrollyDocs.length === 0) {
        console.log('   📄 Nenhum documento com VideoScrollytelling encontrado');
      } else {
        videoScrollyDocs.forEach((doc, index) => {
          const status = doc.configured ? '✅' : '⚠️';
          console.log(`   ${status} ${index + 1}. ${doc.title}`);
          console.log(`      Slug: ${doc.slug}`);
          console.log(`      Componentes: ${doc.components}`);
          console.log(`      Configurado: ${doc.configured ? 'Sim' : 'Não'}`);
          console.log('');
        });
      }
      
      return videoScrollyDocs;
      
    } catch (error) {
      console.error('❌ Erro ao listar documentos:', error.message);
      throw error;
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 Workflow Integrado - Newsroom System

Integra fetch-docs.js + VideoScrolly + StoryRenderer

Uso:
  node workflow-integrado.js <DOC_ID>                    # Workflow completo
  node workflow-integrado.js --videos-only [projeto]     # Só processar vídeos
  node workflow-integrado.js --update <slug> [projeto]   # Atualizar doc existente
  node workflow-integrado.js --list                      # Listar docs com VideoScrolly

Exemplos:
  node workflow-integrado.js 1BvAp5gzlKjX...             # Buscar do Google Docs e processar
  node workflow-integrado.js --videos-only eleicoes-2024 # Só processar vídeos
  node workflow-integrado.js --update minha-historia     # Atualizar doc existente
  node workflow-integrado.js --list                      # Ver todos os docs

Vídeos processados:
- Desktop: /Users/guilhermegomes/dev/newsroom-system/static/videos/videoscrolly_1_main.mp4
- Mobile: /Users/guilhermegomes/dev/newsroom-system/static/videos/videoscrolly_1_mobile.mp4

O script irá:
1. 📥 Buscar documento do Google Docs (fetch-docs.js)
2. 🔍 Verificar componentes VideoScrollytelling
3. 🎬 Processar vídeos → frames → CDN
4. ⚙️ Atualizar JSON com configuração completa
5. ✅ Validar resultado final
    `);
    process.exit(1);
  }

  const workflow = new IntegratedWorkflow();

  try {
    if (args[0] === '--videos-only') {
      const projectName = args[1] || 'newsroom-videoscrolly';
      await workflow.processVideosOnly(projectName);
      
    } else if (args[0] === '--update') {
      const docSlug = args[1];
      const projectName = args[2] || 'newsroom-videoscrolly';
      
      if (!docSlug) {
        throw new Error('Especifique o slug do documento para atualizar');
      }
      
      await workflow.updateExistingDoc(docSlug, projectName);
      
    } else if (args[0] === '--list') {
      await workflow.listVideoScrollyDocs();
      
    } else {
      // Workflow completo
      const docId = args[0];
      const projectName = args[1] || 'newsroom-videoscrolly';
      
      if (!docId) {
        throw new Error('Especifique o ID do documento do Google Docs');
      }
      
      const result = await workflow.runCompleteWorkflow(docId, projectName);
      
      console.log('\n📋 PRÓXIMOS PASSOS:');
      console.log(`1. Verificar: static/data/${result.docSlug}.json`);
      console.log('2. Executar: npm run dev');
      console.log(`3. Acessar: http://localhost:5173/${result.docSlug}`);
      console.log('4. Testar ScrollyTelling no desktop e mobile');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { IntegratedWorkflow };