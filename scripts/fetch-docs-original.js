// scripts/fetch-docs.js - VERSÃO CORRIGIDA PARA TÍTULO
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
    
    // ✅ CORREÇÃO: Parse com detecção correta do título
    const data = parseHTMLFormat(rawHtml);
    
    // ✅ NOVO: Buscar título da página (tag <title>) se não encontrou no conteúdo
    if (!data.title) {
      console.log('🔍 Título não encontrado no conteúdo, buscando na tag <title>...');
      data.title = extractTitleFromHTML(rawHtml);
    }
    
    // Gerar slug baseado no título real
    if (!data.slug) {
      data.slug = generateSlug(data.title || `doc-${Date.now()}`);
    }
    
    const outputDir = path.join(__dirname, '../static/data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filename = `${data.slug}.json`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    
    console.log(`\n✅ Sucesso! Arquivo salvo: ${filename}`);
    console.log(`📝 Título: ${data.title || 'Não encontrado'}`);
    console.log(`🔗 Slug: ${data.slug}`);
    console.log(`📊 Intro: ${data.intro ? 'OK' : 'Vazio'}`);
    console.log(`📊 Paragraphs: ${data.paragraphs ? data.paragraphs.length : 0} itens`);
    console.log(`📝 Créditos: ${data.credits ? 'OK' : 'Vazio'}`);

    // Debug específico para VideoScrollytelling
    const videoScrollyComponents = data.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (videoScrollyComponents.length > 0) {
      console.log(`🎬 VideoScrollytelling encontrados: ${videoScrollyComponents.length}`);
      videoScrollyComponents.forEach((comp, index) => {
        const stepsCount = comp.steps?.length || 0;
        console.log(`  ${index + 1}. Video: ${comp.videoSrc ? '✅' : '❌'} | Mobile: ${comp.videoSrcMobile ? '✅' : '❌'}`);
        console.log(`     Frames: ${comp.frameStart || 1}-${comp.frameStop || 'N/A'} | Prefix: ${comp.imagePrefix ? '✅' : '❌'}`);
        console.log(`     Segundos: ${comp.frameStartSeconds || 0}s-${comp.frameStopSeconds || 'N/A'}s`);
        console.log(`     Steps: ${stepsCount} | FullWidth: ${comp.fullWidth !== false}`);
      });
    }

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
 * ✅ NOVO: Extrair título da tag <title> do HTML
 */
function extractTitleFromHTML(html) {
  // 1. Tentar pegar da tag <title>
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    let title = titleMatch[1].trim();
    
    // Limpar sufixos comuns do Google Docs
    title = title.replace(/\s*-\s*Google\s*(Docs|Drive)$/i, '');
    title = title.replace(/\s*-\s*Documentos\s*Google$/i, '');
    
    if (title && title.length > 0) {
      console.log(`📄 Título extraído da tag <title>: "${title}"`);
      return decodeHTMLEntities(title);
    }
  }
  
  // 2. Tentar pegar do primeiro h1 ou elemento com grande destaque
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    const h1Title = h1Match[1].replace(/<[^>]*>/g, '').trim();
    if (h1Title && h1Title.length > 0) {
      console.log(`📄 Título extraído do H1: "${h1Title}"`);
      return decodeHTMLEntities(h1Title);
    }
  }
  
  // 3. Tentar pegar texto em destaque no início do documento
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const bodyContent = bodyMatch[1];
    
    // Procurar por texto grande/destacado no início
    const largeTextMatch = bodyContent.match(/<[^>]*(?:font-size:\s*(?:2[0-9]|[3-9][0-9]|1[0-9][0-9])(?:px|pt)|font-weight:\s*(?:bold|[7-9]00))[^>]*>(.*?)<\/[^>]*>/i);
    if (largeTextMatch) {
      const largeTitle = largeTextMatch[1].replace(/<[^>]*>/g, '').trim();
      if (largeTitle && largeTitle.length > 0 && largeTitle.length < 100) {
        console.log(`📄 Título extraído do texto destacado: "${largeTitle}"`);
        return decodeHTMLEntities(largeTitle);
      }
    }
  }
  
  console.warn('⚠️ Não foi possível extrair título do documento');
  return null;
}

/**
 * ✅ NOVO: Gerar slug limpo e amigável
 */
function generateSlug(title) {
  if (!title) return `doc-${Date.now()}`;
  
  return title
    .toLowerCase()
    .normalize('NFD') // Normalizar acentos
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Manter apenas letras, números, espaços e hífens
    .replace(/\s+/g, '-') // Espaços → hífens
    .replace(/-+/g, '-') // Múltiplos hífens → um hífen
    .replace(/^-|-$/g, '') // Remover hífens do início/fim
    .substring(0, 50) // Limitar tamanho
    .replace(/-$/, ''); // Remover hífen final se sobrou
}

/**
 * Parse principal do HTML - SEM MUDANÇAS na lógica de componentes
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
  
  // 3. Adiciona o conteúdo solto à lista para ser parseado
  if (potentialMetaContent) {
    allBlocks.push(...parseParagraphsHTML(potentialMetaContent));
  }

  // 4. Adiciona o conteúdo dos blocos estruturados
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

  // 5. ✅ CORREÇÃO: Buscar título nos próprios componentes se existir
  const titleComponent = allBlocks.find(block => 
    block.type === 'header' || 
    (block.type === 'texto' && block.text && block.text.length < 100)
  );
  
  if (titleComponent && !data.title) {
    // Se encontrou um componente que parece ser título
    data.title = titleComponent.text?.replace(/<[^>]*>/g, '').trim();
    console.log(`📄 Título extraído dos componentes: "${data.title}"`);
  }

  // 6. O que sobrou vira os paragraphs
  data.paragraphs = allBlocks;

  // 7. Mover intro para nível superior se existir
  const introIndex = data.paragraphs.findIndex(p => p.type === 'intro');
  if (introIndex !== -1) {
    const [introBlock] = data.paragraphs.splice(introIndex, 1);
    data.intro = { text: introBlock.text };
  }

  return data;
}

// ✅ Mantém todas as outras funções iguais (sem mudanças)
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
    return [];
  }
}

// ✅ Mantém a função parseParagraphsHTML igual ao seu código atual
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

    // Tratamento especial para VideoScrollytelling (mantém seu código)
    if (['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(paragraph.type?.toLowerCase())) {
      // Props Mobile (sequência de imagens)
      const frameStartMatch = block.match(/frameStart:\s*([^\n<]+)/i);
      if (frameStartMatch) {
        paragraph.frameStart = parseInt(frameStartMatch[1].trim()) || 1;
      }
      const frameStopMatch = block.match(/frameStop:\s*([^\n<]+)/i);
      if (frameStopMatch) {
        paragraph.frameStop = parseInt(frameStopMatch[1].trim()) || 100;
      }
      const imagePrefixMatch = block.match(/imagePrefix:\s*([^\n<]+)/i);
      if (imagePrefixMatch) {
        paragraph.imagePrefix = imagePrefixMatch[1].trim();
      }
      const imageSuffixMatch = block.match(/imageSuffix:\s*([^\n<]+)/i);
      if (imageSuffixMatch) {
        paragraph.imageSuffix = imageSuffixMatch[1].trim();
      }
      const imagePrefixMobileMatch = block.match(/imagePrefixMobile:\s*([^\n<]+)/i);
      if (imagePrefixMobileMatch) {
        paragraph.imagePrefixMobile = imagePrefixMobileMatch[1].trim();
      }
      const imageSuffixMobileMatch = block.match(/imageSuffixMobile:\s*([^\n<]+)/i);
      if (imageSuffixMobileMatch) {
        paragraph.imageSuffixMobile = imageSuffixMobileMatch[1].trim();
      }
      // Props Desktop (vídeo)
      const frameStartSecondsMatch = block.match(/frameStartSeconds:\s*([^\n<]+)/i);
      if (frameStartSecondsMatch) {
        paragraph.frameStartSeconds = parseFloat(frameStartSecondsMatch[1].trim()) || 0;
      }
      const frameStopSecondsMatch = block.match(/frameStopSeconds:\s*([^\n<]+)/i);
      if (frameStopSecondsMatch) {
        paragraph.frameStopSeconds = parseFloat(frameStopSecondsMatch[1].trim()) || 10;
      }
      // Props de performance
      const scrollSmoothnessMatch = block.match(/scrollSmoothness:\s*([^\n<]+)/i);
      if (scrollSmoothnessMatch) {
        paragraph.scrollSmoothness = parseFloat(scrollSmoothnessMatch[1].trim()) || 0.05;
      }
      const preloadFramesMatch = block.match(/preloadFrames:\s*([^\n<]+)/i);
      if (preloadFramesMatch) {
        paragraph.preloadFrames = parseInt(preloadFramesMatch[1].trim()) || 8;
      }
      const frameRateMatch = block.match(/frameRate:\s*([^\n<]+)/i);
      if (frameRateMatch) {
        paragraph.frameRate = parseInt(frameRateMatch[1].trim()) || 30;
      }
    }

    // Tratamento para SectionWrapper (mantém seu código)
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
      const heightMatch = block.match(/height:\s*([^\n<]+)/);
      if (heightMatch) {
        paragraph.height = heightMatch[1].trim();
      }
      const paddingMatch = block.match(/padding:\s*([^\n<]+)/);
      if (paddingMatch) {
        paragraph.padding = paddingMatch[1].trim();
      }
    }

    // Parse de texto (mantém seu regex completo)
    const textMatch = block.match(/text:\s*([\s\S]*?)(?=(?:backgroundImage|backgroundImageMobile|backgroundVideo|backgroundVideoMobile|backgroundPosition|backgroundPositionMobile|author|role|src|videoSrc|videoSrcMobile|caption|credit|alt|fullWidth|variant|size|orientation|autoplay|controls|poster|images|items|steps|beforeImage|afterImage|beforeLabel|afterLabel|image|height|heightMobile|speed|content|overlay|layout|columns|interval|showDots|showArrows|stickyHeight|videoId|videosIDs|id|skipDFP|skipdfp|autoPlay|startMuted|maxQuality|quality|chromeless|isLive|live|allowRestrictedContent|preventBlackBars|globoId|token|adAccountId|adCmsId|siteName|width|textPosition|textPositionMobile|textAlign|textAlignMobile|title|subtitle|date|theme|videoAspectRatio|showProgress|showTime|showControls|padding|paddingMobile|children|imagePrefix|imagePrefixMobile|imageSuffix|imageSuffixMobile|totalFrames|preloadFrames|bufferSize|smoothTransition|lazyLoading|fallbackFrames|posterImage|frameStart|frameStop|frameStartSeconds|frameStopSeconds|scrollSmoothness|frameRate):|type:|$)/si);
    if (textMatch) {
      if (['texto', 'frase', 'intro'].includes(paragraph.type)) {
        paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
      } else {
        paragraph.text = decodeHTMLEntities(textMatch[1].trim().replace(/<[^>]*>/g, ' ')).replace(/\s\s+/g, ' ').trim();
      }
    }
    
    // Parse de arrays JSON (mantém seu código)
    const jsonFields = ['images', 'items', 'steps', 'children', 'fallbackFrames'];
    for (const field of jsonFields) {
      const regex = new RegExp(`${field}:\\s*(\\[[\\s\\S]*?\\])`, 'i');
      const match = block.match(regex);
      if (match) {
        paragraph[field] = parseJSONField(match[1], field);
      }
    }

    // Parse de campos individuais (mantém todos seus regexes)
    const fieldRegexes = {
      backgroundImage: /backgroundImage:\s*([^\n<]+)/,
      backgroundImageMobile: /backgroundImageMobile:\s*([^\n<]+)/,
      backgroundVideo: /backgroundVideo:\s*([^\n<]+)/,
      backgroundVideoMobile: /backgroundVideoMobile:\s*([^\n<]+)/,
      backgroundPosition: /backgroundPosition:\s*([^\n<]+)/,
      backgroundPositionMobile: /backgroundPositionMobile:\s*([^\n<]+)/,
      author: /author:\s*([^\n<]+)/,
      role: /role:\s*([^\n<]+)/,
      src: /src:\s*([^\n<]+)/,
      videoSrc: /videoSrc:\s*([^\n<]+)/,
      videoSrcMobile: /videoSrcMobile:\s*([^\n<]+)/,
      caption: /caption:\s*([^\n<]+)/,
      credit: /credit:\s*([^\n<]+)/,
      alt: /alt:\s*([^\n<]+)/,
      fullWidth: /fullWidth:\s*([^\n<]+)/,
      variant: /variant:\s*([^\n<]+)/,
      size: /size:\s*([^\n<]+)/,
      orientation: /orientation:\s*([^\n<]+)/,
      autoplay: /autoplay:\s*([^\n<]+)/,
      controls: /controls:\s*([^\n<]+)/,
      poster: /poster:\s*([^\n<]+)/,
      beforeImage: /beforeImage:\s*([^\n<]+)/,
      afterImage: /afterImage:\s*([^\n<]+)/,
      beforeLabel: /beforeLabel:\s*([^\n<]+)/,
      afterLabel: /afterLabel:\s*([^\n<]+)/,
      image: /image:\s*([^\n<]+)/,
      height: /height:\s*([^\n<]+)/,
      heightMobile: /heightMobile:\s*([^\n<]+)/,
      speed: /speed:\s*([^\n<]+)/,
      content: /content:\s*([^\n<]+)/,
      overlay: /overlay:\s*([^\n<]+)/,
      layout: /layout:\s*([^\n<]+)/,
      columns: /columns:\s*([^\n<]+)/,
      interval: /interval:\s*([^\n<]+)/,
      showDots: /showDots:\s*([^\n<]+)/,
      showArrows: /showArrows:\s*([^\n<]+)/,
      stickyHeight: /stickyHeight:\s*([^\n<]+)/,
      videoId: /videoId:\s*([^\n<]+)/,
      videosIDs: /videosIDs:\s*([^\n<]+)/,
      id: /id:\s*([^\n<]+)/,
      skipDFP: /skipDFP:\s*([^\n<]+)/,
      autoPlay: /autoPlay:\s*([^\n<]+)/,
      startMuted: /startMuted:\s*([^\n<]+)/,
      maxQuality: /maxQuality:\s*([^\n<]+)/,
      quality: /quality:\s*([^\n<]+)/,
      chromeless: /chromeless:\s*([^\n<]+)/,
      isLive: /isLive:\s*([^\n<]+)/,
      live: /live:\s*([^\n<]+)/,
      allowRestrictedContent: /allowRestrictedContent:\s*([^\n<]+)/,
      preventBlackBars: /preventBlackBars:\s*([^\n<]+)/,
      globoId: /globoId:\s*([^\n<]+)/,
      token: /token:\s*([^\n<]+)/,
      adAccountId: /adAccountId:\s*([^\n<]+)/,
      adCmsId: /adCmsId:\s*([^\n<]+)/,
      siteName: /siteName:\s*([^\n<]+)/,
      width: /width:\s*([^\n<]+)/,
      textPosition: /textPosition:\s*([^\n<]+)/,
      textPositionMobile: /textPositionMobile:\s*([^\n<]+)/,
      textAlign: /textAlign:\s*([^\n<]+)/,
      textAlignMobile: /textAlignMobile:\s*([^\n<]+)/,
      title: /title:\s*([^\n<]+)/,
      subtitle: /subtitle:\s*([^\n<]+)/,
      date: /date:\s*([^\n<]+)/,
      theme: /theme:\s*([^\n<]+)/,
      videoAspectRatio: /videoAspectRatio:\s*([^\n<]+)/,
      showProgress: /showProgress:\s*([^\n<]+)/,
      showTime: /showTime:\s*([^\n<]+)/,
      showControls: /showControls:\s*([^\n<]+)/,
      padding: /padding:\s*([^\n<]+)/,
      paddingMobile: /paddingMobile:\s*([^\n<]+)/,
      totalFrames: /totalFrames:\s*([^\n<]+)/,
      preloadFrames: /preloadFrames:\s*([^\n<]+)/,
      bufferSize: /bufferSize:\s*([^\n<]+)/,
      smoothTransition: /smoothTransition:\s*([^\n<]+)/,
      lazyLoading: /lazyLoading:\s*([^\n<]+)/,
      posterImage: /posterImage:\s*([^\n<]+)/
    };

    for (const [field, regex] of Object.entries(fieldRegexes)) {
      const match = block.match(regex);
      if (match) {
        let value = decodeHTMLEntities(match[1].trim());
        
        // Processar campos de texto especiais
        if (['caption', 'credit', 'content', 'beforeLabel', 'afterLabel'].includes(field)) {
          value = cleanAndFormatHTML(value);
        }
        
        paragraph[field] = value;
      }
    }

    paragraphs.push(paragraph);
  }
  
  return paragraphs;
}

function parseCreditsHTML(html) {
  const credits = {};
  const creditsTextMatch = html.match(/text:\s*([\s\S]*?)(?=\[credits\]|$)/);
  if (creditsTextMatch) {
    credits.text = cleanAndFormatHTML(creditsTextMatch[1]);
  }
  return credits;
}

function cleanAndFormatHTML(html) {
  if (!html) return '';
  
  return html
    .replace(/<span[^>]*>/g, '')
    .replace(/<\/span>/g, '')
    .replace(/<p[^>]*>/g, '')
    .replace(/<\/p>/g, '<br>')
    .replace(/<div[^>]*>/g, '')
    .replace(/<\/div>/g, '<br>')
    .replace(/(<br\s*\/?>){3,}/g, '<br><br>')
    .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Ponto de entrada
const docId = process.argv[2];
if (!docId) {
  console.log('❌ Uso: node fetch-docs.js <DOCUMENT_ID>');
  console.log('   Exemplo: node fetch-docs.js 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  process.exit(1);
}

fetchGoogleDoc(docId);