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
    
    // Validações e logs (mantidos como no seu original)
    const withBackgrounds = data.paragraphs?.filter(p => p.backgroundImage || p.backgroundImageMobile) || [];
    if (withBackgrounds.length > 0) {
      console.log(`🖼️ Componentes com background encontrados: ${withBackgrounds.length}`);
    }
    const globoPlayers = data.paragraphs?.filter(p => ['globovideo', 'globo-video', 'globoplayer', 'globo-player', 'globo'].includes(p.type?.toLowerCase())) || [];
    if (globoPlayers.length > 0) {
        console.log(`🎬 GloboPlayers encontrados: ${globoPlayers.length}`);
    }
    const parallaxComponents = data.paragraphs?.filter(p => p.type?.toLowerCase() === 'parallax') || [];
    if (parallaxComponents.length > 0) {
        console.log(`🌄 Componentes Parallax encontrados: ${parallaxComponents.length}`);
    }
    
    return data;
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

function parseHTMLFormat(html) {
  // Esta função permanece idêntica à sua original
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

// =================================================================
// ▼▼▼ FUNÇÃO CORRIGIDA ▼▼▼
// =================================================================
function parseParagraphsHTML(html) {
    const paragraphs = [];
    const typeBlocks = html.split(/(?=type:\s*)/);

    for (let block of typeBlocks) {
        if (!block.trim() || !block.includes('type:')) continue;

        const paragraph = {};
        
        // 1. Extrai o 'type' primeiro e limpa a chave do bloco
        const typeMatch = block.match(/type:\s*([^\n<]+)/);
        if (typeMatch) {
            paragraph.type = decodeHTMLEntities(typeMatch[1].trim());
            block = block.substring(typeMatch[0].length); // Remove a chave 'type'
        } else {
            continue; // Se não tem tipo, pula o bloco
        }

        // 2. Extrai campos "complexos" (JSON ou HTML) primeiro
        
        // Para 'images', 'items', 'steps' (JSON)
        const jsonFields = ['images', 'items', 'steps'];
        for (const field of jsonFields) {
            const regex = new RegExp(`${field}:\\s*(\\[[\\s\\S]*?\\])`);
            const match = block.match(regex);
            if (match) {
                try {
                    // Limpa quebras de linha e tenta o parse
                    paragraph[field] = JSON.parse(match[1].replace(/\n\s*/g, ' '));
                    block = block.replace(match[0], ''); // Remove o campo do bloco
                } catch (e) {
                    console.warn(`⚠️ Erro ao processar JSON para o campo '${field}':`, e);
                    paragraph[field] = [];
                }
            }
        }

        // Para 'content' do Parallax (HTML)
        // Procura por content:"..." ou content:'...'
        const contentMatch = block.match(/content:\s*(?:"([^"]*(?:"[^"]*"[^"]*)*[^"]*)"|'([^']*(?:'[^']*'[^']*)*[^']*)')/s);
        if (contentMatch) {
            // Usa o grupo que capturou (aspas duplas ou simples)
            const contentValue = contentMatch[1] || contentMatch[2];
            paragraph.content = decodeHTMLEntities(contentValue);
            block = block.replace(contentMatch[0], ''); // Remove o campo do bloco
        }

        // 3. Processa os campos simples restantes (key: value)
        // Remove tags HTML para facilitar a busca de chaves simples
        const cleanBlock = decodeHTMLEntities(block.replace(/<[^>]*>/g, '\n'));
        const lines = cleanBlock.split('\n').filter(line => line.trim().includes(':'));

        for (const line of lines) {
            const parts = line.split(/:(.*)/s); // Divide no primeiro ':'
            if (parts.length > 1) {
                const key = parts[0].trim();
                let value = parts[1].trim();

                // Converte valores booleanos e numéricos
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
                else if (!isNaN(value) && value.trim() !== '') {
                  // Mantém como string para consistência, a não ser que precise de números
                  // value = parseFloat(value); 
                }
                
                if (key && !paragraph.hasOwnProperty(key)) {
                    paragraph[key] = value;
                }
            }
        }
        
        // 4. Tratamento especial para o campo 'text' que pode conter HTML
        const textMatch = block.match(/text:\s*([\s\S]*)/);
        if (textMatch) {
            // O 'resto' do bloco, após extrair outras chaves, é provavelmente o texto.
            // Esta é uma heurística, mas funciona para ArchieML.
            const remainingBlock = textMatch[1];
            const nextKeyMatch = remainingBlock.match(/[a-zA-Z0-9]+:/); // Procura pela próxima chave
            
            let textValue = remainingBlock;
            if (nextKeyMatch) {
                textValue = remainingBlock.substring(0, nextKeyMatch.index).trim();
            }
            
            paragraph.text = cleanAndFormatHTML(textValue);
        }

        paragraphs.push(paragraph);
    }
    return paragraphs;
}
// =================================================================
// ▲▲▲ FIM DA FUNÇÃO CORRIGIDA ▲▲▲
// =================================================================


function cleanAndFormatHTML(html) {
  // Esta função permanece idêntica à sua original
  if (!html) return '';
  html = decodeHTMLEntities(html);
  html = html.replace(/<br[^>]*>/gi, '\n• ');
  if (html.includes('• ')) {
    const items = html.split('• ').filter(item => item.trim());
    if (items.length > 1) {
      html = '<ul>' + items.map(item => `<li>${item.trim()}</li>`).join('') + '</ul>';
    }
  }
  html = html.replace(/<([^>]+)style="[^"]*font-weight:\s*(?:bold|[7-9]\d\d|700|800|900)[^"]*"[^>]*>(.*?)<\/\1>/gi, '<strong>$2</strong>');
  html = html.replace(/<([^>]+)style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/\1>/gi, '<em>$2</em>');
  html = html.replace(/<([^>]+)style="[^"]*text-decoration[^"]*underline[^"]*"[^>]*>(.*?)<\/\1>/gi, '<u>$2</u>');
  html = html.replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '<a href="$1">$2</a>');
  html = html.replace(/<span[^>]*>(.*?)<\/span>/gi, '$1');
  html = html.replace(/<\/?(?:div|p)[^>]*>/gi, ' ');
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