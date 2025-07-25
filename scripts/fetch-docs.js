import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchGoogleDoc(docId) {
  console.log('📥 Baixando documento...');
  
  try {
    const url = `https://docs.google.com/document/d/${docId}/export?format=html`;
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      throw new Error('Documento não encontrado. Verifique se está público.');
    }
    
    let rawHtml = response.data.trim();
    
    // Parse HTML mantendo formatação
    const data = parseHTMLFormat(rawHtml);
    
    if (!data.title) {
      throw new Error('Documento deve ter "title:"');
    }
    
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    }
    
    const outputDir = path.join(__dirname, '../static/data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filename = `${data.slug}.json`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    
    console.log(`\n✅ Sucesso! Arquivo salvo: ${filename}`);
    console.log(`📝 Título: ${data.title}`);
    console.log(`📊 Intro: ${data.intro ? 'OK' : 'Vazio'}`);
    console.log(`📊 Paragraphs: ${data.paragraphs ? data.paragraphs.length : 0} itens`);
    
    // Validações
    const galleries = data.paragraphs?.filter(p => 
      ['galeria', 'gallery'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (galleries.length > 0) {
      console.log(`🖼️ Galerias encontradas: ${galleries.length}`);
      galleries.forEach((gallery, index) => {
        const imagesCount = gallery.images?.length || 0;
        console.log(`  ${index + 1}. Layout: ${gallery.layout} | Colunas: ${gallery.columns} | Imagens: ${imagesCount}`);
        
        if (imagesCount === 0) {
          console.warn(`⚠️ Galeria sem imagens:`, gallery);
        } else {
          console.log(`   ✅ Galeria funcionando! ${imagesCount} imagens encontradas`);
        }
      });
    }

    const carousels = data.paragraphs?.filter(p => 
      ['carrossel', 'carousel'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (carousels.length > 0) {
      console.log(`🎠 Carousels encontrados: ${carousels.length}`);
      carousels.forEach((carousel, index) => {
        const itemsCount = carousel.items?.length || 0;
        console.log(`  ${index + 1}. Autoplay: ${carousel.autoplay} | Items: ${itemsCount}`);
        
        if (itemsCount === 0) {
          console.warn(`⚠️ Carousel sem items:`, carousel);
        } else {
          console.log(`   ✅ Carousel funcionando! ${itemsCount} items encontrados`);
        }
      });
    }
    
    return data;
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

function parseHTMLFormat(html) {
  // Remove estilos e scripts desnecessários do Google Docs
  html = html.replace(/<style[^>]*>.*?<\/style>/gs, '');
  html = html.replace(/<script[^>]*>.*?<\/script>/gs, '');
  html = html.replace(/<head[^>]*>.*?<\/head>/gs, '');
  
  const data = {};
  
  // Extrai campos básicos
  const titleMatch = html.match(/title:\s*([^<\n]+)/i);
  if (titleMatch) data.title = decodeHTMLEntities(titleMatch[1].trim());
  
  const subtitleMatch = html.match(/subtitle:\s*([^<\n]+)/i);
  if (subtitleMatch) data.subtitle = decodeHTMLEntities(subtitleMatch[1].trim());
  
  const authorMatch = html.match(/author:\s*([^<\n]+)/i);
  if (authorMatch) data.author = decodeHTMLEntities(authorMatch[1].trim());
  
  const dateMatch = html.match(/date:\s*([^<\n]+)/i);
  if (dateMatch) data.date = decodeHTMLEntities(dateMatch[1].trim());
  
  const themeMatch = html.match(/theme:\s*([^<\n]+)/i);
  if (themeMatch) data.theme = decodeHTMLEntities(themeMatch[1].trim());
  
  // Parse intro
  const introMatch = html.match(/\[(?:\+)?intro\](.*?)\[intro\]/s);
  if (introMatch) {
    const introHtml = introMatch[1];
    const introTextMatch = introHtml.match(/text:\s*([\s\S]*?)(?=\[intro\]|$)/);
    if (introTextMatch) {
      data.intro = {
        text: cleanAndFormatHTML(introTextMatch[1])
      };
    }
  }
  
  // Parse paragraphs
  const paragraphsMatch = html.match(/\[(?:\+)?paragraphs\](.*?)\[paragraphs\]/s);
  if (paragraphsMatch) {
    const paragraphsHtml = paragraphsMatch[1];
    data.paragraphs = parseParagraphsHTML(paragraphsHtml);
  } else {
    data.paragraphs = [];
  }
  
  return data;
}

function decodeHTMLEntities(text) {
  const entities = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
    '&aacute;': 'á', '&agrave;': 'à', '&acirc;': 'â', '&atilde;': 'ã', '&auml;': 'ä',
    '&eacute;': 'é', '&egrave;': 'è', '&ecirc;': 'ê', '&euml;': 'ë',
    '&iacute;': 'í', '&igrave;': 'ì', '&icirc;': 'î', '&iuml;': 'ï',
    '&oacute;': 'ó', '&ograve;': 'ò', '&ocirc;': 'ô', '&otilde;': 'õ', '&ouml;': 'ö',
    '&uacute;': 'ú', '&ugrave;': 'ù', '&ucirc;': 'û', '&uuml;': 'ü',
    '&ccedil;': 'ç', '&ntilde;': 'ñ', '&nbsp;': ' '
  };
  
  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => entities[entity] || entity);
}

// 🔧 FUNÇÃO REVOLUCIONÁRIA - LIMPA HTML DOS ARRAYS JSON
function extractCleanJSONArray(text, fieldName) {
  console.log(`\n🔍 Extraindo array '${fieldName}' do bloco`);
  
  // 🔧 PASSO 1: Encontra onde começa o array
  const fieldRegex = new RegExp(`${fieldName}:\\s*\\[`, 'i');
  const fieldMatch = text.match(fieldRegex);
  
  if (!fieldMatch) {
    console.log(`   ❌ Campo '${fieldName}:' não encontrado`);
    return [];
  }
  
  const startIndex = fieldMatch.index + fieldMatch[0].length - 1; // Posição do '['
  console.log(`   📍 Encontrado '${fieldName}:' na posição ${startIndex}`);
  
  // 🔧 PASSO 2: Extrai tudo até o próximo 'type:' ou fim
  const remainingText = text.substring(startIndex);
  const nextTypeIndex = remainingText.search(/type:\s*[a-zA-Z]/);
  
  let arraySection;
  if (nextTypeIndex !== -1) {
    arraySection = remainingText.substring(0, nextTypeIndex);
  } else {
    arraySection = remainingText;
  }
  
  console.log(`   📝 Seção do array (${arraySection.length} chars):`, arraySection.substring(0, 200) + '...');
  
  // 🔧 PASSO 3: REMOVE TODAS AS TAGS HTML E LIMPA
  let cleanedArray = arraySection
    // Remove todas as tags HTML
    .replace(/<[^>]*>/g, '')
    // Remove entidades HTML
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // Normaliza espaços
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log(`   🧹 Array limpo:`, cleanedArray.substring(0, 200) + '...');
  
  // 🔧 PASSO 4: Encontra o final correto do array contando []
  let bracketCount = 0;
  let endIndex = -1;
  
  for (let i = 0; i < cleanedArray.length; i++) {
    if (cleanedArray[i] === '[') {
      bracketCount++;
    } else if (cleanedArray[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  
  if (endIndex === -1) {
    console.log(`   ❌ Não encontrou fechamento do array`);
    return [];
  }
  
  const finalArrayString = cleanedArray.substring(0, endIndex);
  console.log(`   ✂️ Array final (${finalArrayString.length} chars):`, finalArrayString);
  
  // 🔧 PASSO 5: Tenta fazer o parsing
  try {
    const parsed = JSON.parse(finalArrayString);
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log(`   ✅ SUCCESS! ${parsed.length} itens parseados com sucesso!`);
      return parsed;
    } else {
      console.log(`   ⚠️ Array vazio ou inválido`);
      return [];
    }
  } catch (e) {
    console.log(`   ❌ Erro no parsing JSON: ${e.message}`);
    console.log(`   🔧 String problemática:`, finalArrayString.substring(0, 100));
    return [];
  }
}

function parseParagraphsHTML(html) {
  const paragraphs = [];
  
  // Divide por type:
  const typeBlocks = html.split(/(?=type:\s*)/);
  
  for (const block of typeBlocks) {
    if (!block.trim() || !block.includes('type:')) continue;
    
    const paragraph = {};
    
    // Extrai type
    const typeMatch = block.match(/type:\s*([^\n<]+)/);
    if (typeMatch) {
      paragraph.type = decodeHTMLEntities(typeMatch[1].trim());
    }
    
    // Extrai text
    const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:backgroundImage|backgroundImageMobile|author|role|src|caption|credit|alt|fullWidth|variant|size|orientation|autoplay|controls|poster|images|items|steps|beforeImage|afterImage|beforeLabel|afterLabel|image|height|heightMobile|speed|content|overlay|layout|columns|interval|showDots|showArrows|stickyHeight|videoId|videosIDs|id|skipDFP|skipdfp|autoPlay|startMuted|maxQuality|quality|chromeless|isLive|live|allowRestrictedContent|preventBlackBars|globoId|token|adAccountId|adCmsId|siteName|width|textPosition|textPositionMobile|textAlign|textAlignMobile):|type:|$)/s);
    if (textMatch) {
      paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
    }
    
    // 🔧 NOVA EXTRAÇÃO DE ARRAYS COM LIMPEZA HTML
    
    // Images para galerias
    if (block.toLowerCase().includes('images:')) {
      paragraph.images = extractCleanJSONArray(block, 'images');
    }
    
    // Items para carousels
    if (block.toLowerCase().includes('items:')) {
      paragraph.items = extractCleanJSONArray(block, 'items');
    }
    
    // Steps para ScrollyTelling
    if (block.toLowerCase().includes('steps:')) {
      paragraph.steps = extractCleanJSONArray(block, 'steps');
    }
    
    // Extrai URLs de imagem de fundo
    const backgroundImageMatch = block.match(/backgroundImage:\s*(https?:\/\/[^\s\n<]+)/);
    if (backgroundImageMatch) {
      paragraph.backgroundImage = decodeHTMLEntities(backgroundImageMatch[1].trim());
    }
    
    const backgroundImageMobileMatch = block.match(/backgroundImageMobile:\s*(https?:\/\/[^\s\n<]+)/);
    if (backgroundImageMobileMatch) {
      paragraph.backgroundImageMobile = decodeHTMLEntities(backgroundImageMobileMatch[1].trim());
    }
    
    // Extrai outros campos
    const fieldMappings = {
      backgroundPosition: 'backgroundPosition',
      backgroundPositionMobile: 'backgroundPositionMobile',
      textPosition: 'textPosition',
      textPositionMobile: 'textPositionMobile',
      textAlign: 'textAlign',
      textAlignMobile: 'textAlignMobile',
      height: 'height',
      heightMobile: 'heightMobile',
      author: 'author',
      role: 'role',
      src: 'src',
      caption: 'caption',
      credit: 'credit',
      alt: 'alt',
      fullWidth: 'fullWidth',
      variant: 'variant',
      size: 'size',
      orientation: 'orientation',
      autoplay: 'autoplay',
      controls: 'controls',
      poster: 'poster',
      overlay: 'overlay',
      layout: 'layout',
      columns: 'columns',
      interval: 'interval',
      showDots: 'showDots',
      showArrows: 'showArrows',
      stickyHeight: 'stickyHeight',
      beforeImage: 'beforeImage',
      afterImage: 'afterImage',
      beforeLabel: 'beforeLabel',
      afterLabel: 'afterLabel',
      image: 'image',
      speed: 'speed',
      content: 'content',
      videoId: 'videoId',
      videosIDs: 'videosIDs',
      id: 'id',
      skipDFP: 'skipDFP',
      skipdfp: 'skipdfp',
      autoPlay: 'autoPlay',
      startMuted: 'startMuted',
      maxQuality: 'maxQuality',
      quality: 'quality',
      chromeless: 'chromeless',
      isLive: 'isLive',
      live: 'live',
      allowRestrictedContent: 'allowRestrictedContent',
      preventBlackBars: 'preventBlackBars',
      globoId: 'globoId',
      token: 'token',
      adAccountId: 'adAccountId',
      adCmsId: 'adCmsId',
      siteName: 'siteName',
      width: 'width',
      showCaption: 'showCaption',
      alignment: 'alignment',
      loop: 'loop'
    };
    
    for (const [field, prop] of Object.entries(fieldMappings)) {
      const match = block.match(new RegExp(`${field}:\\s*([^\\n<]+)`));
      if (match) {
        let value = decodeHTMLEntities(match[1].trim());
        
        // Conversão de tipos
        if (['height', 'heightMobile', 'width', 'columns', 'interval', 'stickyHeight'].includes(field)) {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            value = numValue.toString();
          }
        }
        
        paragraph[prop] = value;
      }
    }
    
    if (paragraph.type) {
      paragraphs.push(paragraph);
    }
  }
  
  console.log(`\n📊 Total de parágrafos processados: ${paragraphs.length}`);
  return paragraphs;
}

function cleanAndFormatHTML(html) {
  if (!html) return '';
  
  html = decodeHTMLEntities(html);
  
  // Converte <br> em quebras de linha para listas
  html = html.replace(/<br[^>]*>/gi, '\n• ');
  
  // Se tem bullet points, transforma em lista HTML
  if (html.includes('• ')) {
    const items = html.split('• ').filter(item => item.trim());
    if (items.length > 1) {
      html = '<ul>' + items.map(item => `<li>${item.trim()}</li>`).join('') + '</ul>';
    }
  }
  
  // Formatação
  html = html.replace(/<([^>]+)style="[^"]*font-weight:\s*(?:bold|[7-9]\d\d|700|800|900)[^"]*"[^>]*>(.*?)<\/\1>/gi, '<strong>$2</strong>');
  html = html.replace(/<([^>]+)style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/\1>/gi, '<em>$2</em>');
  html = html.replace(/<([^>]+)style="[^"]*text-decoration[^"]*underline[^"]*"[^>]*>(.*?)<\/\1>/gi, '<u>$2</u>');
  
  // Preserva links
  html = html.replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '<a href="$1">$2</a>');
  
  // Remove spans e outros elementos
  html = html.replace(/<span[^>]*>(.*?)<\/span>/gi, '$1');
  html = html.replace(/<\/?(?:div|p)[^>]*>/gi, ' ');
  
  // Formatação aninhada
  let previousHtml = '';
  let iterations = 0;
  while (html !== previousHtml && iterations < 5) {
    previousHtml = html;
    html = html.replace(/<span[^>]*font-weight:\s*(?:bold|[7-9]\d\d)[^>]*>(.*?)<\/span>/gi, '<strong>$1</strong>');
    html = html.replace(/<span[^>]*font-style:\s*italic[^>]*>(.*?)<\/span>/gi, '<em>$1</em>');
    html = html.replace(/<span[^>]*text-decoration[^"]*underline[^>]*>(.*?)<\/span>/gi, '<u>$1</u>');
    iterations++;
  }
  
  html = html.replace(/<\/?span[^>]*>/gi, '');
  
  if (!html.includes('<ul>')) {
    html = html.replace(/\s+/g, ' ').trim();
  }
  
  return html;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('❌ Use: npm run fetch DOC_ID');
  process.exit(1);
}

fetchGoogleDoc(args[0]);