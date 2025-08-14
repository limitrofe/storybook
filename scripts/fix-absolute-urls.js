// scripts/fix-absolute-urls.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎯 URL BASE DO SEU CDN S3
const BASE_URL = 'https://s3.glbimg.com/v1/AUTH_e03f7a1106bb438e970511f892f07c35/g1/dias-perfeitos';

async function fixAbsoluteUrls() {
  console.log('🔧 CORRIGINDO URLs PARA ABSOLUTOS...');
  console.log(`📍 URL Base: ${BASE_URL}`);
  
  const buildDir = path.join(__dirname, '../build');
  
  try {
    // 1. Processar index.html
    const indexPath = path.join(buildDir, 'index.html');
    let indexContent = await fs.readFile(indexPath, 'utf8');
    
    console.log('🔍 URLs relativos encontrados no index.html:');
    
    // Encontrar e substituir links relativos
    const patterns = [
      // CSS e JS
      { pattern: /href="\.\/([^"]+)"/g, replacement: `href="${BASE_URL}/$1"`, type: 'CSS/JS' },
      { pattern: /src="\.\/([^"]+)"/g, replacement: `src="${BASE_URL}/$1"`, type: 'Scripts' },
      
      // Assets gerais
      { pattern: /href="\/([^"]+)"/g, replacement: `href="${BASE_URL}/$1"`, type: 'Assets' },
      { pattern: /src="\/([^"]+)"/g, replacement: `src="${BASE_URL}/$1"`, type: 'Sources' },
      
      // URLs em scripts JavaScript
      { pattern: /"\/data\/([^"]+)"/g, replacement: `"${BASE_URL}/data/$1"`, type: 'Data URLs' },
      { pattern: /'\/data\/([^']+)'/g, replacement: `'${BASE_URL}/data/$1'`, type: 'Data URLs (single quotes)' },
      
      // Fetch calls
      { pattern: /fetch\("\/([^"]+)"\)/g, replacement: `fetch("${BASE_URL}/$1")`, type: 'Fetch calls' },
      { pattern: /fetch\('\/([^']+)'\)/g, replacement: `fetch('${BASE_URL}/$1')`, type: 'Fetch calls (single quotes)' },
      
      // Import statements
      { pattern: /import\("\.\/([^"]+)"\)/g, replacement: `import("${BASE_URL}/$1")`, type: 'Dynamic imports' },
      { pattern: /import\('\.\/([^']+)'\)/g, replacement: `import('${BASE_URL}/$1')`, type: 'Dynamic imports (single quotes)' }
    ];
    
    let changesCount = 0;
    
    patterns.forEach(({ pattern, replacement, type }) => {
      const matches = indexContent.match(pattern);
      if (matches) {
        console.log(`  📝 ${type}: ${matches.length} substituições`);
        matches.forEach(match => console.log(`    ${match}`));
        changesCount += matches.length;
      }
      indexContent = indexContent.replace(pattern, replacement);
    });
    
    // 2. Corrigir URLs específicos conhecidos - SEM duplicar
    const specificFixes = [
      // URLs de dados que aparecem no erro - apenas se não for http
      { from: '/data/dias-perfeitos.json', to: `${BASE_URL}/data/dias-perfeitos.json` },
      { from: '"data/dias-perfeitos.json"', to: `"${BASE_URL}/data/dias-perfeitos.json"` },
      { from: "'data/dias-perfeitos.json'", to: `'${BASE_URL}/data/dias-perfeitos.json'` },
      
      // Assets do _app - apenas se não for http
      { from: '/_app/', to: `${BASE_URL}/_app/` },
    ];
    
    specificFixes.forEach(({ from, to }) => {
      // Apenas substituir se o 'from' existir e não for duplicação
      if (indexContent.includes(from) && !indexContent.includes(to)) {
        console.log(`  🔄 Corrigindo: ${from} → ${to}`);
        indexContent = indexContent.replaceAll(from, to);
        changesCount++;
      }
    });
    
    // 3. Salvar index.html corrigido
    await fs.writeFile(indexPath, indexContent);
    console.log(`✅ index.html corrigido (${changesCount} alterações)`);
    
    // 4. Processar arquivos JavaScript no build
    const jsFiles = await findJSFiles(buildDir);
    
    for (const jsFile of jsFiles) {
      await fixJSFile(jsFile);
    }
    
    // 5. Verificar se há arquivos JSON que precisam ser corrigidos
    const dataDir = path.join(buildDir, 'data');
    try {
      await fs.access(dataDir);
      console.log('✅ Pasta data/ encontrada no build');
    } catch {
      console.log('⚠️  Pasta data/ não encontrada no build - arquivos podem estar embedados');
    }
    
    console.log('\n🎯 RESULTADO:');
    console.log(`📁 Build corrigido em: ${buildDir}`);
    console.log(`🌐 Todas as URLs agora apontam para: ${BASE_URL}`);
    console.log('\n✅ Pronto para embed em plataforma externa!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

async function findJSFiles(dir) {
  const files = [];
  
  async function scan(currentDir) {
    const items = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory()) {
        await scan(fullPath);
      } else if (item.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

async function fixJSFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const originalContent = content;
    
    // Padrões específicos para JavaScript
    const jsPatterns = [
      // Fetch URLs
      { pattern: /fetch\s*\(\s*["']\/data\/([^"']+)["']\s*\)/g, replacement: `fetch("${BASE_URL}/data/$1")` },
      { pattern: /fetch\s*\(\s*["']\.\/data\/([^"']+)["']\s*\)/g, replacement: `fetch("${BASE_URL}/data/$1")` },
      
      // Import URLs
      { pattern: /import\s*\(\s*["']\.\/([^"']+)["']\s*\)/g, replacement: `import("${BASE_URL}/$1")` },
      
      // Asset URLs em strings
      { pattern: /["']\/\_app\/([^"']+)["']/g, replacement: `"${BASE_URL}/_app/$1"` },
    ];
    
    jsPatterns.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });
    
    if (content !== originalContent) {
      await fs.writeFile(filePath, content);
      console.log(`  ✅ JS corrigido: ${path.basename(filePath)}`);
    }
    
  } catch (error) {
    console.log(`  ⚠️  Erro ao processar ${filePath}: ${error.message}`);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAbsoluteUrls();
}

export default fixAbsoluteUrls;