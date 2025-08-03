// scripts/setup-environment.js - Setup Simplificado
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

async function setupEnvironment() {
  console.log('🚀 Configurando Newsroom Storytelling System...\n');
  
  // 1. Verificar Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
  } catch (error) {
    console.error('❌ Node.js não encontrado');
    process.exit(1);
  }
  
  // 2. Verificar FFmpeg (opcional para desenvolvimento)
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    console.log('✅ FFmpeg encontrado');
  } catch (error) {
    console.log('⚠️ FFmpeg não encontrado (opcional)');
    console.log('   Para processar vídeos, instale FFmpeg:');
    
    if (process.platform === 'darwin') {
      console.log('   brew install ffmpeg');
    } else if (process.platform === 'linux') {
      console.log('   sudo apt-get install ffmpeg');
    } else {
      console.log('   https://ffmpeg.org/download.html');
    }
  }
  
  // 3. Criar diretórios necessários
  const dirs = [
    'static/data',
    'scripts',
    'generated-frames',
    'temp-videos'
  ];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`📁 Diretório verificado: ${dir}`);
    } catch (error) {
      console.log(`📁 Diretório já existe: ${dir}`);
    }
  }
  
  // 4. Verificar dependências opcionais
  const optionalDeps = ['fluent-ffmpeg', 'node-fetch', 'form-data'];
  
  console.log('\n📦 Verificando dependências opcionais...');
  for (const dep of optionalDeps) {
    try {
      await import(dep);
      console.log(`✅ ${dep} disponível`);
    } catch (error) {
      console.log(`⚠️ ${dep} não encontrado`);
      console.log(`   Instale com: npm install ${dep}`);
    }
  }
  
  // 5. Criar arquivos de exemplo se não existirem
  const exampleFiles = [
    {
      path: '.env.example',
      content: `# Configurações opcionais para desenvolvimento
GLOBO_PASSWORD=sua_senha_aqui
GOOGLE_DOCS_API_KEY=sua_api_key_aqui

# Para CI/CD
VAULT_URL=https://vault.sua-empresa.com
`
    },
    {
      path: 'scripts/config.js',
      content: `// Configurações do sistema
export const CONFIG = {
  globo: {
    username: 'u_especiais_svelte',
    authUrl: 'https://auth.s3.globoi.com:5000/v3',
    publicBaseUrl: 'https://s3.glbimg.com/v1/AUTH_9897f8564b5c46c9b6e85bda5912fe3b',
    container: 'g1'
  },
  video: {
    desktop: { fps: 10, scale: '1920:1080', quality: 2 },
    mobile: { fps: 8, scale: '800:450', quality: 4 }
  }
};
`
    }
  ];
  
  for (const file of exampleFiles) {
    try {
      await fs.access(file.path);
      console.log(`📄 Arquivo já existe: ${file.path}`);
    } catch (error) {
      await fs.writeFile(file.path, file.content);
      console.log(`📄 Arquivo criado: ${file.path}`);
    }
  }
  
  // 6. Teste básico do sistema
  console.log('\n🧪 Testando sistema básico...');
  
  try {
    // Testar se consegue importar o fetch-docs
    const fetchPath = './fetch-docs.js';
    await fs.access(fetchPath);
    console.log('✅ fetch-docs.js encontrado');
  } catch (error) {
    console.log('⚠️ fetch-docs.js não encontrado');
    console.log('   Certifique-se de ter o arquivo scripts/fetch-docs.js');
  }
  
  // 7. Instruções finais
  console.log('\n🎉 Setup básico concluído!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Para processar vídeos: npm install fluent-ffmpeg node-fetch form-data');
  console.log('2. Teste básico: npm run fetch --help');
  console.log('3. Desenvolvimento: npm run dev');
  console.log('4. Para upload Globo: configure a senha no código');
  
  console.log('\n💡 Comandos disponíveis:');
  console.log('- npm run dev                    # Servidor de desenvolvimento');
  console.log('- npm run fetch DOC_ID           # Buscar do Google Docs');
  console.log('- npm run generate-frames --help # Ver opções de vídeo');
  console.log('- npm run upload-globo --help    # Ver opções de upload');
}

async function main() {
  try {
    await setupEnvironment();
  } catch (error) {
    console.error('\n❌ Erro no setup:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { setupEnvironment };