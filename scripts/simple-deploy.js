#!/usr/bin/env node

// scripts/simple-deploy.js
// Deploy SIMPLES que USA A CONFIGURAÇÃO CENTRAL!

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import PROJECT_CONFIG from '../project.config.js';  // ← USA A CONFIG CENTRAL!

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

class SimpleDeploy {
  constructor(projectName) {
    // Pega TUDO da configuração central!
    this.config = PROJECT_CONFIG;
    this.projectName = projectName || this.config.projectName;
    this.buildDir = path.join(rootDir, 'build');
    
    // URLs do projeto config
    this.baseUrl = this.config.cdn.baseUrl;
    // CORREÇÃO: API usa globoi, não glbimg!
    this.adminUrl = this.config.cdn.baseUrl.replace('https://s3.glbimg.com', 'https://api.s3.globoi.com');
    this.container = this.config.cdn.container;
    
    // Credenciais do projeto config
    this.credentials = this.config.vault;
    
    this.authToken = null;
  }

  async authenticate() {
    console.log('🔐 Autenticando...');
    
    const authPayload = {
      auth: {
        identity: {
          methods: ['password'],
          password: {
            user: {
              name: this.credentials.username,
              domain: { name: 'default' },
              password: this.credentials.password
            }
          }
        },
        scope: {
          project: {
            name: this.credentials.projectAuth,
            domain: { name: 'default' }
          }
        }
      }
    };

    try {
      const response = await fetch(`${this.credentials.authUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload)
      });

      if (!response.ok) {
        throw new Error(`Autenticação falhou: ${response.status}`);
      }

      this.authToken = response.headers.get('x-subject-token');
      console.log('✅ Autenticado!');
      
    } catch (error) {
      console.error('❌ Erro na autenticação:', error.message);
      throw error;
    }
  }

  async uploadFile(localPath, remotePath) {
    const fileContent = await fs.readFile(localPath);
    const uploadUrl = `${this.adminUrl}/${this.container}/${this.projectName}/${remotePath}`;
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': this.authToken,
          'Content-Type': this.getContentType(localPath),
          'Content-Length': fileContent.length
        },
        body: fileContent
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`\n   ❌ ${remotePath}: ${response.status} - ${errorText.substring(0, 100)}`);
        throw new Error(`Upload falhou: ${response.status}`);
      }

      return `${this.baseUrl}/${this.container}/${this.projectName}/${remotePath}`;
    } catch (error) {
      throw error;
    }
  }

  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2'
    };
    return types[ext] || 'application/octet-stream';
  }

  async getAllFiles(dir, baseDir = dir) {
    const files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath, baseDir));
      } else {
        const relativePath = path.relative(baseDir, fullPath);
        files.push({ fullPath, relativePath });
      }
    }
    
    return files;
  }

  async createContainer() {
    console.log(`📦 Verificando container ${this.container}...`);
    
    // Tentar criar o container (se já existir, não faz nada)
    const containerUrl = `${this.adminUrl}/${this.container}`;
    
    try {
      const response = await fetch(containerUrl, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': this.authToken,
          'X-Container-Read': '.r:*',  // Leitura pública
          'X-Container-Write': `${this.credentials.username}`
        }
      });
      
      if (response.ok || response.status === 202) {
        console.log(`✅ Container ${this.container} pronto`);
      } else {
        console.log(`⚠️  Container pode já existir (${response.status})`);
      }
    } catch (error) {
      console.log(`⚠️  Não foi possível verificar container: ${error.message}`);
    }
  }

  async deploy() {
    console.log('\n🚀 DEPLOY SIMPLES');
    console.log('=' .repeat(60));
    console.log(`📁 Projeto: ${this.projectName}`);
    console.log(`🌐 URL: ${this.baseUrl}/${this.container}/${this.projectName}/`);
    console.log('=' .repeat(60));

    // Verificar build
    try {
      await fs.access(this.buildDir);
    } catch {
      console.error('❌ Pasta build/ não encontrada!');
      console.error('   Execute: npm run build');
      process.exit(1);
    }

    // Autenticar
    await this.authenticate();
    
    // Criar/verificar container
    await this.createContainer();

    // Listar arquivos
    console.log('\n📦 Analisando build...');
    const files = await this.getAllFiles(this.buildDir);
    console.log(`   ${files.length} arquivos encontrados`);

    // Upload
    console.log('\n📤 Fazendo upload...');
    let uploaded = 0;
    let failed = 0;
    
    for (const file of files) {
      const remotePath = file.relativePath.replace(/\\/g, '/');
      
      try {
        await this.uploadFile(file.fullPath, remotePath);
        uploaded++;
        process.stdout.write(`\r   ✅ ${uploaded} enviados | ❌ ${failed} falhas`);
      } catch (error) {
        failed++;
        // Continue com os próximos arquivos
      }
    }

    console.log('\n\n' + '=' .repeat(60));
    if (uploaded > 0) {
      console.log(`✅ DEPLOY CONCLUÍDO! (${uploaded}/${files.length} arquivos)`);
      console.log('=' .repeat(60));
      console.log(`\n🌐 Acesse: ${this.baseUrl}/${this.container}/${this.projectName}/index.html`);
      console.log(`🎛️ Vault: https://vault.globoi.com/p/newsroom_project/storage/objects/${this.container}/${this.projectName}/`);
    } else {
      console.log('❌ DEPLOY FALHOU - Nenhum arquivo foi enviado');
      console.log('Possíveis problemas:');
      console.log('1. Container não existe ou sem permissão');
      console.log('2. Projeto já existe com outro owner');
      console.log('3. Problema de rede/conectividade');
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0] || 'especial-eleicoes-2024';
  
  const deployer = new SimpleDeploy(projectName);
  
  try {
    await deployer.deploy();
  } catch (error) {
    console.error('\n❌ Erro no deploy:', error.message);
    process.exit(1);
  }
}

// Executar
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export default SimpleDeploy;