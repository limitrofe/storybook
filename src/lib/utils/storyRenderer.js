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
				component.fullWidth = paragraph.fullWidth;
				component.autoplay = paragraph.autoplay;
				component.controls = paragraph.controls !== false;
				component.loop = paragraph.loop;
				component.showCaption = paragraph.showCaption !== false;
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

			case 'flourish':
			case 'grafico':
			case 'mapa':
				component.type = 'flourish';
				component.src = paragraph.src;
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
