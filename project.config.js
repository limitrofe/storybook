// project.config.js
// ⚡ CONFIGURAÇÃO CENTRAL - MUDE TUDO APENAS AQUI!

/**
 * 🎯 CONFIGURAÇÃO DO PROJETO
 */
const PROJECT_CONFIG = {
  // Nome do projeto (será a pasta no CDN)
  projectName: 'a-trama-do-golpe',
  
  // Título da página
  pageTitle: 'A trama do golpe',
  
  // ID do Google Docs
  googleDocsId: '1uit0E8qQ_IKERcU-2YoE2mu2RhYCrpPbVEUtS0gtwls',  // Cole o ID aqui quando tiver
  
  // Performance dos frames
  frames: {
    fps: 30,
    quality: 60,
    desktopScale: '1920:-1',
    mobileScale: '768:-1'
  },
  
  // ⚡ CDN - URL BASE CORRETA!
  cdn: {
    baseUrl: 'https://s3.glbimg.com/v1/AUTH_e03f7a1106bb438e970511f892f07c35',
    container: 'g1'
  },
  
  // ⚡ CREDENCIAIS CORRETAS!
  vault: {
    username: 'u_newsroom_project',
    password: 'Z9$a&ejHkjZz',
    authUrl: 'https://auth.s3.globoi.com:5000/v3',
    projectAuth: 'newsroom_project'
  }
};

// ========================================
// NÃO PRECISA EDITAR DAQUI PRA BAIXO
// ========================================

// URL base do projeto
PROJECT_CONFIG.baseProjectUrl = `${PROJECT_CONFIG.cdn.baseUrl}/${PROJECT_CONFIG.cdn.container}/${PROJECT_CONFIG.projectName}`;

// URLs geradas automaticamente
PROJECT_CONFIG.urls = {
  base: PROJECT_CONFIG.baseProjectUrl,
  data: `${PROJECT_CONFIG.baseProjectUrl}/data`,
  images: `${PROJECT_CONFIG.baseProjectUrl}/images`,
  videos: `${PROJECT_CONFIG.baseProjectUrl}/videos`,
  frames: `${PROJECT_CONFIG.baseProjectUrl}/frames`,
  framesDesktop: `${PROJECT_CONFIG.baseProjectUrl}/frames/desktop`,
  framesMobile: `${PROJECT_CONFIG.baseProjectUrl}/frames/mobile`,
  vault: `https://vault.globoi.com/p/newsroom_project/storage/objects/${PROJECT_CONFIG.cdn.container}/${PROJECT_CONFIG.projectName}/`
};

// Paths locais
PROJECT_CONFIG.localPaths = {
  videos: 'static/videos',
  frames: 'static/img/frames',
  data: 'static/data',
  build: 'build'
};

// Helper: Gerar URL de frame
PROJECT_CONFIG.getFrameUrl = (videoName, type = 'desktop') => {
  const baseUrl = type === 'mobile' ? PROJECT_CONFIG.urls.framesMobile : PROJECT_CONFIG.urls.framesDesktop;
  return `${baseUrl}/${videoName}/frame_`;
};

// Helper: Configuração para Google Docs
PROJECT_CONFIG.getGoogleDocsConfig = (videoName, frameCount) => {
  return {
    type: 'videoscrollytelling',
    imagePrefix: PROJECT_CONFIG.getFrameUrl(videoName, 'desktop'),
    imagePrefixMobile: PROJECT_CONFIG.getFrameUrl(videoName, 'mobile'),
    totalFrames: frameCount
  };
};

// Validação
PROJECT_CONFIG.validate = () => {
  const errors = [];
  
  if (!PROJECT_CONFIG.projectName) {
    errors.push('❌ projectName não configurado');
  }
  
  if (PROJECT_CONFIG.projectName.includes(' ')) {
    errors.push('❌ projectName não pode ter espaços');
  }
  
  if (!PROJECT_CONFIG.vault.password) {
    errors.push('⚠️  Senha do Vault não configurada');
  }
  
  if (errors.length > 0) {
    console.error('\n🚨 Problemas na configuração:');
    errors.forEach(e => console.error(e));
    return false;
  }
  
  return true;
};

// Imprimir configuração
PROJECT_CONFIG.print = () => {
  console.log('\n📋 CONFIGURAÇÃO DO PROJETO');
  console.log('=' .repeat(60));
  console.log(`📁 Nome: ${PROJECT_CONFIG.projectName}`);
  console.log(`🌐 URL Base: ${PROJECT_CONFIG.baseProjectUrl}`);
  console.log('=' .repeat(60));
};

// Exportar
export default PROJECT_CONFIG;

// Para compatibilidade com require()
if (typeof module !== 'undefined') {
  module.exports = PROJECT_CONFIG;
}