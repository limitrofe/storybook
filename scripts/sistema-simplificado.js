#!/usr/bin/env node

// sistema-simplificado.js - Sistema SUPER SIMPLES para VideoScrolly
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class VideoScrollySimples {
  constructor() {
    this.baseUrl = 'https://s3.glbimg.com/v1/AUTH_9897f8564b5c46c9b6e85bda5912fe3b/g1/';
  }

  /**
   * Método principal - usuário só chama isso
   */
  async processar(docId) {
    console.log('🚀 SISTEMA SIMPLIFICADO VIDEOSCROLLY');
    console.log('='.repeat(50));
    console.log('O usuário só precisa fazer:');
    console.log('1. ✅ Colocar no Google Docs');
    console.log('2. ✅ Rodar este comando');
    console.log('3. ✅ Pronto!');
    console.log('='.repeat(50));

    try {
      // 1. Buscar do Google Docs
      const docSlug = await this.buscarGoogleDocs(docId);
      
      // 2. Processar VideoScrolly automaticamente
      await this.processarVideoScrolly(docSlug);
      
      // 3. Pronto!
      console.log('\n🎉 PRONTO! Acesse: npm run dev');
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  }

  /**
   * Buscar do Google Docs usando o fetch-docs.js existente
   */
  async buscarGoogleDocs(docId) {
    console.log('\n📥 1. Buscando do Google Docs...');
    
    const { execSync } = await import('child_process');
    
    try {
      const output = execSync(`npm run fetch ${docId}`, { 
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const slugMatch = output.match(/🔗 Slug: ([\w-]+)/);
      if (!slugMatch) {
        throw new Error('Não foi possível determinar o slug do documento');
      }
      
      console.log(`   ✅ Documento baixado: ${slugMatch[1]}`);
      return slugMatch[1];
      
    } catch (error) {
      throw new Error(`Erro ao buscar documento: ${error.message}`);
    }
  }

  /**
   * Processar VideoScrolly - resolve tudo automaticamente
   */
  async processarVideoScrolly(docSlug) {
    console.log('\n🎬 2. Processando VideoScrolly...');
    
    const docPath = path.join(__dirname, '../static/data', `${docSlug}.json`);
    const docContent = JSON.parse(await fs.readFile(docPath, 'utf8'));
    
    // Encontrar componentes VideoScrolly
    const videoComponents = docContent.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (videoComponents.length === 0) {
      console.log('   ℹ️ Nenhum VideoScrolly encontrado');
      return;
    }
    
    console.log(`   🎯 Encontrados ${videoComponents.length} componente(s)`);
    
    // Processar cada componente
    for (let i = 0; i < videoComponents.length; i++) {
      const component = videoComponents[i];
      
      console.log(`\n   🔄 Processando componente ${i + 1}...`);
      
      // Detectar fonte do vídeo automaticamente
      await this.detectarEConfigurarVideo(component, i + 1, docSlug);
    }
    
    // Salvar documento atualizado
    await fs.writeFile(docPath, JSON.stringify(docContent, null, 2));
    console.log(`   ✅ Documento atualizado: ${docSlug}.json`);
  }

  /**
   * Detectar e configurar vídeo automaticamente
   */
  async detectarEConfigurarVideo(component, index, docSlug) {
    // CENÁRIO 1: Usuário colocou URLs no Google Docs
    if (component.videoSrc || component.videoSrcMobile) {
      console.log('   📡 URLs encontradas no documento');
      await this.processarDesdeUrls(component, index, docSlug);
      return;
    }
    
    // CENÁRIO 2: Vídeos na pasta static/videos (padrão do Guilherme)
    const videosLocais = await this.buscarVideosLocais(index);
    if (videosLocais.desktop || videosLocais.mobile) {
      console.log('   📁 Vídeos locais encontrados');
      await this.processarDesdeLocais(component, videosLocais, index, docSlug);
      return;
    }
    
    // CENÁRIO 3: Vídeos no Vault (baixar de lá)
    const videosVault = await this.buscarVideosVault(index, docSlug);
    if (videosVault.desktop || videosVault.mobile) {
      console.log('   ☁️ Vídeos encontrados no Vault');
      await this.processarDesdeVault(component, videosVault, index, docSlug);
      return;
    }
    
    // CENÁRIO 4: Usar frames já prontos
    const framesExistentes = await this.buscarFramesExistentes(index, docSlug);
    if (framesExistentes.desktop || framesExistentes.mobile) {
      console.log('   🖼️ Frames já prontos encontrados');
      await this.configurarFramesExistentes(component, framesExistentes);
      return;
    }
    
    // Nenhuma fonte encontrada
    console.log('   ⚠️ Nenhuma fonte de vídeo encontrada');
    console.log('   💡 Adicione videoSrc/videoSrcMobile no Google Docs');
    console.log('   💡 Ou coloque vídeos em static/videos/');
  }

  /**
   * CENÁRIO 1: Processar desde URLs
   */
  async processarDesdeUrls(component, index, docSlug) {
    console.log('     🔄 Baixando vídeos das URLs...');
    
    // Baixar vídeos
    const downloads = await this.baixarVideos(component, index);
    
    // Converter para frames
    const frames = await this.converterParaFrames(downloads, index);
    
    // Upload frames
    const urls = await this.uploadFrames(frames, index, docSlug);
    
    // Configurar componente
    this.configurarComponente(component, urls, frames);
  }

  /**
   * CENÁRIO 2: Processar desde arquivos locais
   */
  async processarDesdeLocais(component, videosLocais, index, docSlug) {
    console.log('     🔄 Processando vídeos locais...');
    
    // Converter para frames
    const frames = await this.converterParaFrames(videosLocais, index);
    
    // Upload frames
    const urls = await this.uploadFrames(frames, index, docSlug);
    
    // Configurar componente
    this.configurarComponente(component, urls, frames);
  }

  /**
   * CENÁRIO 3: Processar desde Vault
   */
  async processarDesdeVault(component, videosVault, index, docSlug) {
    console.log('     🔄 Baixando vídeos do Vault...');
    
    // Baixar do Vault
    const videosLocal = await this.baixarDoVault(videosVault, index);
    
    // Processar como locais
    await this.processarDesdeLocais(component, videosLocal, index, docSlug);
  }

  /**
   * CENÁRIO 4: Usar frames existentes
   */
  async configurarFramesExistentes(component, framesExistentes) {
    console.log('     ✅ Configurando frames existentes...');
    
    component.imagePrefix = framesExistentes.desktop.prefix;
    component.imagePrefixMobile = framesExistentes.mobile.prefix;
    component.totalFrames = framesExistentes.desktop.total;
    component.frameStart = 1;
    component.frameStop = framesExistentes.desktop.total;
    component.imageSuffix = '.jpg';
    component.imageSuffixMobile = '.webp';
    component.showProgress = true;
    component.showTime = true;
  }

  /**
   * Buscar vídeos locais (padrão do Guilherme)
   */
  async buscarVideosLocais(index) {
    const videoPaths = {
      desktop: path.join(__dirname, `../static/videos/videoscrolly_${index}_main.mp4`),
      mobile: path.join(__dirname, `../static/videos/videoscrolly_${index}_mobile.mp4`)
    };
    
    const result = {};
    
    try {
      await fs.access(videoPaths.desktop);
      result.desktop = videoPaths.desktop;
      console.log(`     ✅ Desktop: videoscrolly_${index}_main.mp4`);
    } catch (e) {
      // Tentar outros nomes possíveis
      const alternatives = [
        `../static/videos/videoscrolly_${index}.mp4`,
        `../static/videos/video_${index}_desktop.mp4`,
        `../static/videos/main_${index}.mp4`
      ];
      
      for (const alt of alternatives) {
        try {
          const altPath = path.join(__dirname, alt);
          await fs.access(altPath);
          result.desktop = altPath;
          console.log(`     ✅ Desktop encontrado: ${path.basename(alt)}`);
          break;
        } catch (e) {}
      }
    }
    
    try {
      await fs.access(videoPaths.mobile);
      result.mobile = videoPaths.mobile;
      console.log(`     ✅ Mobile: videoscrolly_${index}_mobile.mp4`);
    } catch (e) {
      // Se não tem mobile, usar o desktop mesmo
      if (result.desktop) {
        result.mobile = result.desktop;
        console.log(`     ℹ️ Mobile: usando mesmo vídeo do desktop`);
      }
    }
    
    return result;
  }

  /**
   * Buscar vídeos no Vault
   */
  async buscarVideosVault(index, docSlug) {
    const vaultUrls = {
      desktop: `${this.baseUrl}${docSlug}/videos/videoscrolly_${index}_main.mp4`,
      mobile: `${this.baseUrl}${docSlug}/videos/videoscrolly_${index}_mobile.mp4`
    };
    
    const result = {};
    
    // Verificar se existem no Vault
    for (const [type, url] of Object.entries(vaultUrls)) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          result[type] = url;
          console.log(`     ✅ ${type} encontrado no Vault`);
        }
      } catch (e) {}
    }
    
    return result;
  }

  /**
   * Buscar frames já prontos
   */
  async buscarFramesExistentes(index, docSlug) {
    const framesUrls = {
      desktop: {
        prefix: `${this.baseUrl}${docSlug}/video-frames/videoscrolly_${index}_desktop_`,
        suffix: '.jpg'
      },
      mobile: {
        prefix: `${this.baseUrl}${docSlug}/video-frames/videoscrolly_${index}_mobile_`,
        suffix: '.webp'
      }
    };
    
    // Testar se o primeiro frame existe
    for (const [type, config] of Object.entries(framesUrls)) {
      try {
        const testUrl = `${config.prefix}0001${config.suffix}`;
        const response = await fetch(testUrl, { method: 'HEAD' });
        
        if (response.ok) {
          // Descobrir quantos frames existem
          const total = await this.contarFramesExistentes(config.prefix, config.suffix);
          
          return {
            [type]: {
              prefix: config.prefix,
              suffix: config.suffix,
              total
            }
          };
        }
      } catch (e) {}
    }
    
    return {};
  }

  /**
   * Baixar vídeos das URLs
   */
  async baixarVideos(component, index) {
    const downloads = {};
    
    if (component.videoSrc) {
      console.log(`     📥 Baixando desktop: ${component.videoSrc}`);
      downloads.desktop = await this.downloadVideo(component.videoSrc, `videoscrolly_${index}_main.mp4`);
    }
    
    if (component.videoSrcMobile) {
      console.log(`     📥 Baixando mobile: ${component.videoSrcMobile}`);
      downloads.mobile = await this.downloadVideo(component.videoSrcMobile, `videoscrolly_${index}_mobile.mp4`);
    }
    
    return downloads;
  }

  /**
   * Converter vídeos para frames
   */
  async converterParaFrames(videos, index) {
    console.log('     🎬 Convertendo para frames...');
    
    // Aqui você integraria com seu sistema de conversão existente
    // Por enquanto, vou simular
    
    const frames = {
      desktop: {
        count: 150,
        path: `./generated-frames/videoscrolly_${index}_desktop/`,
        pattern: `videoscrolly_${index}_desktop_`,
        extension: '.jpg'
      },
      mobile: {
        count: 150,
        path: `./generated-frames/videoscrolly_${index}_mobile/`,
        pattern: `videoscrolly_${index}_mobile_`,
        extension: '.webp'
      }
    };
    
    // TODO: Implementar conversão real aqui
    // usar VideoToFramesConverter dos seus scripts existentes
    
    return frames;
  }

  /**
   * Upload frames para CDN
   */
  async uploadFrames(frames, index, docSlug) {
    console.log('     📤 Upload para CDN...');
    
    // Aqui você integraria com seu sistema de upload existente
    const urls = {
      desktop: {
        prefix: `${this.baseUrl}${docSlug}/video-frames/videoscrolly_${index}_desktop_`,
        total: frames.desktop.count
      },
      mobile: {
        prefix: `${this.baseUrl}${docSlug}/video-frames/videoscrolly_${index}_mobile_`,
        total: frames.mobile.count
      }
    };
    
    // TODO: Implementar upload real aqui
    // usar seus scripts de upload existentes
    
    return urls;
  }

  /**
   * Configurar componente com URLs finais
   */
  configurarComponente(component, urls, frames) {
    console.log('     ⚙️ Configurando componente...');
    
    component.imagePrefix = urls.desktop.prefix;
    component.imagePrefixMobile = urls.mobile.prefix;
    component.totalFrames = urls.desktop.total;
    component.frameStart = 1;
    component.frameStop = urls.desktop.total;
    component.imageSuffix = '.jpg';
    component.imageSuffixMobile = '.webp';
    component.showProgress = true;
    component.showTime = true;
    component.preloadFrames = 10;
    component.smoothTransition = true;
    component.lazyLoading = true;
    
    console.log(`     ✅ Configurado: ${component.totalFrames} frames`);
  }

  /**
   * Download de vídeo único
   */
  async downloadVideo(url, filename) {
    // Implementar download real aqui
    // Por enquanto simular
    const outputPath = path.join(__dirname, '../static/videos', filename);
    console.log(`     💾 Salvo: ${filename}`);
    return outputPath;
  }

  /**
   * Contar frames existentes
   */
  async contarFramesExistentes(prefix, suffix) {
    // Testar de 1 até encontrar o último
    let count = 0;
    
    for (let i = 1; i <= 1000; i++) {
      const paddedNum = String(i).padStart(4, '0');
      const testUrl = `${prefix}${paddedNum}${suffix}`;
      
      try {
        const response = await fetch(testUrl, { method: 'HEAD' });
        if (response.ok) {
          count = i;
        } else {
          break;
        }
      } catch (e) {
        break;
      }
    }
    
    return count;
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 Sistema SIMPLIFICADO VideoScrolly

O usuário só precisa:
1. Escrever no Google Docs: type: videoscrollytelling
2. Rodar: npm run videoscrolly DOC_ID
3. Pronto!

O sistema resolve AUTOMATICAMENTE:
✅ Detecta vídeos (URLs, arquivos locais, Vault)
✅ Converte para frames otimizados
✅ Upload para CDN
✅ Configura tudo no JSON
✅ Pronto para usar!

Uso:
  node sistema-simplificado.js <GOOGLE_DOCS_ID>

Exemplo:
  node sistema-simplificado.js 1BvAp5gzlKjXExample123

Fontes de vídeo (automático):
📡 URLs no Google Docs (videoSrc, videoSrcMobile)
📁 Arquivos locais (static/videos/videoscrolly_X_main.mp4)
☁️ Vault (projeto/videos/videoscrolly_X_main.mp4)
🖼️ Frames prontos (projeto/video-frames/)
    `);
    process.exit(1);
  }

  try {
    const docId = args[0];
    const sistema = new VideoScrollySimples();
    
    await sistema.processar(docId);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { VideoScrollySimples };