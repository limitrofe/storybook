// Configurações do sistema
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
