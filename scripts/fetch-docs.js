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
    
    // Validação específica para ScrollyTelling
    const scrollyComponents = data.paragraphs?.filter(p => 
      ['scrollytelling', 'scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (scrollyComponents.length > 0) {
      console.log(`📜 ScrollyTelling encontrados: ${scrollyComponents.length}`);
      scrollyComponents.forEach((comp, index) => {
        const stepsCount = comp.steps?.length || 0;
        console.log(`  ${index + 1}. Steps: ${stepsCount} | FullWidth: ${comp.fullWidth || 'false'}`);
        
        if (stepsCount === 0) {
          console.warn(`⚠️ ScrollyTelling sem steps: ${comp.text?.substring(0, 50)}...`);
        } else {
          comp.steps.forEach((step, stepIndex) => {
            console.log(`     Step ${stepIndex + 1}: "${step.title?.substring(0, 30)}..."`);
          });
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
  html = html.replace(/<style[^>]*>.*?<\/style>/gs, '');
  html = html.replace(/<script[^>]*>.*?<\/script>/gs, '');
  html = html.replace(/<head[^>]*>.*?<\/head>/gs, '');
  
  const data = {};
  
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
  if (!text) return '';
  const entities = { 
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", 
    '&aacute;': 'á', '&agrave;': 'à', '&acirc;': 'â', '&atilde;': 'ã', '&auml;': 'ä', 
    '&eacute;': 'é', '&egrave;': 'è', '&ecirc;': 'ê', '&euml;': 'ë', 
    '&iacute;': 'í', '&igrave;': 'ì', '&icirc;': 'î', '&iuml;': 'ï', 
    '&oacute;': 'ó', '&ograve;': 'ò', '&ocirc;': 'ô', '&otilde;': 'õ', '&ouml;': 'ö', 
    '&uacute;': 'ú', '&ugrave;': 'ù', '&ucirc;': 'û', '&uuml;': 'ü', 
    '&ccedil;': 'ç', '&ntilde;': 'ñ' 
  };
  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => entities[entity] || entity);
}

// 🔧 FUNÇÃO MELHORADA: Parser robusto para arrays JSON
function parseJSONField(jsonString, fieldName) {
  if (!jsonString) return null;
  
  try {
    console.log(`🔍 Tentando parsear ${fieldName}:`, jsonString.substring(0, 100) + '...');
    
    // Limpeza robusta do JSON vindo do Google Docs
    let cleanJson = jsonString
      // Remove tags HTML
      .replace(/<[^>]*>/g, '')
      // Converte entidades HTML
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Remove quebras de linha e espaços extras
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\s+/g, ' ')
      // Fix vírgulas extras
      .replace(/,\s*\]/g, ']')
      .replace(/,\s*}/g, '}')
      // Fix aspas curvas (problema comum do Google Docs)
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Remove espaços ao redor de : e ,
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*,\s*/g, ',')
      .trim();
    
    // Tenta o parse direto primeiro
    let parsed = JSON.parse(cleanJson);
    
    // Se é array, processa cada item
    if (Array.isArray(parsed)) {
      parsed = parsed.map(item => {
        if (typeof item === 'object' && item !== null) {
          // Limpa strings dentro do objeto
          Object.keys(item).forEach(key => {
            if (typeof item[key] === 'string') {
              item[key] = decodeHTMLEntities(item[key]);
              // Se for um campo de texto, permite formatação HTML
              if (['text', 'caption', 'content'].includes(key)) {
                item[key] = cleanAndFormatHTML(item[key]);
              }
            }
          });
        }
        return item;
      });
    }
    
    console.log(`✅ ${fieldName} parseado com sucesso:`, parsed.length, 'itens');
    return parsed;
    
  } catch (error) {
    console.warn(`⚠️ Erro ao parsear ${fieldName}:`, error.message);
    console.log('JSON problemático:', jsonString.substring(0, 200));
    
    // Fallback: tenta um parse mais agressivo
    try {
      // Remove tudo que não é essencial para o JSON
      let fallbackJson = jsonString
        .replace(/[^\[\]{}":,\w\s\-\.\/\?=&]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      let fallbackParsed = JSON.parse(fallbackJson);
      console.log(`🔄 Fallback parse funcionou para ${fieldName}`);
      return fallbackParsed;
      
    } catch (fallbackError) {
      console.error(`❌ Fallback também falhou para ${fieldName}:`, fallbackError.message);
      return [];
    }
  }
}

function parseParagraphsHTML(html) {
  const paragraphs = [];
  const typeBlocks = html.split(/(?=type:\s*)/);
  
  for (const block of typeBlocks) {
    if (!block.trim() || !block.includes('type:')) continue;
    
    const paragraph = {};
    
    const typeMatch = block.match(/type:\s*([^\n<]+)/);
    if (typeMatch) {
      paragraph.type = decodeHTMLEntities(typeMatch[1].trim());
    }

    // 🔧 MELHORIA: Tratamento especial para componentes Flourish
    if (['flourish', 'flourish-scrolly', 'grafico', 'mapa'].includes(paragraph.type)) {
      const srcMatch = block.match(/src:\s*([^\n<]+)/);
      if (srcMatch) {
        paragraph.src = srcMatch[1].trim();
      }

      // 🔧 NOVO: Parser melhorado para steps
      const stepsMatch = block.match(/steps:\s*(\[[\s\S]*?\])/);
      if (stepsMatch) {
        paragraph.steps = parseJSONField(stepsMatch[1], 'flourish steps');
      }
      
      paragraphs.push(paragraph);
      continue;
    }

    // Parse de text field
    const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:backgroundImage|backgroundImageMobile|backgroundVideo|backgroundVideoMobile|backgroundPosition|backgroundPositionMobile|author|role|src|caption|credit|alt|fullWidth|variant|size|orientation|autoplay|controls|poster|images|items|steps|beforeImage|afterImage|beforeLabel|afterLabel|image|height|heightMobile|speed|content|overlay|layout|columns|interval|showDots|showArrows|stickyHeight|videoId|videosIDs|id|skipDFP|skipdfp|autoPlay|startMuted|maxQuality|quality|chromeless|isLive|live|allowRestrictedContent|preventBlackBars|globoId|token|adAccountId|adCmsId|siteName|width|textPosition|textPositionMobile|textAlign|textAlignMobile):|type:|$)/s);
    if (textMatch) {
      if (['texto', 'frase', 'intro'].includes(paragraph.type)) {
        paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
      } else {
        paragraph.text = decodeHTMLEntities(textMatch[1].trim().replace(/<[^>]*>/g, ' ')).replace(/\s\s+/g, ' ').trim();
      }
    }
    
    // 🔧 MELHORIA PRINCIPAL: Parser robusto para arrays JSON
    const jsonFields = ['images', 'items', 'steps'];
    for (const field of jsonFields) {
      const regex = new RegExp(`${field}:\\s*(\\[[\\s\\S]*?\\])`, 'i');
      const match = block.match(regex);
      if (match) {
        paragraph[field] = parseJSONField(match[1], field);
      }
    }

    // Parse de outros campos simples
    const fieldMappings = {
      backgroundImage: 'backgroundImage', backgroundImageMobile: 'backgroundImageMobile', backgroundVideo: 'backgroundVideo',
      backgroundVideoMobile: 'backgroundVideoMobile', backgroundPosition: 'backgroundPosition', backgroundPositionMobile: 'backgroundPositionMobile',
      textPosition: 'textPosition', textPositionMobile: 'textPositionMobile', textAlign: 'textAlign', textAlignMobile: 'textAlignMobile',
      author: 'author', role: 'role', src: 'src', caption: 'caption', credit: 'credit', alt: 'alt', fullWidth: 'fullWidth', variant: 'variant',
      size: 'size', orientation: 'orientation', autoplay: 'autoplay', controls: 'controls', poster: 'poster', overlay: 'overlay',
      layout: 'layout', columns: 'columns', interval: 'interval', showDots: 'showDots', showArrows: 'showArrows',
      stickyHeight: 'stickyHeight', beforeImage: 'beforeImage', afterImage: 'afterImage', beforeLabel: 'beforeLabel',
      afterLabel: 'afterLabel', image: 'image', speed: 'speed', content: 'content', videoId: 'videoId', videosIDs: 'videosIDs', id: 'id',
      skipDFP: 'skipDFP', skipdfp: 'skipdfp', autoPlay: 'autoPlay', startMuted: 'startMuted', maxQuality: 'maxQuality', quality: 'quality',
      chromeless: 'chromeless', isLive: 'isLive', live: 'live', allowRestrictedContent: 'allowRestrictedContent',
      preventBlackBars: 'preventBlackBars', globoId: 'globoId', token: 'token', adAccountId: 'adAccountId', adCmsId: 'adCmsId',
      siteName: 'siteName', width: 'width', height: 'height', heightMobile: 'heightMobile', showCaption: 'showCaption',
      alignment: 'alignment', loop: 'loop'
    };
    
    for (const [field, prop] of Object.entries(fieldMappings)) {
      const regex = new RegExp(`${field}:\\s*([^\\n<]*)`);
      const match = block.match(regex);
      if (match) {
        paragraph[prop] = decodeHTMLEntities(match[1].trim());
      }
    }
    
    // 🔧 VALIDAÇÃO: Log de ScrollyTelling processado
    if (['scrollytelling', 'scrolly'].includes(paragraph.type?.toLowerCase())) {
      const stepsCount = paragraph.steps?.length || 0;
      console.log(`🎬 ScrollyTelling processado: ${stepsCount} steps`);
      
      if (stepsCount === 0) {
        console.warn(`⚠️ ScrollyTelling sem steps detectado. Bloco:`, block.substring(0, 200));
      } else {
        paragraph.steps.forEach((step, index) => {
          console.log(`   Step ${index + 1}: "${step.title?.substring(0, 30)}..." | Imagem: ${!!step.image} | Vídeo: ${!!step.video}`);
        });
      }
    }
    
    if (paragraph.type) {
      paragraphs.push(paragraph);
    }
  }
  return paragraphs;
}

function cleanAndFormatHTML(html) {
  if (!html) return '';
  
  let cleanedHtml = decodeHTMLEntities(html);
  
  // 🔧 CORREÇÃO: Converte crases em aspas simples
  cleanedHtml = cleanedHtml.replace(/`/g, "'");
  
  // Preserva formatação HTML do Google Docs
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*font-weight:\s*(?:bold|[7-9]\d\d|700|800|900)[^"]*"[^>]*>(.*?)<\/\1>/gi, '<strong>$2</strong>');
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/\1>/gi, '<em>$2</em>');
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*text-decoration[^"]*underline[^"]*"[^>]*>(.*?)<\/\1>/gi, '<u>$2</u>');
  cleanedHtml = cleanedHtml.replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '<a href="$1">$2</a>');
  
  // Conversão de listas com bullet points
  const listRegex = /((?:[•*-]\s.*)(?:<br\s*\/?>\s*[•*-]\s.*)*)/g;
  cleanedHtml = cleanedHtml.replace(listRegex, (listBlock) => {
    const items = listBlock.split(/<br\s*\/?>/gi)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => `<li>${item.replace(/^[•*-]\s/, '').trim()}</li>`)
      .join('');
    return items ? `<ul>${items}</ul>` : '';
  });

  // Remove tags de estrutura do Google Docs
  cleanedHtml = cleanedHtml.replace(/<\/?(span|p|div)[^>]*>/gi, '');
  
  return cleanedHtml.trim();
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('❌ Use: npm run fetch DOC_ID');
  process.exit(1);
}

fetchGoogleDoc(args[0]);