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
  const entities = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&aacute;': 'á', '&agrave;': 'à', '&acirc;': 'â', '&atilde;': 'ã', '&auml;': 'ä', '&eacute;': 'é', '&egrave;': 'è', '&ecirc;': 'ê', '&euml;': 'ë', '&iacute;': 'í', '&igrave;': 'ì', '&icirc;': 'î', '&iuml;': 'ï', '&oacute;': 'ó', '&ograve;': 'ò', '&ocirc;': 'ô', '&otilde;': 'õ', '&ouml;': 'ö', '&uacute;': 'ú', '&ugrave;': 'ù', '&ucirc;': 'û', '&uuml;': 'ü', '&ccedil;': 'ç', '&ntilde;': 'ñ' };
  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => entities[entity] || entity);
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
    
    const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:backgroundImage|backgroundImageMobile|backgroundVideo|backgroundVideoMobile|backgroundPosition|backgroundPositionMobile|author|role|src|caption|credit|alt|fullWidth|variant|size|orientation|autoplay|controls|poster|images|items|steps|beforeImage|afterImage|beforeLabel|afterLabel|image|height|heightMobile|speed|content|overlay|layout|columns|interval|showDots|showArrows|stickyHeight|videoId|videosIDs|id|skipDFP|skipdfp|autoPlay|startMuted|maxQuality|quality|chromeless|isLive|live|allowRestrictedContent|preventBlackBars|globoId|token|adAccountId|adCmsId|siteName|width|textPosition|textPositionMobile|textAlign|textAlignMobile):|type:|$)/s);
    if (textMatch) {
        if (paragraph.type === 'texto') {
            paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
        } else {
            paragraph.text = decodeHTMLEntities(textMatch[1].trim().replace(/<[^>]*>/g, ' '));
        }
    }
    
    const jsonFields = ['images', 'items', 'steps'];
    for (const field of jsonFields) {
        const regex = new RegExp(`${field}:\\s*(\\[[\\s\\S]*?\\])`);
        const match = block.match(regex);
        if (match) {
            try {
                let jsonString = match[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/,\s*\]/g, ']').replace(/,\s*}/g, '}').replace(/\n/g, ' ').replace(/\s+/g, ' ');
                let parsedArray = JSON.parse(jsonString);
                if (Array.isArray(parsedArray)) {
                  parsedArray.forEach(item => {
                    if (item.title) item.title = decodeHTMLEntities(item.title);
                    if (item.text) item.text = decodeHTMLEntities(item.text);
                    if (item.caption) item.caption = decodeHTMLEntities(item.caption);
                  });
                }
                paragraph[field] = parsedArray;
            } catch (e) {
                console.warn(`⚠️ Erro ao processar JSON para o campo '${field}':`, e);
                paragraph[field] = [];
            }
        }
    }

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
    
    if (paragraph.type) {
      paragraphs.push(paragraph);
    }
  }
  return paragraphs;
}

function cleanAndFormatHTML(html) {
  if (!html) return '';
  
  let cleanedHtml = decodeHTMLEntities(html);
  
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*font-weight:\s*(?:bold|[7-9]\d\d|700|800|900)[^"]*"[^>]*>(.*?)<\/\1>/gi, '<strong>$2</strong>');
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/\1>/gi, '<em>$2</em>');
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*text-decoration[^"]*underline[^"]*"[^>]*>(.*?)<\/\1>/gi, '<u>$2</u>');
  cleanedHtml = cleanedHtml.replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '<a href="$1">$2</a>');
  
  // ▼▼▼ ADIÇÃO CIRÚRGICA PARA CORRIGIR APENAS A LISTA DE BULLETS ▼▼▼
  // Esta regex encontra um bloco de texto que contém itens de lista (iniciados com •, * ou -) separados por <br>.
  // Ela transforma APENAS esse bloco em uma lista <ul>, sem afetar o resto do texto.
  const listRegex = /((?:[•*-]\s.*)(?:<br\s*\/?>\s*[•*-]\s.*)*)/g;
  cleanedHtml = cleanedHtml.replace(listRegex, (listBlock) => {
    const items = listBlock.split(/<br\s*\/?>/gi)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => `<li>${item.replace(/^[•*-]\s/, '').trim()}</li>`)
      .join('');
    return items ? `<ul>${items}</ul>` : '';
  });

  cleanedHtml = cleanedHtml.replace(/<\/?(span|p|div)[^>]*>/gi, '');
  
  return cleanedHtml.trim();
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('❌ Use: npm run fetch DOC_ID');
  process.exit(1);
}

fetchGoogleDoc(args[0]);