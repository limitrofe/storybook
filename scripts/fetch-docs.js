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
    
    console.log('\n🔍 Dados processados:');
    console.log(JSON.stringify(data, null, 2));
    
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
    
    // 🔍 VALIDAÇÃO PARA BACKGROUND IMAGES
    const withBackgrounds = data.paragraphs?.filter(p => 
      p.backgroundImage || p.backgroundImageMobile
    ) || [];
    
    if (withBackgrounds.length > 0) {
      console.log(`🖼️ Componentes com background encontrados: ${withBackgrounds.length}`);
      withBackgrounds.forEach((comp, index) => {
        console.log(`  ${index + 1}. ${comp.type}: ${comp.text?.substring(0, 30)}...`);
        if (comp.backgroundImage) console.log(`     🖥️ Desktop: ${comp.backgroundImage}`);
        if (comp.backgroundImageMobile) console.log(`     📱 Mobile: ${comp.backgroundImageMobile}`);
      });
    }
    
    // 🆕 NOVA VALIDAÇÃO PARA GLOBOPLAYER
    const globoPlayers = data.paragraphs?.filter(p => 
      ['globovideo', 'globo-video', 'globoplayer', 'globo-player', 'globo'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (globoPlayers.length > 0) {
      console.log(`🎬 GloboPlayers encontrados: ${globoPlayers.length}`);
      globoPlayers.forEach((player, index) => {
        const videoId = player.videoId || player.videosIDs || player.id;
        console.log(`  ${index + 1}. ID: ${videoId || 'FALTANDO ID!'} - Tipo: ${player.type}`);
        
        if (!videoId) {
          console.warn(`⚠️ GloboPlayer sem videoId: ${JSON.stringify(player)}`);
        }
      });
    }
    
    // 🔧 NOVA VALIDAÇÃO PARA PARALLAX
    const parallaxComponents = data.paragraphs?.filter(p => 
      p.type?.toLowerCase() === 'parallax'
    ) || [];
    
    if (parallaxComponents.length > 0) {
      console.log(`🌄 Parallax encontrados: ${parallaxComponents.length}`);
      parallaxComponents.forEach((parallax, index) => {
        console.log(`  ${index + 1}. Image: ${parallax.image || 'SEM IMAGEM'}`);
        console.log(`     Height: ${parallax.height || 'SEM HEIGHT ⚠️'}`);
        console.log(`     Speed: ${parallax.speed || 'SEM SPEED'}`);
        console.log(`     Content: ${parallax.content ? 'OK' : 'VAZIO'}`);
        if (parallax.content && parallax.content.includes('"')) {
          console.warn(`     ⚠️ Content com aspas problemáticas detectado`);
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
  
  // Primeiro tenta extrair campos básicos do HTML
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
  
  // Se não encontrou title no HTML, tenta no texto plano
  if (!data.title) {
    const textContent = html.replace(/<[^>]*>/g, '\n');
    const lines = textContent.split('\n').map(line => line.trim()).filter(line => line);
    
    for (const line of lines) {
      if (line.toLowerCase().startsWith('title:')) {
        data.title = decodeHTMLEntities(line.replace(/^title:\s*/i, '').trim());
        break;
      }
    }
  }
  
  // Parse intro mantendo formatação HTML
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
  
  // Parse paragraphs mantendo formatação HTML
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
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&aacute;': 'á',
    '&agrave;': 'à',
    '&acirc;': 'â',
    '&atilde;': 'ã',
    '&auml;': 'ä',
    '&eacute;': 'é',
    '&egrave;': 'è',
    '&ecirc;': 'ê',
    '&euml;': 'ë',
    '&iacute;': 'í',
    '&igrave;': 'ì',
    '&icirc;': 'î',
    '&iuml;': 'ï',
    '&oacute;': 'ó',
    '&ograve;': 'ò',
    '&ocirc;': 'ô',
    '&otilde;': 'õ',
    '&ouml;': 'ö',
    '&uacute;': 'ú',
    '&ugrave;': 'ù',
    '&ucirc;': 'û',
    '&uuml;': 'ü',
    '&ccedil;': 'ç',
    '&ntilde;': 'ñ'
  };
  
  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => entities[entity] || entity);
}

function parseParagraphsHTML(html) {
  const paragraphs = [];
  
  // 🔧 CORREÇÃO: Divide por type: de forma mais robusta
  const typeBlocks = html.split(/(?=type:\s*)/);
  
  for (const block of typeBlocks) {
    if (!block.trim() || !block.includes('type:')) continue;
    
    const paragraph = {};
    
    // Extrai type
    const typeMatch = block.match(/type:\s*([^\n<]+)/);
    if (typeMatch) {
      paragraph.type = decodeHTMLEntities(typeMatch[1].trim());
    }
    
    // 🔧 CORREÇÃO: Extrai text de forma mais específica
    const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:backgroundImage|backgroundImageMobile|backgroundVideo|backgroundVideoMobile|backgroundPosition|backgroundPositionMobile|author|role|src|caption|credit|alt|fullWidth|variant|size|orientation|autoplay|controls|poster|images|items|steps|beforeImage|afterImage|beforeLabel|afterLabel|image|height|heightMobile|speed|content|overlay|layout|columns|interval|showDots|showArrows|stickyHeight|videoId|videosIDs|id|skipDFP|skipdfp|autoPlay|startMuted|maxQuality|quality|chromeless|isLive|live|allowRestrictedContent|preventBlackBars|globoId|token|adAccountId|adCmsId|siteName|width|textPosition|textPositionMobile|textAlign|textAlignMobile):|type:|$)/s);
    if (textMatch) {
      paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
    }
    
    // 🔧 CORREÇÃO PRINCIPAL: Parse de backgroundImage mais robusto
    // 🆕 REGEX MELHORADA: Aceita URLs da Globo (glbimg.com) e outras
    const backgroundImageMatch = block.match(/backgroundImage:\s*(https?:\/\/[^\s\n<]+)/);
    if (backgroundImageMatch) {
      // 🔧 NOVA CORREÇÃO: Decodificar entidades HTML na URL
      paragraph.backgroundImage = decodeHTMLEntities(backgroundImageMatch[1].trim());
      console.log(`🖼️ Background encontrado: ${paragraph.backgroundImage}`);
    }
    
    const backgroundImageMobileMatch = block.match(/backgroundImageMobile:\s*(https?:\/\/[^\s\n<]+)/);
    if (backgroundImageMobileMatch) {
      // 🔧 NOVA CORREÇÃO: Decodificar entidades HTML na URL mobile
      paragraph.backgroundImageMobile = decodeHTMLEntities(backgroundImageMobileMatch[1].trim());
      console.log(`📱 Background mobile encontrado: ${paragraph.backgroundImageMobile}`);
    }
    
    // Background videos
    const backgroundVideoMatch = block.match(/backgroundVideo:\s*(https?:\/\/[^\s\n<]+)/);
    if (backgroundVideoMatch) {
      paragraph.backgroundVideo = backgroundVideoMatch[1].trim();
    }
    
    const backgroundVideoMobileMatch = block.match(/backgroundVideoMobile:\s*(https?:\/\/[^\s\n<]+)/);
    if (backgroundVideoMobileMatch) {
      paragraph.backgroundVideoMobile = backgroundVideoMobileMatch[1].trim();
    }
    
    // 🔧 CORREÇÃO CRÍTICA: Parse do campo 'content' para parallax
    const contentMatch = block.match(/content:\s*(.*?)(?=\s*(?:overlay|height|speed|image|type:|$))/s);
    if (contentMatch) {
      let content = contentMatch[1].trim();
      
      // 🔥 CORREÇÃO TOTAL: Remove todas as aspas problemáticas
      // Remove aspas no início e fim
      content = content.replace(/^["']+/, '').replace(/["']+$/, '');
      
      // Remove aspas duplas que envolvem o conteúdo HTML
      if (content.startsWith('"') && content.endsWith('"')) {
        content = content.slice(1, -1);
      }
      
      // Remove escape de aspas internas
      content = content.replace(/\\"/g, '"').replace(/\\'/g, "'");
      
      // Remove aspas extras que podem ter ficado
      content = content.replace(/^"(.+)"$/, '$1');
      
      // Decodifica entidades HTML
      content = decodeHTMLEntities(content);
      
      paragraph.content = content;
      
      // 🔧 Verificação final
      if (content.includes('"<') || content.includes('>"')) {
        console.warn(`⚠️ Aspas ainda detectadas no content: ${content.substring(0, 50)}...`);
      } else {
        console.log(`✅ Content limpo para ${paragraph.type}: ${content.substring(0, 50)}...`);
      }
    }
    
    // NOVIDADE: Parse de arrays JSON para componentes avançados
    const imagesMatch = block.match(/images:\s*(\[[\s\S]*?\])/);
    if (imagesMatch) {
      try {
        paragraph.images = JSON.parse(imagesMatch[1].replace(/\n\s*/g, ' '));
      } catch (e) {
        console.warn('Erro ao parsear images:', e);
        paragraph.images = [];
      }
    }
    
    const itemsMatch = block.match(/items:\s*(\[[\s\S]*?\])/);
    if (itemsMatch) {
      try {
        paragraph.items = JSON.parse(itemsMatch[1].replace(/\n\s*/g, ' '));
      } catch (e) {
        console.warn('Erro ao parsear items:', e);
        paragraph.items = [];
      }
    }
    
    const stepsMatch = block.match(/steps:\s*(\[[\s\S]*?\])/);
    if (stepsMatch) {
      try {
        paragraph.steps = JSON.parse(stepsMatch[1].replace(/\n\s*/g, ' '));
      } catch (e) {
        console.warn('Erro ao parsear steps:', e);
        paragraph.steps = [];
      }
    }
    
    // 🔧 MAPEAMENTO COMPLETO DE CAMPOS (incluindo novos)
    const fieldMappings = {
      // Campos de layout e posicionamento
      backgroundPosition: 'backgroundPosition',
      backgroundPositionMobile: 'backgroundPositionMobile',
      textPosition: 'textPosition',
      textPositionMobile: 'textPositionMobile',
      textAlign: 'textAlign',
      textAlignMobile: 'textAlignMobile',
      height: 'height',
      heightMobile: 'heightMobile',
      
      // Campos básicos existentes
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
      
      // Campos específicos do GloboPlayer
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
      // 🔧 CORREÇÃO ESPECÍFICA PARA PARALLAX HEIGHT
      // Se for parallax e estamos procurando por height, usa regex mais específica
      let match;
      if (paragraph.type?.toLowerCase() === 'parallax' && field === 'height') {
        match = block.match(new RegExp(`height:\\s*([^\\n\\r]+)`, 'i'));
        if (match) {
          console.log(`🌄 PARALLAX HEIGHT encontrado: "${match[1].trim()}" no bloco`);
        }
      } else {
        match = block.match(new RegExp(`${field}:\\s*([^\\n<]+)`));
      }
      
      if (match) {
        let value = decodeHTMLEntities(match[1].trim());
        
        // 🔧 CONVERSÃO DE TIPOS
        if (['height', 'heightMobile', 'width', 'columns', 'interval', 'stickyHeight'].includes(field)) {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            value = numValue.toString();
          }
        }
        
        paragraph[prop] = value;
      }
    }
    
    // 🆕 VALIDAÇÃO ESPECÍFICA PARA GLOBOPLAYER
    if (['globovideo', 'globo-video', 'globoplayer', 'globo-player', 'globo'].includes(paragraph.type?.toLowerCase())) {
      const videoId = paragraph.videoId || paragraph.videosIDs || paragraph.id;
      if (!videoId) {
        console.warn(`⚠️ GloboPlayer sem videoId encontrado:`, paragraph);
      } else {
        console.log(`✅ GloboPlayer válido encontrado: ${videoId}`);
      }
      
      // Definir padrões para GloboPlayer
      if (!paragraph.width) paragraph.width = '100%';
      if (!paragraph.height) paragraph.height = '450';
      if (paragraph.startMuted === undefined) paragraph.startMuted = 'true';
      if (!paragraph.maxQuality && !paragraph.quality) paragraph.maxQuality = 'high';
    }
    
    // 🔧 DEBUG: Log do parágrafo processado
    if (paragraph.type && (paragraph.backgroundImage || paragraph.backgroundImageMobile)) {
      console.log(`✅ Parágrafo com background processado:`, {
        type: paragraph.type,
        text: paragraph.text?.substring(0, 50) + '...',
        backgroundImage: paragraph.backgroundImage,
        backgroundImageMobile: paragraph.backgroundImageMobile,
        textPosition: paragraph.textPosition,
        textAlign: paragraph.textAlign
      });
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
  
  // Primeiro decodifica entities HTML
  html = decodeHTMLEntities(html);
  
  // Converte <br> em quebras de linha reais para listas
  html = html.replace(/<br[^>]*>/gi, '\n• ');
  
  // Se tem bullet points com •, transforma em lista HTML
  if (html.includes('• ')) {
    const items = html.split('• ').filter(item => item.trim());
    if (items.length > 1) {
      html = '<ul>' + items.map(item => `<li>${item.trim()}</li>`).join('') + '</ul>';
    }
  }
  
  // Captura formatação do Google Docs com base nos estilos inline
  html = html.replace(/<([^>]+)style="[^"]*font-weight:\s*(?:bold|[7-9]\d\d|700|800|900)[^"]*"[^>]*>(.*?)<\/\1>/gi, '<strong>$2</strong>');
  html = html.replace(/<([^>]+)style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/\1>/gi, '<em>$2</em>');
  html = html.replace(/<([^>]+)style="[^"]*text-decoration[^"]*underline[^"]*"[^>]*>(.*?)<\/\1>/gi, '<u>$2</u>');
  
  // Preserva links existentes
  html = html.replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '<a href="$1">$2</a>');
  
  // Remove span tags vazios mas preserva o conteúdo
  html = html.replace(/<span[^>]*>(.*?)<\/span>/gi, '$1');
  
  // Remove outras tags de estrutura do Google Docs mas preserva conteúdo  
  html = html.replace(/<\/?(?:div|p)[^>]*>/gi, ' ');
  
  // Aplica formatação aninhada
  let previousHtml = '';
  let iterations = 0;
  while (html !== previousHtml && iterations < 5) {
    previousHtml = html;
    html = html.replace(/<span[^>]*font-weight:\s*(?:bold|[7-9]\d\d)[^>]*>(.*?)<\/span>/gi, '<strong>$1</strong>');
    html = html.replace(/<span[^>]*font-style:\s*italic[^>]*>(.*?)<\/span>/gi, '<em>$1</em>');
    html = html.replace(/<span[^>]*text-decoration[^"]*underline[^>]*>(.*?)<\/span>/gi, '<u>$1</u>');
    iterations++;
  }
  
  // Remove spans restantes sem formatação importante
  html = html.replace(/<\/?span[^>]*>/gi, '');
  
  // Limpa espaços extras mas preserva quebras em listas
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