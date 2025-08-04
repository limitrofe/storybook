// src/lib/utils/storyRenderer.js
/**
 * Renderiza componentes de história baseado em dados do ArchieML
 */
export function parseStoryComponents(paragraphs) {
	if (!paragraphs || !Array.isArray(paragraphs)) {
		return [];
	}

	return paragraphs.map((paragraph, index) => {
		const component = { id: `component-${index}` };
		const type = paragraph.type?.toLowerCase().trim();

		switch (type) {
			case 'header':
			case 'titulo-principal':
			case 'tituloprincipal':
			case 'abre':
				component.type = 'header';
				component.title = paragraph.title;
				component.subtitle = paragraph.subtitle;
				component.author = paragraph.author;
				component.publishDate = paragraph.publishDate || paragraph.date;
				component.backgroundImage = paragraph.backgroundImage;
				component.backgroundImageMobile = paragraph.backgroundImageMobile;
				component.backgroundVideo = paragraph.backgroundVideo;
				component.backgroundVideoMobile = paragraph.backgroundVideoMobile;
				component.overlay = paragraph.overlay;
				component.variant = paragraph.variant;
				break;

			case 'texto':
			case 'paragrafo':
				component.type = 'text';
				component.variant = paragraph.variant || 'body';
				component.content = paragraph.text;
				break;

			case 'frase':
			case 'citacao':
			case 'quote':
				component.type = 'text';
				component.variant = 'quote';
				component.content = paragraph.text;
				component.author = paragraph.author;
				component.role = paragraph.role;
				break;

			case 'titulo':
			case 'intertitulo':
				component.type = 'section-title';
				component.title = paragraph.text;
				component.subtitle = paragraph.subtitle;
				component.backgroundImage = paragraph.backgroundImage;
				component.backgroundImageMobile = paragraph.backgroundImageMobile;
				component.variant = paragraph.variant || 'default';
				component.size = paragraph.size || 'medium';
				component.overlay = paragraph.overlay;
				break;

			case 'foto':
			case 'imagem':
				component.type = 'photo';
				component.src = paragraph.src || paragraph.url;
				component.alt = paragraph.alt;
				component.caption = paragraph.caption;
				component.credit = paragraph.credit;
				component.fullWidth = paragraph.fullWidth;
				component.alignment = paragraph.alignment || 'center';
				break;

			case 'video':
			case 'mp4':
				component.type = 'video';
				component.src = paragraph.src;
				component.poster = paragraph.poster;
				component.fullWidth = paragraph.fullWidth;
				component.autoplay = paragraph.autoplay;
				component.controls = paragraph.controls !== false;
				component.loop = paragraph.loop;
				component.showCaption = paragraph.showCaption !== false;
				component.caption = paragraph.caption;
				component.credit = paragraph.credit;
				break;

			case 'globovideo':
			case 'globo-video':
			case 'globoplayer':
			case 'globo-player':
			case 'globo':
				component.type = 'globo-player';
				component.videoId = paragraph.videoId;
				component.videosIDs = paragraph.videosIDs;
				component.fullWidth = paragraph.fullWidth;
				component.autoplay = paragraph.autoplay;
				component.startMuted = paragraph.startMuted;
				component.skipDFP = paragraph.skipDFP;
				component.chromeless = paragraph.chromeless;
				component.showCaption = paragraph.showCaption !== false;
				component.caption = paragraph.caption;
				component.credit = paragraph.credit;
				break;

			case 'galeria':
			case 'gallery':
				component.type = 'gallery';
				component.images = paragraph.images || [];
				component.layout = paragraph.layout || 'grid';
				component.columns = paragraph.columns || 3;
				component.lightbox = paragraph.lightbox;
				break;

			case 'carrossel':
			case 'carousel':
				component.type = 'carousel';
				component.items = paragraph.items || [];
				component.autoplay = paragraph.autoplay;
				component.interval = paragraph.interval;
				component.showDots = paragraph.showDots;
				component.showArrows = paragraph.showArrows;
				break;

			case 'parallax':
				component.type = 'parallax';
				component.image = paragraph.image;
				component.content = paragraph.content;
				component.height = paragraph.height || '80vh';
				component.speed = paragraph.speed || 0.5;
				component.overlay = paragraph.overlay;
				break;

			case 'antes-depois':
			case 'before-after':
				component.type = 'before-after';
				component.beforeImage = paragraph.beforeImage;
				component.afterImage = paragraph.afterImage;
				component.beforeLabel = paragraph.beforeLabel || 'Antes';
				component.afterLabel = paragraph.afterLabel || 'Depois';
				component.orientation = paragraph.orientation || 'vertical';
				break;

			case 'scrollytelling':
			case 'scrolly':
				component.type = 'scrolly';
				component.steps = paragraph.steps || [];
				component.fullWidth = paragraph.fullWidth;
				break;

			// VideoScrollytelling NOVO - ScrollyFrames
			case 'videoscrollytelling':
			case 'video-scrollytelling':
			case 'videoscrolly':
			case 'video-scrolly':
				component.type = 'video-scrolly-new';
				
				// URLs dos frames
				component.imagePrefix = paragraph.imagePrefix || '';
				component.imagePrefixMobile = paragraph.imagePrefixMobile || paragraph.imagePrefix || '';
				component.imageSuffix = paragraph.imageSuffix || '.jpg';
				component.imageSuffixMobile = paragraph.imageSuffixMobile || '.webp';
				
				// Configurações de frames
				component.totalFrames = parseInt(paragraph.totalFrames) || 100;
				component.frameStart = parseInt(paragraph.frameStart) || 1;
				component.frameStop = parseInt(paragraph.frameStop) || component.totalFrames;
				
				// Configurações de vídeo (fallback/legacy)
				component.videoSrc = paragraph.videoSrc || paragraph.src;
				component.videoSrcMobile = paragraph.videoSrcMobile || paragraph.srcMobile;
				component.frameStartSeconds = parseFloat(paragraph.frameStartSeconds) || 0;
				component.frameStopSeconds = parseFloat(paragraph.frameStopSeconds) || 10;
				
				// Configurações de performance
				component.preloadFrames = parseInt(paragraph.preloadFrames) || 10;
				component.maxMemoryMB = parseInt(paragraph.maxMemoryMB) || 50;
				component.scrollSmoothness = parseFloat(paragraph.scrollSmoothness) || 0.05;
				component.frameRate = parseInt(paragraph.frameRate) || 30;
				
				// Configurações de UI
				component.height = paragraph.height || '100vh';
				component.showProgress = paragraph.showProgress !== false;
				component.showTime = paragraph.showTime !== false;
				component.showFrameCounter = paragraph.showFrameCounter || false;
				component.showControls = paragraph.showControls || false;
				
				// Configurações avançadas
				component.smoothTransition = paragraph.smoothTransition !== false;
				component.lazyLoading = paragraph.lazyLoading !== false;
				component.bufferSize = parseInt(paragraph.bufferSize) || 20;
				component.fallbackFrames = paragraph.fallbackFrames || [];
				component.posterImage = paragraph.posterImage;
				
				// Steps para scrollytelling
				component.steps = paragraph.steps || [];
				
				// Layout
				component.fullWidth = paragraph.fullWidth !== false;
				component.variant = paragraph.variant || 'default';
				break;

			case 'flourish':
			case 'grafico':
			case 'mapa':
				component.type = 'flourish';
				component.src = paragraph.src;
				component.height = paragraph.height || '600px';
				component.caption = paragraph.caption;
				component.credit = paragraph.credit;
				break;

			case 'flourish-scrolly':
				component.type = 'flourish-scrolly';
				component.src = paragraph.src;
				component.steps = paragraph.steps || [];
				break;

			case 'ancora':
			case 'anchor':
				component.type = 'anchor';
				component.anchorId = paragraph.id || paragraph.name || `anchor-${index}`;
				component.id = component.anchorId;
				break;

			default:
				component.type = 'text';
				component.variant = paragraph.variant || 'body';
				component.content = paragraph.text;
				break;
		}

		return component;
	});
}

/**
 * Detecta se um componente é um VideoScrollytelling
 */
export function isVideoScrollyComponent(paragraph) {
	if (!paragraph || !paragraph.type) return false;
	
	const type = paragraph.type.toLowerCase().trim();
	
	return [
		'videoscrollytelling',
		'video-scrollytelling', 
		'videoscrolly',
		'video-scrolly'
	].includes(type);
}

/**
 * Valida se um componente VideoScrolly tem configuração completa
 */
export function validateVideoScrollyComponent(component) {
	const errors = [];
	const warnings = [];
	
	// Verificar URLs dos frames
	if (!component.imagePrefix) {
		errors.push('imagePrefix é obrigatório');
	}
	
	if (!component.imagePrefixMobile && !component.imagePrefix) {
		warnings.push('imagePrefixMobile não definido, usando imagePrefix');
	}
	
	// Verificar totalFrames
	if (!component.totalFrames || component.totalFrames < 1) {
		errors.push('totalFrames deve ser maior que 0');
	}
	
	// Verificar frameStart/Stop
	if (component.frameStart < 1) {
		warnings.push('frameStart deve ser >= 1');
	}
	
	if (component.frameStop > component.totalFrames) {
		warnings.push('frameStop maior que totalFrames');
	}
	
	// Verificar extensões
	if (!component.imageSuffix) {
		warnings.push('imageSuffix não definido, usando .jpg');
	}
	
	return {
		isValid: errors.length === 0,
		errors,
		warnings
	};
}

/**
 * Gera configuração padrão para VideoScrolly
 */
export function generateVideoScrollyDefaults(baseConfig = {}) {
	return {
		type: 'video-scrolly-new',
		imagePrefix: baseConfig.imagePrefix || '',
		imagePrefixMobile: baseConfig.imagePrefixMobile || baseConfig.imagePrefix || '',
		imageSuffix: baseConfig.imageSuffix || '.jpg',
		imageSuffixMobile: baseConfig.imageSuffixMobile || '.webp',
		totalFrames: parseInt(baseConfig.totalFrames) || 100,
		frameStart: parseInt(baseConfig.frameStart) || 1,
		frameStop: parseInt(baseConfig.frameStop) || parseInt(baseConfig.totalFrames) || 100,
		height: baseConfig.height || '100vh',
		showProgress: baseConfig.showProgress !== false,
		showTime: baseConfig.showTime !== false,
		showFrameCounter: baseConfig.showFrameCounter || false,
		preloadFrames: parseInt(baseConfig.preloadFrames) || 10,
		maxMemoryMB: parseInt(baseConfig.maxMemoryMB) || 50,
		scrollSmoothness: parseFloat(baseConfig.scrollSmoothness) || 0.05,
		smoothTransition: baseConfig.smoothTransition !== false,
		lazyLoading: baseConfig.lazyLoading !== false,
		fullWidth: baseConfig.fullWidth !== false,
		...baseConfig
	};
}

/**
 * Converte string para boolean de forma inteligente
 */
export function parseBoolean(value, defaultValue = false) {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') {
		const lower = value.toLowerCase().trim();
		return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'sim';
	}
	if (typeof value === 'number') {
		return value !== 0;
	}
	return defaultValue;
}

/**
 * Converte string para número de forma segura
 */
export function parseNumber(value, defaultValue = 0) {
	const num = parseFloat(value);
	return isNaN(num) ? defaultValue : num;
}

/**
 * Converte string para inteiro de forma segura
 */
export function parseInteger(value, defaultValue = 0) {
	const num = parseInt(value);
	return isNaN(num) ? defaultValue : num;
}

/**
 * Limpa e normaliza texto
 */
export function cleanText(text) {
	if (!text) return '';
	
	return text
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/p>/gi, '\n')
		.replace(/<p[^>]*>/gi, '')
		.replace(/<[^>]*>/g, '')
		.replace(/\n\s*\n/g, '\n\n')
		.trim();
}

/**
 * Gera ID único para componente
 */
export function generateComponentId(type, index) {
	return `${type}-${index}-${Date.now()}`;
}

/**
 * Processa dados de um documento completo
 */
export function processStoryData(rawData) {
	if (!rawData) return null;
	
	const processed = {
		title: rawData.title || '',
		subtitle: rawData.subtitle || rawData.intro || '',
		author: rawData.author || '',
		publishDate: rawData.publishDate || rawData.date || '',
		backgroundImage: rawData.backgroundImage || '',
		backgroundImageMobile: rawData.backgroundImageMobile || '',
		credits: rawData.credits || '',
		paragraphs: []
	};
	
	// Processar parágrafos
	if (rawData.paragraphs && Array.isArray(rawData.paragraphs)) {
		processed.paragraphs = parseStoryComponents(rawData.paragraphs);
	}
	
	return processed;
}

/**
 * Debug: Logs informações sobre componentes VideoScrolly
 */
export function debugVideoScrollyComponents(paragraphs) {
	if (!paragraphs || !Array.isArray(paragraphs)) return;
	
	const videoScrollyComponents = paragraphs.filter(p => isVideoScrollyComponent(p));
	
	if (videoScrollyComponents.length === 0) {
		console.log('🎬 Nenhum componente VideoScrolly encontrado');
		return;
	}
	
	console.log(`🎬 ${videoScrollyComponents.length} componente(s) VideoScrolly encontrado(s):`);
	
	videoScrollyComponents.forEach((comp, index) => {
		const validation = validateVideoScrollyComponent(comp);
		const status = validation.isValid ? '✅' : '⚠️';
		
		console.log(`  ${status} Componente ${index + 1}:`);
		console.log(`     Tipo: ${comp.type}`);
		console.log(`     Frames: ${comp.totalFrames || 'N/A'}`);
		console.log(`     Desktop: ${comp.imagePrefix ? '✅' : '❌'}`);
		console.log(`     Mobile: ${comp.imagePrefixMobile ? '✅' : '❌'}`);
		
		if (validation.errors.length > 0) {
			console.log(`     ❌ Erros: ${validation.errors.join(', ')}`);
		}
		
		if (validation.warnings.length > 0) {
			console.log(`     ⚠️ Avisos: ${validation.warnings.join(', ')}`);
		}
	});
}

export default {
	parseStoryComponents,
	isVideoScrollyComponent,
	validateVideoScrollyComponent,
	generateVideoScrollyDefaults,
	parseBoolean,
	parseNumber,
	parseInteger,
	cleanText,
	generateComponentId,
	processStoryData,
	debugVideoScrollyComponents
};