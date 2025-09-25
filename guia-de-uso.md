# 🚀 Implementação VideoScrolly - Guia Completo

## 📁 Arquivos que precisam ser atualizados/criados:

### 1. 🆕 Novos componentes:

```
src/lib/components/story/ScrollyFrames.svelte          ← Componente principal otimizado
```

### 2. 🔄 Arquivos para atualizar:

```
src/lib/components/StoryRenderer.svelte                ← Adicionar suporte ao ScrollyFrames
src/lib/utils/storyRenderer.js                        ← Adicionar processamento videoscrollytelling
scripts/fetch-docs.js                                 ← Substituir por fetch-docs-automatico.js
package.json                                          ← Adicionar novos comandos
```

### 3. 🆕 Scripts novos:

```
scripts/fetch-docs-automatico.js                      ← Fetch com detecção automática
scripts/sistema-simplificado.js                       ← Sistema super simples (opcional)
scripts/video-to-frames.js                            ← Conversor de vídeos (opcional)
scripts/auto-upload-frames.js                         ← Upload automático (opcional)
```

---

## 🎯 Implementação mínima (só o essencial):

### Passo 1: Criar o componente ScrollyFrames

Copie o conteúdo do artifact `ScrollyFrames.svelte` para:

```
src/lib/components/story/ScrollyFrames.svelte
```

### Passo 2: Atualizar StoryRenderer.svelte

Adicione a importação:

```javascript
import ScrollyFrames from './story/ScrollyFrames.svelte';
```

E adicione o caso no switch:

```javascript
<!-- VideoScrollytelling NOVO -->
{:else if componentType === 'video-scrolly-new'}
  <ScrollyFrames
    framePrefix={props.imagePrefix || ''}
    framePrefixMobile={props.imagePrefixMobile || props.imagePrefix || ''}
    totalFrames={parseInt(props.totalFrames) || 100}
    frameExtension={props.imageSuffix || '.jpg'}
    frameExtensionMobile={props.imageSuffixMobile || '.webp'}
    framePadding={4}
    startFrame={parseInt(props.frameStart) || 1}
    endFrame={parseInt(props.frameStop) || parseInt(props.totalFrames) || 100}
    height={props.height || '100vh'}
    showProgress={stringToBoolean(props.showProgress, true)}
    showFrameCounter={stringToBoolean(props.showFrameCounter, false)}
    preloadRadius={parseInt(props.preloadFrames) || 10}
    maxMemoryMB={parseInt(props.maxMemoryMB) || 50}
    className="video-scrolly-{index + 1}"
  />
```

### Passo 3: Atualizar função getComponentType

Adicione no mapeamento:

```javascript
// VideoScrollytelling NOVO
'videoscrollytelling': 'video-scrolly-new',
'video-scrollytelling': 'video-scrolly-new',
'videoscrolly': 'video-scrolly-new',
'video-scrolly': 'video-scrolly-new',
```

### Passo 4: Atualizar storyRenderer.js

Adicione o case no switch:

```javascript
case 'videoscrollytelling':
case 'video-scrollytelling':
case 'videoscrolly':
case 'video-scrolly':
  component.type = 'video-scrolly-new';
  component.imagePrefix = paragraph.imagePrefix || '';
  component.imagePrefixMobile = paragraph.imagePrefixMobile || paragraph.imagePrefix || '';
  component.imageSuffix = paragraph.imageSuffix || '.jpg';
  component.imageSuffixMobile = paragraph.imageSuffixMobile || '.webp';
  component.totalFrames = parseInt(paragraph.totalFrames) || 100;
  component.frameStart = parseInt(paragraph.frameStart) || 1;
  component.frameStop = parseInt(paragraph.frameStop) || component.totalFrames;
  component.height = paragraph.height || '100vh';
  component.showProgress = paragraph.showProgress !== false;
  component.showTime = paragraph.showTime !== false;
  component.preloadFrames = parseInt(paragraph.preloadFrames) || 10;
  component.maxMemoryMB = parseInt(paragraph.maxMemoryMB) || 50;
  component.fullWidth = paragraph.fullWidth !== false;
  break;
```

---

## 🎮 Teste básico:

### 1. Criar JSON de teste:

```json
{
	"title": "Teste VideoScrolly",
	"paragraphs": [
		{
			"type": "videoscrollytelling",
			"imagePrefix": "https://via.placeholder.com/1920x1080/ff0000/ffffff?text=Frame+",
			"imagePrefixMobile": "https://via.placeholder.com/800x600/00ff00/ffffff?text=Mobile+",
			"totalFrames": 10,
			"imageSuffix": "",
			"imageSuffixMobile": "",
			"showProgress": true
		}
	]
}
```

### 2. Testar no navegador:

```bash
npm run dev
# Abrir: http://localhost:5173/teste
```

---

## 🚀 Implementação completa (com automação):

### Passo 1: Substituir fetch-docs.js

Renomear o atual e criar o novo:

```bash
mv scripts/fetch-docs.js scripts/fetch-docs-original.js
# Copiar conteúdo do fetch-docs-automatico.js para scripts/fetch-docs.js
```

### Passo 2: Atualizar package.json

```json
{
	"scripts": {
		"fetch": "node scripts/fetch-docs.js",
		"fetch-original": "node scripts/fetch-docs-original.js"
	}
}
```

### Passo 3: Configurar detecção automática

O novo fetch-docs.js vai:

- Detectar componentes `videoscrollytelling` automaticamente
- Procurar vídeos nos seus caminhos habituais
- Configurar URLs dos frames automaticamente
- Salvar JSON pronto para usar

---

## 📱 Como usar após implementação:

### Usuário final:

1. **Google Docs:** Escrever `type: videoscrollytelling`
2. **Terminal:** `npm run fetch DOC_ID`
3. **Pronto!** Sistema detecta e configura automaticamente

### Desenvolvedor:

1. **Testar:** `npm run dev`
2. **Debug:** Console do navegador mostra logs detalhados
3. **Personalizar:** Editar props do ScrollyFrames conforme necessário

---

## 🔧 Configurações avançadas:

### Personalizar detecção de vídeos:

Editar `fetch-docs.js`, função `buscarVideosLocais()`:

```javascript
const possiveisPaths = [
	// Seus padrões
	{
		desktop: `../static/videos/meu_video_${index}.mp4`,
		mobile: `../static/videos/meu_video_${index}_mobile.mp4`
	},
	// Padrão atual
	{
		desktop: `../static/videos/videoscrolly_${index}_main.mp4`,
		mobile: `../static/videos/videoscrolly_${index}_mobile.mp4`
	}
];
```

### Personalizar configurações padrão:

Editar função `processarDesdeLocais()`:

```javascript
component.totalFrames = 150; // Alterar aqui
```
