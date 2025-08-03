// scripts/create-temp-poster.js - Criar Poster Temporário
import fs from 'fs/promises';

/**
 * Adicionar poster temporário ao VideoScrollytelling
 */
async function addTempPoster(docPath) {
  console.log('🎬 Adicionando poster temporário...');
  
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
    
    // Adicionar poster temporário aos componentes
    videoScrollyComponents.forEach((component, index) => {
      // Usar uma imagem placeholder elegante
      component.posterImage = 'https://picsum.photos/1920/1080?random=' + (index + 1);
      
      // Se não tem fallbackFrames, criar alguns temporários
      if (!component.fallbackFrames || component.fallbackFrames.length === 0) {
        component.fallbackFrames = [
          {
            index: 0,
            time: 0,
            src: 'https://picsum.photos/1920/1080?random=' + (index + 1),
            alt: 'Frame inicial'
          },
          {
            index: 1,
            time: 5,
            src: 'https://picsum.photos/1920/1080?random=' + (index + 10),
            alt: 'Frame meio'
          },
          {
            index: 2,
            time: 10,
            src: 'https://picsum.photos/1920/1080?random=' + (index + 20),
            alt: 'Frame final'
          }
        ];
      }
      
      console.log(`✅ Poster adicionado ao VideoScrolly ${index + 1}`);
    });
    
    // Salvar documento atualizado
    await fs.writeFile(docPath, JSON.stringify(doc, null, 2));
    console.log('✅ Documento atualizado com posters temporários');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// CLI
const docPath = process.argv[2];
if (!docPath) {
  console.log('Uso: node scripts/create-temp-poster.js <documento.json>');
  process.exit(1);
}

addTempPoster(docPath);