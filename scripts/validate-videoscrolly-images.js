// scripts/validate-videoscrolly-images.js - Validar imagens do VideoScrollytelling
import fs from 'fs/promises';
import https from 'https';
import http from 'http';

/**
 * Testar se uma URL de imagem está acessível
 */
async function testImageUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({
        url: url,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length'],
        accessible: res.statusCode >= 200 && res.statusCode < 400
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url: url,
        status: 0,
        error: error.message,
        accessible: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url: url,
        status: 0,
        error: 'Timeout',
        accessible: false
      });
    });
    
    req.end();
  });
}

/**
 * Gerar URLs de teste baseadas em imagePrefix e totalFrames
 */
function generateTestUrls(imagePrefix, imagePrefixMobile, totalFrames) {
  const urls = {
    desktop: [],
    mobile: []
  };
  
  if (imagePrefix && totalFrames > 0) {
    for (let i = 1; i <= Math.min(totalFrames, 5); i++) { // Testar apenas os primeiros 5
      const paddedIndex = String(i).padStart(3, '0');
      urls.desktop.push(`${imagePrefix}${paddedIndex}.jpg`);
    }
  }
  
  if (imagePrefixMobile && totalFrames > 0) {
    for (let i = 1; i <= Math.min(totalFrames, 5); i++) { // Testar apenas os primeiros 5
      const paddedIndex = String(i).padStart(3, '0');
      urls.mobile.push(`${imagePrefixMobile}${paddedIndex}.jpg`);
    }
  }
  
  return urls;
}

/**
 * Validar VideoScrollytelling em um documento
 */
async function validateVideoScrollytelling(docPath) {
  console.log(`🔍 Validando VideoScrollytelling em: ${docPath}`);
  
  try {
    const docContent = await fs.readFile(docPath, 'utf8');
    const doc = JSON.parse(docContent);
    
    // Encontrar componentes VideoScrollytelling
    const videoScrollyComponents = doc.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (videoScrollyComponents.length === 0) {
      console.log('⚠️ Nenhum componente VideoScrollytelling encontrado');
      return;
    }
    
    console.log(`🎬 Encontrados ${videoScrollyComponents.length} componentes VideoScrollytelling\n`);
    
    for (let i = 0; i < videoScrollyComponents.length; i++) {
      const component = videoScrollyComponents[i];
      
      console.log(`📱 === COMPONENTE ${i + 1} ===`);
      console.log(`Tipo: ${component.type}`);
      console.log(`VideoSrc: ${component.videoSrc || 'Não definido'}`);
      console.log(`VideoSrcMobile: ${component.videoSrcMobile || 'Não definido'}`);
      console.log(`ImagePrefix: ${component.imagePrefix || 'Não definido'}`);
      console.log(`ImagePrefixMobile: ${component.imagePrefixMobile || 'Não definido'}`);
      console.log(`TotalFrames: ${component.totalFrames || 'Não definido'}`);
      console.log(`PosterImage: ${component.posterImage || 'Não definido'}`);
      console.log(`FallbackFrames: ${component.fallbackFrames?.length || 0} frames`);
      console.log(`Steps: ${component.steps?.length || 0} steps`);
      
      // Testar fallbackFrames se existirem
      if (component.fallbackFrames && component.fallbackFrames.length > 0) {
        console.log('\n🖼️ Testando fallbackFrames:');
        
        for (let j = 0; j < Math.min(component.fallbackFrames.length, 3); j++) {
          const frame = component.fallbackFrames[j];
          if (frame.src) {
            const result = await testImageUrl(frame.src);
            const status = result.accessible ? '✅' : '❌';
            console.log(`${status} Frame ${j}: ${result.url}`);
            if (!result.accessible) {
              console.log(`   Erro: ${result.error || `Status ${result.status}`}`);
            }
          }
        }
      }
      
      // Testar URLs geradas automaticamente
      if (component.imagePrefix || component.imagePrefixMobile) {
        console.log('\n🔗 Testando URLs geradas automaticamente:');
        
        const testUrls = generateTestUrls(
          component.imagePrefix, 
          component.imagePrefixMobile, 
          component.totalFrames || 0
        );
        
        if (testUrls.desktop.length > 0) {
          console.log('\n📥 Desktop:');
          for (const url of testUrls.desktop) {
            const result = await testImageUrl(url);
            const status = result.accessible ? '✅' : '❌';
            console.log(`${status} ${url}`);
            if (!result.accessible) {
              console.log(`   Erro: ${result.error || `Status ${result.status}`}`);
            }
          }
        }
        
        if (testUrls.mobile.length > 0) {
          console.log('\n📱 Mobile:');
          for (const url of testUrls.mobile) {
            const result = await testImageUrl(url);
            const status = result.accessible ? '✅' : '❌';
            console.log(`${status} ${url}`);
            if (!result.accessible) {
              console.log(`   Erro: ${result.error || `Status ${result.status}`}`);
            }
          }
        }
      }
      
      // Testar poster se existir
      if (component.posterImage) {
        console.log('\n🎭 Testando poster:');
        const result = await testImageUrl(component.posterImage);
        const status = result.accessible ? '✅' : '❌';
        console.log(`${status} Poster: ${component.posterImage}`);
        if (!result.accessible) {
          console.log(`   Erro: ${result.error || `Status ${result.status}`}`);
        }
      }
      
      // Diagnóstico e recomendações
      console.log('\n🩺 DIAGNÓSTICO:');
      
      const hasVideo = component.videoSrc || component.videoSrcMobile;
      const hasFallbackFrames = component.fallbackFrames && component.fallbackFrames.length > 0;
      const hasImagePrefix = component.imagePrefix && component.totalFrames > 0;
      const hasPoster = component.posterImage;
      
      if (!hasVideo && !hasFallbackFrames && !hasImagePrefix) {
        console.log('❌ PROBLEMA: Não há vídeo nem imagens configuradas');
        console.log('💡 SOLUÇÃO: Configure pelo menos uma das opções:');
        console.log('   - videoSrc + videoSrcMobile');
        console.log('   - imagePrefix + imagePrefixMobile + totalFrames');
        console.log('   - fallbackFrames array');
      } else if (hasImagePrefix && !hasFallbackFrames) {
        console.log('✅ Configuração correta para geração automática de frames');
        console.log('💡 O componente deve gerar frames automaticamente para iOS');
      } else if (hasFallbackFrames) {
        console.log('✅ Configuração com fallbackFrames manual');
      } else {
        console.log('⚠️ Configuração parcial - pode não funcionar em iOS');
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
  } catch (error) {
    console.error('❌ Erro ao validar documento:', error.message);
  }
}

/**
 * Gerar exemplo de configuração correta
 */
function generateExampleConfig() {
  const example = {
    type: "videoscrollytelling",
    videoSrc: "https://exemplo.com/video-desktop.mp4",
    videoSrcMobile: "https://exemplo.com/video-mobile.mp4",
    imagePrefix: "https://s3.glbimg.com/especiais/frames/intro_desktop_frame_",
    imagePrefixMobile: "https://s3.glbimg.com/especiais/frames/intro_mobile_frame_",
    totalFrames: 60,
    posterImage: "https://s3.glbimg.com/especiais/frames/intro_poster.jpg",
    showProgress: "true",
    showTime: "true",
    height: "400vh",
    steps: [
      {
        title: "Introdução",
        text: "Primeiro momento da história",
        time: 0
      },
      {
        title: "Desenvolvimento",
        text: "Como a situação evolui",
        time: 5
      },
      {
        title: "Conclusão",
        text: "O resultado final",
        time: 10
      }
    ]
  };
  
  console.log('📝 EXEMPLO DE CONFIGURAÇÃO CORRETA:');
  console.log(JSON.stringify(example, null, 2));
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 Validador de Imagens VideoScrollytelling

Uso:
  node scripts/validate-videoscrolly-images.js <documento.json>
  node scripts/validate-videoscrolly-images.js --example

Exemplos:
  node scripts/validate-videoscrolly-images.js static/data/meu-doc.json
  node scripts/validate-videoscrolly-images.js --example
    `);
    process.exit(1);
  }
  
  if (args[0] === '--example') {
    generateExampleConfig();
    return;
  }
  
  const docPath = args[0];
  
  try {
    await fs.access(docPath);
    await validateVideoScrollytelling(docPath);
  } catch (error) {
    console.error(`❌ Arquivo não encontrado: ${docPath}`);
    process.exit(1);
  }
}

main().catch(console.error);