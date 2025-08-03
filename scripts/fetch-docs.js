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
    
    // ✅ ÚNICA MUDANÇA: A chamada para a função de parse corrigida.
    const data = parseHTMLFormat(rawHtml);
    
    if (!data.title) {
      console.warn('⚠️  Aviso: O campo "title" não foi encontrado nos metadados do topo. O sistema irá procurar por um componente `type: header` nos parágrafos.');
    }
    
    if (!data.slug) {
      data.slug = (data.title || `doc-${Date.now()}`)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
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
    console.log(`📝 Créditos: ${data.credits ? 'OK' : 'Vazio'}`);

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
            console.log(`     Step ${stepIndex + 1}: "${step.title?.substring(0, 30)}..." | Imagem: ${!!step.image} | Vídeo: ${!!step.video}`);
          });
        }
      });
    }

    // 🆕 MUDANÇA 1: Adicionar detecção de VideoScrollytelling
    const videoScrollyComponents = data.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (videoScrollyComponents.length > 0) {
      console.log(`🎥 VideoScrollyTelling encontrados: ${videoScrollyComponents.length}`);
      videoScrollyComponents.forEach((comp, index) => {
        const stepsCount = comp.steps?.length || 0;
        console.log(`  ${index + 1}. Steps: ${stepsCount} | VideoSrc: ${!!comp.videoSrc || !!comp.src} | Mobile: ${!!comp.videoSrcMobile || !!comp.srcMobile}`);
        console.log(`     🖼️ ImagePrefix: ${comp.imagePrefix ? 'SIM' : 'NÃO'} | Mobile: ${comp.imagePrefixMobile ? 'SIM' : 'NÃO'} | Frames: ${comp.totalFrames || 0}`);
        
        if (stepsCount === 0) {
          console.warn(`⚠️ VideoScrollyTelling sem steps: ${comp.text?.substring(0, 50)}...`);
        } else {
          comp.steps.forEach((step, stepIndex) => {
            console.log(`     Step ${stepIndex + 1}: "${step.title?.substring(0, 30)}..." | Time: ${step.time}s`);
          });
        }
        
        // 🔍 Diagnóstico para iOS
        if (!comp.imagePrefix && !comp.imagePrefixMobile && !comp.fallbackFrames?.length) {
          console.warn(`⚠️ VideoScrollyTelling ${index + 1}: Sem imagens configuradas para iOS!`);
          console.warn(`   Adicione: imagePrefix, imagePrefixMobile e totalFrames`);
        }
      });
    }

    // 🆕 MUDANÇA 2: Adicionar detecção de SectionWrapper
    const sectionComponents = data.paragraphs?.filter(p => 
      ['section', 'secao', 'section-wrapper', 'wrapper'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (sectionComponents.length > 0) {
      console.log(`🗂️ SectionWrapper encontrados: ${sectionComponents.length}`);
      sectionComponents.forEach((comp, index) => {
        console.log(`  ${index + 1}. ID: ${comp.id || 'sem-id'} | Background: ${!!comp.backgroundImage} | Height: ${comp.height || 'auto'}`);
        if (comp.children && comp.children.length > 0) {
          console.log(`     Children: ${comp.children.length} componentes`);
        }
      });
    }
    
    return data;
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

/**
 * ✅ FUNÇÃO CORRIGIDA: Esta versão respeita a ordem e a estrutura do seu .docs
 * Ela não mistura mais os dados dos componentes.
 */
function parseHTMLFormat(html) {
  html = html.replace(/<style[^>]*>.*?<\/style>/gs, '');
  html = html.replace(/<script[^>]*>.*?<\/script>/gs, '');
  html = html.replace(/<head[^>]*>.*?<\/head>/gs, '');

  const data = {};
  let allBlocks = [];

  // 1. Pega todo o conteúdo do body para análise
  const bodyContentMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/s);
  if (!bodyContentMatch) {
    console.warn("⚠️ Tag <body> não encontrada. Analisando o HTML completo.");
    bodyContentMatch = [null, html];
  }
  let bodyContent = bodyContentMatch[1];

  // 2. Separa os blocos estruturados ([+...]) do conteúdo solto
  const blockRegex = /\[(?:\+)?(paragraphs|intro|credits)\]([\s\S]*?)\[\1\]/gs;
  
  const potentialMetaContent = bodyContent.replace(blockRegex, '').trim();
  const blocks = [...bodyContent.matchAll(blockRegex)];
  
  // 3. Adiciona o conteúdo solto (que deve ser seu header principal) à lista para ser parseado
  if (potentialMetaContent) {
      allBlocks.push(...parseParagraphsHTML(potentialMetaContent));
  }

  // 4. Adiciona o conteúdo dos blocos estruturados na ordem em que aparecem
  blocks.forEach(blockMatch => {
      const blockType = blockMatch[1];
      const blockContent = blockMatch[2];

      if (blockType === 'paragraphs') {
          allBlocks.push(...parseParagraphsHTML(blockContent));
      } else if (blockType === 'intro') {
          const introData = parseIntroHTML(blockContent);
          if (introData.text) {
              allBlocks.push({ type: 'intro', ...introData });
          }
      } else if (blockType === 'credits') {
          data.credits = parseCreditsHTML(blockContent);
      }
  });

  // 5. MUDANÇA: NÃO pegar automaticamente o primeiro header como metadados principais
  // Deixar todos os headers ficarem nos paragraphs para evitar duplicação
  
  // 6. Buscar metadados apenas em blocos específicos de metadados (não em headers dos paragraphs)
  const metaRegex = /(?:^|\n)\s*title:\s*([^<\n]+)/i;
  const titleMatch = bodyContent.match(metaRegex);
  if (titleMatch && !bodyContent.includes('type:')) {
    // Só pega o title se não estiver dentro de um bloco com 'type:'
    data.title = decodeHTMLEntities(titleMatch[1].trim());
  }

  // 7. O que sobrou na lista vira o `paragraphs` do JSON (mantém TODOS os headers)
  data.paragraphs = allBlocks;

  const introIndex = data.paragraphs.findIndex(p => p.type === 'intro');
  if (introIndex !== -1) {
      const [introBlock] = data.paragraphs.splice(introIndex, 1);
      data.intro = { text: introBlock.text };
  }

  return data;
}

function parseIntroHTML(html) {
    const intro = {};
    const introTextMatch = html.match(/text:\s*([\s\S]*?)(?=\[intro\]|$)/);
    if (introTextMatch) {
      intro.text = cleanAndFormatHTML(introTextMatch[1]);
    }
    return intro;
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

function parseJSONField(jsonString, fieldName) {
  if (!jsonString) return null;
  
  try {
    let cleanJson = jsonString
      .replace(/<[^>]*>/g, '') 
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/,\s*\]/g, ']')
      .replace(/,\s*}/g, '}')
      .replace(/["""„‟«»"‶‷"″‟‹›]/g, '"') 
      .replace(/['''‚‛‹›]/g, "'") 
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*,\s*/g, ',')
      .trim();
    
    let parsed = JSON.parse(cleanJson);
    
    if (Array.isArray(parsed)) {
      parsed = parsed.map(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => {
            if (typeof item[key] === 'string') {
              item[key] = decodeHTMLEntities(item[key]);
              if (['text', 'caption', 'content'].includes(key)) {
                item[key] = cleanAndFormatHTML(item[key]);
              }
            }
          });
        }
        return item;
      });
    }
    
    return parsed;
    
  } catch (error) {
    console.warn(`⚠️ Erro ao parsear ${fieldName}:`, error.message);
    console.log('JSON problemático:', jsonString.substring(0, 200));
    
    try {
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

    // 🆕 NOVO: Tratamento para SectionWrapper
    if (['section', 'secao', 'section-wrapper', 'wrapper'].includes(paragraph.type?.toLowerCase())) {
      const idMatch = block.match(/id:\s*([^\n<]+)/);
      if (idMatch) {
        paragraph.id = idMatch[1].trim();
      }

      const backgroundImageMatch = block.match(/backgroundImage:\s*([^\n<]+)/);
      if (backgroundImageMatch) {
        paragraph.backgroundImage = backgroundImageMatch[1].trim();
      }

      const backgroundImageMobileMatch = block.match(/backgroundImageMobile:\s*([^\n<]+)/);
      if (backgroundImageMobileMatch) {
        paragraph.backgroundImageMobile = backgroundImageMobileMatch[1].trim();
      }

      const backgroundPositionMatch = block.match(/backgroundPosition:\s*([^\n<]+)/);
      if (backgroundPositionMatch) {
        paragraph.backgroundPosition = backgroundPositionMatch[1].trim();
      }

      const backgroundPositionMobileMatch = block.match(/backgroundPositionMobile:\s*([^\n<]+)/);
      if (backgroundPositionMobileMatch) {
        paragraph.backgroundPositionMobile = backgroundPositionMobileMatch[1].trim();
      }

      const heightMatch = block.match(/height:\s*([^\n<]+)/);
      if (heightMatch) {
        paragraph.height = heightMatch[1].trim();
      }

      const heightMobileMatch = block.match(/heightMobile:\s*([^\n<]+)/);
      if (heightMobileMatch) {
        paragraph.heightMobile = heightMobileMatch[1].trim();
      }

      const paddingMatch = block.match(/padding:\s*([^\n<]+)/);
      if (paddingMatch) {
        paragraph.padding = paddingMatch[1].trim();
      }

      const paddingMobileMatch = block.match(/paddingMobile:\s*([^\n<]+)/);
      if (paddingMobileMatch) {
        paragraph.paddingMobile = paddingMobileMatch[1].trim();
      }

      const overlayMatch = block.match(/overlay:\s*([^\n<]+)/);
      if (overlayMatch) {
        paragraph.overlay = overlayMatch[1].trim();
      }

      const contentMatch = block.match(/content:\s*(.*?)(?=\s*(?:type:|$))/s);
      if (contentMatch) {
        paragraph.content = cleanAndFormatHTML(contentMatch[1].trim());
      }

      // Para futuro: children array (caso queira implementar)
      const childrenMatch = block.match(/children:\s*(\[[\s\S]*?\])/);
      if (childrenMatch) {
        paragraph.children = parseJSONField(childrenMatch[1], 'section children');
      }
      
      paragraphs.push(paragraph);
      continue;
    }

    if (['flourish', 'flourish-scrolly', 'grafico', 'mapa'].includes(paragraph.type)) {
      const srcMatch = block.match(/src:\s*([^\n<]+)/);
      if (srcMatch) {
        paragraph.src = srcMatch[1].trim();
      }

      const stepsMatch = block.match(/steps:\s*(\[[\s\S]*?\])/);
      if (stepsMatch) {
        paragraph.steps = parseJSONField(stepsMatch[1], 'flourish steps');
      }
      
      paragraphs.push(paragraph);
      continue;
    }

    // 🆕 MUDANÇA 2: Adicionar tratamento específico para VideoScrollytelling no regex do textMatch
    const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:backgroundImage|backgroundImageMobile|backgroundVideo|backgroundVideoMobile|backgroundPosition|backgroundPositionMobile|author|role|src|videoSrc|videoSrcMobile|caption|credit|alt|fullWidth|variant|size|orientation|autoplay|controls|poster|images|items|steps|beforeImage|afterImage|beforeLabel|afterLabel|image|height|heightMobile|speed|content|overlay|layout|columns|interval|showDots|showArrows|stickyHeight|videoId|videosIDs|id|skipDFP|skipdfp|autoPlay|startMuted|maxQuality|quality|chromeless|isLive|live|allowRestrictedContent|preventBlackBars|globoId|token|adAccountId|adCmsId|siteName|width|textPosition|textPositionMobile|textAlign|textAlignMobile|title|subtitle|date|theme|videoAspectRatio|showProgress|showTime|showControls|padding|paddingMobile|children|imagePrefix|imagePrefixMobile|totalFrames|preloadFrames|bufferSize|smoothTransition|lazyLoading|fallbackFrames|posterImage):|type:|$)/si);
    if (textMatch) {
      if (['texto', 'frase', 'intro'].includes(paragraph.type)) {
        paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
      } else {
        paragraph.text = decodeHTMLEntities(textMatch[1].trim().replace(/<[^>]*>/g, ' ')).replace(/\s\s+/g, ' ').trim();
      }
    }
    
    const jsonFields = ['images', 'items', 'steps', 'children', 'fallbackFrames'];
    for (const field of jsonFields) {
      const regex = new RegExp(`${field}:\\s*(\\[[\\s\\S]*?\\])`, 'i');
      const match = block.match(regex);
      if (match) {
        paragraph[field] = parseJSONField(match[1], field);
      }
    }

    // 🆕 MUDANÇA 3: Adicionar os novos campos do VideoScrollytelling + SectionWrapper no fieldMappings
    const fieldMappings = {
      title: 'title', subtitle: 'subtitle', date: 'date', theme: 'theme',
      backgroundImage: 'backgroundImage', backgroundImageMobile: 'backgroundImageMobile', backgroundVideo: 'backgroundVideo',
      backgroundVideoMobile: 'backgroundVideoMobile', backgroundPosition: 'backgroundPosition', backgroundPositionMobile: 'backgroundPositionMobile',
      textPosition: 'textPosition', textPositionMobile: 'textPositionMobile', textAlign: 'textAlign', textAlignMobile: 'textAlignMobile',
      author: 'author', role: 'role', src: 'src', videoSrc: 'videoSrc', videoSrcMobile: 'videoSrcMobile', srcMobile: 'srcMobile', caption: 'caption', credit: 'credit', alt: 'alt', fullWidth: 'fullWidth', variant: 'variant',
      size: 'size', orientation: 'orientation', autoplay: 'autoplay', controls: 'controls', poster: 'poster', overlay: 'overlay',
      layout: 'layout', columns: 'columns', interval: 'interval', showDots: 'showDots', showArrows: 'showArrows',
      stickyHeight: 'stickyHeight', beforeImage: 'beforeImage', afterImage: 'afterImage', beforeLabel: 'beforeLabel',
      afterLabel: 'afterLabel', image: 'image', speed: 'speed', content: 'content', videoId: 'videoId', videosIDs: 'videosIDs', id: 'id',
      skipDFP: 'skipDFP', skipdfp: 'skipdfp', autoPlay: 'autoPlay', startMuted: 'startMuted', maxQuality: 'maxQuality', quality: 'quality',
      chromeless: 'chromeless', isLive: 'isLive', live: 'live', allowRestrictedContent: 'allowRestrictedContent',
      preventBlackBars: 'preventBlackBars', globoId: 'globoId', token: 'token', adAccountId: 'adAccountId', adCmsId: 'adCmsId',
      siteName: 'siteName', width: 'width', height: 'height', heightMobile: 'heightMobile', showCaption: 'showCaption',
      alignment: 'alignment', loop: 'loop', videoAspectRatio: 'videoAspectRatio', aspectRatio: 'aspectRatio', 
      showProgress: 'showProgress', showTime: 'showTime', showControls: 'showControls',
      padding: 'padding', paddingMobile: 'paddingMobile', // 🆕 Campos do SectionWrapper
      
      // 🆕 CAMPOS NOVOS DO VIDEOSCROLLYTELLING:
      imagePrefix: 'imagePrefix',
      imagePrefixMobile: 'imagePrefixMobile', 
      totalFrames: 'totalFrames',
      preloadFrames: 'preloadFrames',
      bufferSize: 'bufferSize',
      smoothTransition: 'smoothTransition',
      lazyLoading: 'lazyLoading',
      posterImage: 'posterImage'
    };
    
    for (const [field, prop] of Object.entries(fieldMappings)) {
      const regex = new RegExp(`\\b${field}:\\s*([^\\n<]*)`, 'i');
      const match = block.match(regex);
      if (match) {
        const cleanedValue = (match[1] || '')
            .replace(/&nbsp;/g, ' ')
            .replace(/<[^>]*>/g, '')
            .trim();
            
        paragraph[prop] = decodeHTMLEntities(cleanedValue);
      }
    }
    
    if (paragraph.type) {
      paragraphs.push(paragraph);
    }
  }
  return paragraphs;
}

function parseCreditsHTML(html) {
  const credits = {};

  const notesMatch = html.match(/notes:\s*([\s\S]*?)(?=sources:|additionalGraphics:|editedBy:|authors:|$)/s);
  if (notesMatch) {
    credits.notes = cleanAndFormatHTML(notesMatch[1].trim());
  }

  const arrayFields = ['sources', 'additionalGraphics', 'editedBy', 'authors'];
  for (const field of arrayFields) {
    const regex = new RegExp(`${field}:\\s*([\\s\\S]*?)(?=(?:notes:|sources:|additionalGraphics:|editedBy:|authors:|\\[credits\\])|$)`, 'i');
    const match = html.match(regex);

    if (match && match[1]) {
      let rawContent = match[1];
      rawContent = rawContent.replace(/<\/?ul[^>]*>/g, '');
      rawContent = rawContent.replace(/<\/?li[^>]*>/g, '');
      rawContent = rawContent.replace(/&nbsp;/g, ' ');
      
      credits[field] = rawContent.split('- ').map(item => {
        return cleanAndFormatHTML(item.trim());
      }).filter(Boolean);
    }
  }
  return credits;
}

function cleanAndFormatHTML(html) {
  if (!html) return '';
  
  let cleanedHtml = decodeHTMLEntities(html);
  
  cleanedHtml = cleanedHtml.replace(/`/g, "'");
  
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*font-weight:\s*(?:bold|[7-9]\d\d|700|800|900)[^"]*"[^>]*>(.*?)<\/\1>/gi, '<strong>$2</strong>');
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/\1>/gi, '<em>$2</em>');
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*text-decoration[^"]*underline[^"]*"[^>]*>(.*?)<\/\1>/gi, '<u>$2</u>');
  cleanedHtml = cleanedHtml.replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '<a href="$1">$2</a>');
  
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