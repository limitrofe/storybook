import Header from '$lib/components/story/Header.svelte';
import HeaderCaotico from '$lib/components/story/HeaderCaotico.svelte';
import StoryText from '$lib/components/story/StoryText.svelte';
import SectionTitle from '$lib/components/story/SectionTitle.svelte';
import PhotoWithCaption from '$lib/components/story/PhotoWithCaption.svelte';
import VideoPlayer from '$lib/components/story/VideoPlayer.svelte';
import GloboPlayer from '$lib/components/story/GloboPlayer.svelte';
import PhotoGallery from '$lib/components/story/PhotoGallery.svelte';
import Carousel from '$lib/components/story/Carousel.svelte';
import Parallax from '$lib/components/story/Parallax.svelte';
import BeforeAfter from '$lib/components/story/BeforeAfter.svelte';
import ScrollyTelling from '$lib/components/story/ScrollyTelling.svelte';
import ScrollyFrames from '$lib/components/story/ScrollyFrames.svelte';
import FlourishEmbed from '$lib/components/story/FlourishEmbed.svelte';
import FlourishScrolly from '$lib/components/story/FlourishScrolly.svelte';
import RecommendedItems from '$lib/components/story/RecommendedItems.svelte';
import CharacterPresentation from '$lib/components/story/CharacterPresentation.svelte';
import Curiosidades from '$lib/components/story/Curiosidades.svelte';
import TimelineInteractive from '$lib/components/story/TimelineInteractive.svelte';
import DocumentViewer from '$lib/components/story/DocumentViewer.svelte';
import CrimeExplainer from '$lib/components/story/CrimeExplainer.svelte';
import AnchorPoint from '$lib/components/story/AnchorPoint.svelte';
import FlexibleLayout from '$lib/components/story/FlexibleLayout.svelte';
import ResponsiveMediaLayout from '$lib/components/story/ResponsiveMediaLayout.svelte';
import FreeCanvas from '$lib/components/story/FreeCanvas.svelte';

/**
 * Catálogo centralizado de blocos disponíveis no builder.
 * Mantém um manifesto único com os presets, formulários e metadados.
 */
export const componentRegistry = [
	{
		type: 'header',
		label: 'Header Hero',
		icon: '📰',
		category: 'Estrutura',
		description: 'Abertura com imagem ou vídeo de fundo, título e metadados.',
		component: Header,
		defaultData: {
			type: 'header',
			title: 'Título da matéria',
			subtitle: 'Subtítulo chamativo para contextualizar o tema.',
			author: '',
			date: '',
			backgroundImage: '',
			backgroundImageMobile: '',
			backgroundVideo: '',
			backgroundVideoMobile: '',
			poster: '',
			posterMobile: '',
			variant: 'default',
			overlay: true,
			overlayGradient: 'top-to-bottom',
			verticalAlign: 'top',
			horizontalAlign: 'left',
			titleColor: '',
			subtitleColor: '',
			metaColor: '',
			onMediaColor: '',
			titleShadow: {
				enabled: false,
				offsetX: '0px',
				offsetY: '3px',
				blur: '18px',
				spread: '',
				color: 'rgba(15, 23, 42, 0.55)'
			},
			subtitleShadow: {
				enabled: false,
				offsetX: '0px',
				offsetY: '2px',
				blur: '12px',
				spread: '',
				color: 'rgba(15, 23, 42, 0.45)'
			},
			metaShadow: {
				enabled: false,
				offsetX: '0px',
				offsetY: '2px',
				blur: '10px',
				spread: '',
				color: 'rgba(15, 23, 42, 0.35)'
			},
			titleFontSizeDesktop: '',
			titleFontSizeMobile: '',
			titleLineHeightDesktop: '',
			titleLineHeightMobile: '',
			subtitleFontSizeDesktop: '',
			subtitleFontSizeMobile: '',
			subtitleLineHeightDesktop: '',
			subtitleLineHeightMobile: ''
		},
		fields: [
			{ path: 'title', label: 'Título', type: 'text', required: true },
			{ path: 'subtitle', label: 'Subtítulo', type: 'textarea', rows: 2 },
			{ path: 'author', label: 'Autor(a)', type: 'text' },
			{ path: 'date', label: 'Data (YYYY-MM-DD)', type: 'text' },
			{ path: 'titleColor', label: 'Cor do título', type: 'text', placeholder: '#ffffff' },
			{ path: 'subtitleColor', label: 'Cor do subtítulo', type: 'text', placeholder: '#ffffff' },
			{ path: 'metaColor', label: 'Cor do autor/data', type: 'text', placeholder: '#ffffff' },
			{
				path: 'onMediaColor',
				label: 'Cor do texto sobre mídia',
				type: 'text',
				placeholder: '#ffffff'
			},
			{
				path: 'variant',
				label: 'Variante visual',
				type: 'select',
				options: [
					{ label: 'Default', value: 'default' },
					{ label: 'Hero', value: 'hero' },
					{ label: 'Minimal', value: 'minimal' }
				]
			},
			{
				path: 'overlay',
				label: 'Aplicar overlay',
				type: 'boolean',
				helpText: 'Melhora a legibilidade do texto sobre a mídia.'
			},
			{
				path: 'overlayGradient',
				label: 'Overlay • gradiente',
				type: 'text',
				placeholder: 'top-to-bottom | bottom-to-top',
				helpText:
					'Use os presets top-to-bottom/bottom-to-top ou cole um linear-gradient CSS personalizado.'
			},
			{
				path: 'titleShadow.enabled',
				label: 'Título • sombra ativada',
				type: 'boolean',
				helpText: 'Habilita a sombra personalizada do título.'
			},
			{
				path: 'titleShadow.offsetX',
				label: 'Título • deslocamento X',
				type: 'text',
				placeholder: '0px'
			},
			{
				path: 'titleShadow.offsetY',
				label: 'Título • deslocamento Y',
				type: 'text',
				placeholder: '3px'
			},
			{
				path: 'titleShadow.blur',
				label: 'Título • blur',
				type: 'text',
				placeholder: '18px'
			},
			{
				path: 'titleShadow.color',
				label: 'Título • cor da sombra',
				type: 'color',
				showAlpha: true,
				allowClear: true,
				clearValue: ''
			},
			{
				path: 'subtitleShadow.enabled',
				label: 'Subtítulo • sombra ativada',
				type: 'boolean',
				helpText: 'Controle a sombra do subtítulo para contraste extra.'
			},
			{
				path: 'subtitleShadow.offsetX',
				label: 'Subtítulo • deslocamento X',
				type: 'text',
				placeholder: '0px'
			},
			{
				path: 'subtitleShadow.offsetY',
				label: 'Subtítulo • deslocamento Y',
				type: 'text',
				placeholder: '2px'
			},
			{
				path: 'subtitleShadow.blur',
				label: 'Subtítulo • blur',
				type: 'text',
				placeholder: '12px'
			},
			{
				path: 'subtitleShadow.color',
				label: 'Subtítulo • cor da sombra',
				type: 'color',
				showAlpha: true,
				allowClear: true,
				clearValue: ''
			},
			{
				path: 'metaShadow.enabled',
				label: 'Autor/Data • sombra ativada',
				type: 'boolean',
				helpText: 'Controle a sombra das linhas de autor e data.'
			},
			{
				path: 'metaShadow.offsetX',
				label: 'Autor/Data • deslocamento X',
				type: 'text',
				placeholder: '0px'
			},
			{
				path: 'metaShadow.offsetY',
				label: 'Autor/Data • deslocamento Y',
				type: 'text',
				placeholder: '2px'
			},
			{ path: 'metaShadow.blur', label: 'Autor/Data • blur', type: 'text', placeholder: '10px' },
			{
				path: 'metaShadow.color',
				label: 'Autor/Data • cor da sombra',
				type: 'color',
				showAlpha: true,
				allowClear: true,
				clearValue: ''
			},
			{ path: 'backgroundImage', label: 'Imagem desktop (1920x1080)', type: 'url' },
			{ path: 'backgroundImageMobile', label: 'Imagem mobile (1080x1920)', type: 'url' },
			{ path: 'backgroundVideo', label: 'Vídeo desktop (mp4)', type: 'url' },
			{ path: 'backgroundVideoMobile', label: 'Vídeo mobile (mp4)', type: 'url' },
			{ path: 'poster', label: 'Poster desktop', type: 'url' },
			{ path: 'posterMobile', label: 'Poster mobile', type: 'url' },
			{
				path: 'verticalAlign',
				label: 'Alinhamento vertical',
				type: 'select',
				options: [
					{ label: 'Topo', value: 'top' },
					{ label: 'Centro', value: 'center' },
					{ label: 'Base', value: 'bottom' }
				]
			},
			{
				path: 'horizontalAlign',
				label: 'Alinhamento horizontal',
				type: 'select',
				options: [
					{ label: 'Esquerda', value: 'left' },
					{ label: 'Centro', value: 'center' },
					{ label: 'Direita', value: 'right' }
				]
			},
			{
				path: 'titleFontSizeDesktop',
				label: 'Título • tamanho desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'titleFontSizeMobile',
				label: 'Título • tamanho mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'titleLineHeightDesktop',
				label: 'Título • altura linha desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'titleLineHeightMobile',
				label: 'Título • altura linha mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'subtitleFontSizeDesktop',
				label: 'Subtítulo • tamanho desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'subtitleFontSizeMobile',
				label: 'Subtítulo • tamanho mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'subtitleLineHeightDesktop',
				label: 'Subtítulo • altura linha desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'subtitleLineHeightMobile',
				label: 'Subtítulo • altura linha mobile',
				type: 'text',
				placeholder: 'herda do tema'
			}
		]
	},
	{
		type: 'header-caotico',
		label: 'Header Caótico',
		icon: '🌪️',
		category: 'Estrutura',
		hidden: true,
		description: 'Intro com dezenas de mídias animadas e camadas sobrepostas.',
		component: HeaderCaotico,
		defaultData: {
			type: 'header-caotico',
			title: 'HEADER CAÓTICO',
			subtitle: '40 mídias se movimentando dinamicamente',
			titleColor: '#f8fafc',
			overlay: true,
			overlayOpacity: 0.55,
			useCustomBackground: false,
			backgroundImage: '',
			backgroundImageMobile: '',
			backgroundVideo: '',
			backgroundVideoMobile: '',
			mediaWidth: 220,
			mediaHeight: 165,
			mediaWidthMobile: 160,
			mediaHeightMobile: 120,
			totalDefaultMedias: 36,
			shuffleInterval: 2800,
			animationDelay: 220,
			medias: []
		},
		fields: [
			{ path: 'title', label: 'Título', type: 'text', required: true },
			{ path: 'subtitle', label: 'Subtítulo', type: 'textarea', rows: 2 },
			{ path: 'titleColor', label: 'Cor do título', type: 'color' },
			{ path: 'overlay', label: 'Overlay escuro', type: 'boolean' },
			{
				path: 'overlayOpacity',
				label: 'Opacidade do overlay',
				type: 'number',
				min: 0,
				max: 1,
				step: 0.05
			},
			{ path: 'useCustomBackground', label: 'Usar mídia de fundo fixa', type: 'boolean' },
			{ path: 'backgroundImage', label: 'Imagem desktop', type: 'url' },
			{ path: 'backgroundImageMobile', label: 'Imagem mobile', type: 'url' },
			{ path: 'backgroundVideo', label: 'Vídeo desktop', type: 'url' },
			{ path: 'backgroundVideoMobile', label: 'Vídeo mobile', type: 'url' },
			{ path: 'mediaWidth', label: 'Largura mídia desktop', type: 'number' },
			{ path: 'mediaHeight', label: 'Altura mídia desktop', type: 'number' },
			{ path: 'mediaWidthMobile', label: 'Largura mídia mobile', type: 'number' },
			{ path: 'mediaHeightMobile', label: 'Altura mídia mobile', type: 'number' },
			{ path: 'totalDefaultMedias', label: 'Qtd. mídias geradas automaticamente', type: 'number' },
			{ path: 'shuffleInterval', label: 'Intervalo de embaralhamento (ms)', type: 'number' },
			{ path: 'animationDelay', label: 'Delay entre entradas (ms)', type: 'number' },
			{
				path: 'medias',
				label: 'Lista de mídias (JSON)',
				type: 'json',
				rows: 6,
				placeholder: '[{"type":"image","src":"https://..."}]',
				emptyValue: []
			}
		]
	},
	{
		type: 'intertitulo',
		label: 'Intertítulo',
		icon: '🔖',
		category: 'Estrutura',
		description: 'Transição entre seções com opções de mídia e overlay.',
		component: SectionTitle,
		defaultData: {
			type: 'intertitulo',
			text: 'Intertítulo impactante',
			subtitle: '',
			backgroundColor: '',
			textColor: '',
			fontFamily: 'globotipo',
			variant: 'default',
			size: 'medium',
			overlay: false,
			titleShadow: {
				enabled: false,
				offsetX: '0px',
				offsetY: '3px',
				blur: '18px',
				spread: '',
				color: 'rgba(15, 23, 42, 0.55)'
			},
			subtitleShadow: {
				enabled: false,
				offsetX: '0px',
				offsetY: '2px',
				blur: '12px',
				spread: '',
				color: 'rgba(15, 23, 42, 0.45)'
			},
			textAlign: 'center',
			textPosition: 'center',
			titleFontSizeDesktop: '',
			titleFontSizeMobile: '',
			titleLineHeightDesktop: '',
			titleLineHeightMobile: '',
			subtitleFontSizeDesktop: '',
			subtitleFontSizeMobile: '',
			subtitleLineHeightDesktop: '',
			subtitleLineHeightMobile: '',
			titleFontWeight: '',
			titleFontStyle: '',
			subtitleFontWeight: '',
			subtitleFontStyle: ''
		},
		fields: [
			{ path: 'text', label: 'Título', type: 'text', required: true },
			{ path: 'subtitle', label: 'Subtítulo', type: 'textarea', rows: 2 },
			{
				path: 'variant',
				label: 'Variante',
				type: 'select',
				options: [
					{ label: 'Default', value: 'default' },
					{ label: 'Minimal', value: 'minimal' },
					{ label: 'Hero', value: 'hero' }
				]
			},
			{
				path: 'size',
				label: 'Tamanho',
				type: 'select',
				options: [
					{ label: 'Pequeno', value: 'small' },
					{ label: 'Médio', value: 'medium' },
					{ label: 'Grande', value: 'large' }
				]
			},
			{
				path: 'fontFamily',
				label: 'Fonte',
				type: 'select',
				options: [
					{ label: 'Globotipo', value: 'globotipo' },
					{ label: 'Obviously', value: 'obviously' },
					{ label: 'Serif', value: 'serif' },
					{ label: 'Sans Serif', value: 'sans' }
				]
			},
			{ path: 'backgroundColor', label: 'Cor de fundo', type: 'color' },
			{ path: 'textColor', label: 'Cor do texto', type: 'color' },
			{ path: 'backgroundImage', label: 'Imagem desktop', type: 'url' },
			{ path: 'backgroundImageMobile', label: 'Imagem mobile', type: 'url' },
			{ path: 'backgroundVideo', label: 'Vídeo desktop', type: 'url' },
			{ path: 'backgroundVideoMobile', label: 'Vídeo mobile', type: 'url' },
			{ path: 'height', label: 'Altura desktop', type: 'text', placeholder: '60vh' },
			{ path: 'heightMobile', label: 'Altura mobile', type: 'text', placeholder: '50vh' },
			{
				path: 'textAlign',
				label: 'Alinhamento texto desktop',
				type: 'select',
				options: [
					{ label: 'Centro', value: 'center' },
					{ label: 'Esquerda', value: 'left' },
					{ label: 'Direita', value: 'right' }
				]
			},
			{
				path: 'textAlignMobile',
				label: 'Alinhamento texto mobile',
				type: 'select',
				options: [
					{ label: 'Centro', value: 'center' },
					{ label: 'Esquerda', value: 'left' },
					{ label: 'Direita', value: 'right' }
				]
			},
			{ path: 'overlay', label: 'Overlay escuro', type: 'boolean' },
			{
				path: 'titleShadow.enabled',
				label: 'Título • sombra ativada',
				type: 'boolean',
				helpText: 'Ativa a sombra configurável do intertítulo.'
			},
			{
				path: 'titleShadow.offsetX',
				label: 'Título • deslocamento X',
				type: 'text',
				placeholder: '0px'
			},
			{
				path: 'titleShadow.offsetY',
				label: 'Título • deslocamento Y',
				type: 'text',
				placeholder: '3px'
			},
			{ path: 'titleShadow.blur', label: 'Título • blur', type: 'text', placeholder: '18px' },
			{
				path: 'titleShadow.color',
				label: 'Título • cor da sombra',
				type: 'color',
				showAlpha: true,
				allowClear: true,
				clearValue: ''
			},
			{
				path: 'subtitleShadow.enabled',
				label: 'Subtítulo • sombra ativada',
				type: 'boolean',
				helpText: 'Melhore a leitura do subtítulo sobre fundos claros.'
			},
			{
				path: 'subtitleShadow.offsetX',
				label: 'Subtítulo • deslocamento X',
				type: 'text',
				placeholder: '0px'
			},
			{
				path: 'subtitleShadow.offsetY',
				label: 'Subtítulo • deslocamento Y',
				type: 'text',
				placeholder: '2px'
			},
			{ path: 'subtitleShadow.blur', label: 'Subtítulo • blur', type: 'text', placeholder: '12px' },
			{
				path: 'subtitleShadow.color',
				label: 'Subtítulo • cor da sombra',
				type: 'color',
				showAlpha: true,
				allowClear: true,
				clearValue: ''
			},
			{
				path: 'titleFontSizeDesktop',
				label: 'Título • tamanho desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'titleFontSizeMobile',
				label: 'Título • tamanho mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'titleLineHeightDesktop',
				label: 'Título • altura linha desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'titleLineHeightMobile',
				label: 'Título • altura linha mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'subtitleFontSizeDesktop',
				label: 'Subtítulo • tamanho desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'subtitleFontSizeMobile',
				label: 'Subtítulo • tamanho mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'subtitleLineHeightDesktop',
				label: 'Subtítulo • altura linha desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'subtitleLineHeightMobile',
				label: 'Subtítulo • altura linha mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'titleFontWeight',
				label: 'Título • peso',
				type: 'select',
				options: [
					{ label: 'Herda do tema (800)', value: '' },
					{ label: 'Light (300)', value: '300' },
					{ label: 'Normal (400)', value: '400' },
					{ label: 'Semi-bold (600)', value: '600' },
					{ label: 'Bold (700)', value: '700' },
					{ label: 'Extra Bold (800)', value: '800' },
					{ label: 'Black (900)', value: '900' }
				]
			},
			{
				path: 'titleFontStyle',
				label: 'Título • estilo',
				type: 'select',
				options: [
					{ label: 'Herda do tema (normal)', value: '' },
					{ label: 'Normal', value: 'normal' },
					{ label: 'Itálico', value: 'italic' }
				]
			},
			{
				path: 'subtitleFontWeight',
				label: 'Subtítulo • peso',
				type: 'select',
				options: [
					{ label: 'Herda do tema (400)', value: '' },
					{ label: 'Light (300)', value: '300' },
					{ label: 'Normal (400)', value: '400' },
					{ label: 'Semi-bold (600)', value: '600' },
					{ label: 'Bold (700)', value: '700' }
				]
			},
			{
				path: 'subtitleFontStyle',
				label: 'Subtítulo • estilo',
				type: 'select',
				options: [
					{ label: 'Herda do tema (normal)', value: '' },
					{ label: 'Normal', value: 'normal' },
					{ label: 'Itálico', value: 'italic' }
				]
			}
		]
	},
	{
		type: 'texto',
		label: 'Texto',
		icon: '📝',
		category: 'Narrativa',
		description: 'Parágrafo de texto com suporte a HTML, citação e ajustes.',
		component: StoryText,
		defaultData: {
			type: 'texto',
			text: '<p>Escreva aqui o texto do parágrafo.</p>',
			variant: 'body',
			align: 'left',
			maxWidth: '720px',
			fontSizeDesktop: '',
			fontSizeMobile: '',
			lineHeightDesktop: '',
			lineHeightMobile: '',
			textColor: ''
		},
		fields: [
			{ path: 'text', label: 'Conteúdo (HTML)', type: 'richtext', rows: 6 },
			{
				path: 'variant',
				label: 'Estilo',
				type: 'select',
				options: [
					{ label: 'Corpo', value: 'body' },
					{ label: 'Lead', value: 'lead' },
					{ label: 'Citação', value: 'quote' }
				]
			},
			{
				path: 'align',
				label: 'Alinhamento',
				type: 'select',
				options: [
					{ label: 'Esquerda', value: 'left' },
					{ label: 'Centro', value: 'center' },
					{ label: 'Direita', value: 'right' },
					{ label: 'Justificado', value: 'justify' }
				]
			},
			{ path: 'maxWidth', label: 'Largura máxima', type: 'text', placeholder: '720px' },
			{ path: 'author', label: 'Autor (para citações)', type: 'text' },
			{ path: 'role', label: 'Cargo (para citações)', type: 'text' },
			{
				path: 'fontSizeDesktop',
				label: 'Tamanho desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'fontSizeMobile',
				label: 'Tamanho mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'lineHeightDesktop',
				label: 'Altura linha desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'lineHeightMobile',
				label: 'Altura linha mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{ path: 'textColor', label: 'Cor do texto', type: 'color' }
		]
	},
	{
		type: 'citacao',
		label: 'Citação destacada',
		icon: '💬',
		category: 'Narrativa',
		description: 'Bloco de citação com destaque visual e crédito.',
		component: StoryText,
		defaultData: {
			type: 'citacao',
			text: '<p>"Uma fala marcante para destacar na matéria."</p>',
			author: '',
			role: '',
			fontSizeDesktop: '',
			fontSizeMobile: '',
			lineHeightDesktop: '',
			lineHeightMobile: '',
			textColor: ''
		},
		fields: [
			{ path: 'text', label: 'Texto da citação', type: 'richtext', rows: 4 },
			{ path: 'author', label: 'Autor(a)', type: 'text' },
			{ path: 'role', label: 'Cargo/Função', type: 'text' },
			{
				path: 'fontSizeDesktop',
				label: 'Tamanho desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'fontSizeMobile',
				label: 'Tamanho mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'lineHeightDesktop',
				label: 'Altura linha desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'lineHeightMobile',
				label: 'Altura linha mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{ path: 'textColor', label: 'Cor do texto', type: 'color' }
		]
	},
	{
		type: 'foto',
		label: 'Foto com legenda',
		icon: '🖼️',
		category: 'Mídia',
		description: 'Imagem responsiva com legenda, crédito e link opcional.',
		component: PhotoWithCaption,
		defaultData: {
			type: 'foto',
			src: 'https://via.placeholder.com/1600x900',
			srcMobile: 'https://via.placeholder.com/900x1600',
			alt: 'Descrição da imagem',
			caption: '',
			credit: '',
			fullWidth: false,
			link: '',
			target: '_blank'
		},
		fields: [
			{ path: 'src', label: 'Imagem desktop (1600x900)', type: 'url', required: true },
			{
				path: 'srcMobile',
				label: 'Imagem mobile (900x1600)',
				type: 'url',
				required: true,
				description: 'Obrigatório para desempenho mobile.'
			},
			{ path: 'alt', label: 'Texto alternativo', type: 'text' },
			{ path: 'caption', label: 'Legenda (HTML)', type: 'richtext', rows: 3 },
			{ path: 'credit', label: 'Crédito', type: 'text' },
			{ path: 'fullWidth', label: 'Ocupar largura total', type: 'boolean' },
			{ path: 'link', label: 'Link opcional', type: 'url' },
			{
				path: 'target',
				label: 'Abertura do link',
				type: 'select',
				options: [
					{ label: 'Mesma aba', value: '_self' },
					{ label: 'Nova aba', value: '_blank' }
				]
			}
		]
	},
	{
		type: 'video',
		label: 'Vídeo MP4',
		icon: '🎥',
		category: 'Mídia',
		description: 'Player otimizado com pôster, autoplay opcional e largura customizável.',
		component: VideoPlayer,
		defaultData: {
			type: 'video',
			src: '',
			srcMobile: '',
			poster: '',
			posterMobile: '',
			caption: '',
			credit: '',
			autoplay: false,
			controls: true,
			loop: false,
			showCaption: true,
			alignment: 'center',
			customWidthDesktop: '960px',
			customWidthMobile: '360px',
			aspectRatioDesktop: '16/9',
			aspectRatioMobile: '9/16',
			backgroundColor: '#0f172a',
			fullWidth: false,
			fullWidthBackground: false
		},
		fields: [
			{ path: 'src', label: 'Vídeo desktop (mp4)', type: 'url', required: true },
			{
				path: 'srcMobile',
				label: 'Vídeo mobile (mp4)',
				type: 'url',
				required: true,
				description: 'Versão otimizada para redes móveis.'
			},
			{ path: 'poster', label: 'Poster desktop (jpg/png)', type: 'url', required: true },
			{ path: 'posterMobile', label: 'Poster mobile (jpg/png)', type: 'url', required: true },
			{ path: 'caption', label: 'Legenda (HTML)', type: 'richtext', rows: 2 },
			{ path: 'credit', label: 'Crédito', type: 'text' },
			{
				path: 'autoplay',
				label: 'Autoplay',
				type: 'boolean',
				helpText: 'Será silenciado no carregamento inicial.'
			},
			{ path: 'controls', label: 'Exibir controles nativos', type: 'boolean' },
			{ path: 'loop', label: 'Loop infinito', type: 'boolean' },
			{ path: 'showCaption', label: 'Mostrar legenda/credito abaixo', type: 'boolean' },
			{
				path: 'alignment',
				label: 'Alinhamento do player',
				type: 'select',
				options: [
					{ label: 'Centralizado', value: 'center' },
					{ label: 'Esquerda', value: 'left' },
					{ label: 'Direita', value: 'right' }
				]
			},
			{ path: 'customWidthDesktop', label: 'Largura desktop', type: 'text', placeholder: '960px' },
			{ path: 'customWidthMobile', label: 'Largura mobile', type: 'text', placeholder: '360px' },
			{ path: 'aspectRatioDesktop', label: 'Proporção desktop', type: 'text', placeholder: '16/9' },
			{ path: 'aspectRatioMobile', label: 'Proporção mobile', type: 'text', placeholder: '9/16' },
			{ path: 'backgroundColor', label: 'Cor de fundo', type: 'color' },
			{ path: 'fullWidth', label: 'Ocupar toda a largura', type: 'boolean' },
			{ path: 'fullWidthBackground', label: 'Fundo em largura total', type: 'boolean' }
		]
	},
	{
		type: 'globo-player',
		label: 'Globo Player',
		icon: '📺',
		category: 'Mídia',
		description: 'Embed oficial da Globo com suporte a IDs desktop/mobile e background.',
		component: GloboPlayer,
		defaultData: {
			type: 'globo-player',
			videoIdDesktop: '',
			videoIdMobile: '',
			videoId: '',
			containerBackgroundColor: '#000000',
			widthDesktop: '100%',
			widthMobile: '100%',
			aspectRatio: '16 / 9',
			aspectRatioMobile: '9 / 16',
			autoPlay: false,
			startMuted: true,
			skipDFP: false,
			controls: true,
			showCaption: true,
			caption: '',
			credit: '',
			fullWidth: false
		},
		fields: [
			{ path: 'videoIdDesktop', label: 'Video ID desktop', type: 'text', required: true },
			{ path: 'videoIdMobile', label: 'Video ID mobile', type: 'text', required: true },
			{
				path: 'videoId',
				label: 'Video ID fallback',
				type: 'text',
				description: 'Usado se os campos específicos não estiverem disponíveis.'
			},
			{ path: 'containerBackgroundColor', label: 'Cor do container', type: 'color' },
			{ path: 'widthDesktop', label: 'Largura desktop', type: 'text', placeholder: '100%' },
			{ path: 'widthMobile', label: 'Largura mobile', type: 'text', placeholder: '100%' },
			{ path: 'aspectRatio', label: 'Aspect ratio desktop', type: 'text', placeholder: '16 / 9' },
			{
				path: 'aspectRatioMobile',
				label: 'Aspect ratio mobile',
				type: 'text',
				placeholder: '9 / 16'
			},
			{ path: 'autoPlay', label: 'Autoplay', type: 'boolean' },
			{ path: 'startMuted', label: 'Iniciar sem som', type: 'boolean' },
			{ path: 'skipDFP', label: 'Pular anúncios DFP', type: 'boolean' },
			{ path: 'controls', label: 'Exibir controles', type: 'boolean' },
			{ path: 'showCaption', label: 'Mostrar legenda/crédito', type: 'boolean' },
			{ path: 'caption', label: 'Legenda (HTML)', type: 'richtext', rows: 2 },
			{ path: 'credit', label: 'Crédito', type: 'text' },
			{ path: 'fullWidth', label: 'Largura total', type: 'boolean' }
		]
	},
	{
		type: 'galeria',
		label: 'Galeria de fotos',
		icon: '🗂️',
		category: 'Mídia',
		description: 'Grade responsiva para múltiplas imagens com suporte a lightbox.',
		component: PhotoGallery,
		defaultData: {
			type: 'galeria',
			images: [
				{
					src: '',
					srcMobile: '',
					alt: '',
					caption: '',
					captionMobile: '',
					credit: '',
					creditMobile: ''
				}
			],
			layout: 'grid',
			columns: 3,
			gap: '1rem',
			lightbox: true,
			backgroundColor: '',
			backgroundImage: '',
			backgroundVideo: ''
		},
		fields: [
			{ path: 'images', label: 'Imagens', type: 'gallery-items' },
			{
				path: 'layout',
				label: 'Layout',
				type: 'select',
				options: [
					{ label: 'Grid', value: 'grid' },
					{ label: 'Masonry', value: 'masonry' }
				]
			},
			{ path: 'columns', label: 'Colunas', type: 'number', min: 1, max: 6 },
			{ path: 'gap', label: 'Espaçamento entre fotos', type: 'text', placeholder: '1rem' },
			{ path: 'lightbox', label: 'Ativar lightbox', type: 'boolean' },
			{ path: 'backgroundColor', label: 'Cor de fundo', type: 'color' },
			{ path: 'backgroundImage', label: 'Imagem de fundo', type: 'url' },
			{ path: 'backgroundVideo', label: 'Vídeo de fundo (mp4)', type: 'url' }
		]
	},
	{
		type: 'carousel',
		label: 'Carrossel',
		icon: '🎠',
		category: 'Mídia',
		description: 'Carrossel com itens customizáveis (imagens, cards, vídeos).',
		component: Carousel,
		defaultData: {
			type: 'carousel',
			items: [
				{
					type: 'image',
					src: '',
					srcMobile: '',
					alt: '',
					caption: '',
					credit: ''
				}
			],
			autoplay: false,
			interval: 4000,
			showDots: true,
			showArrows: true
		},
		fields: [
			{
				path: 'items',
				label: 'Slides',
				type: 'carousel-items'
			},
			{ path: 'autoplay', label: 'Autoplay', type: 'boolean' },
			{ path: 'interval', label: 'Intervalo em ms', type: 'number', min: 1000, step: 250 },
			{ path: 'showDots', label: 'Mostrar indicadores', type: 'boolean' },
			{ path: 'showArrows', label: 'Mostrar setas', type: 'boolean' }
		]
	},
	{
		type: 'parallax',
		label: 'Parallax',
		icon: '🪂',
		category: 'Interativo',
		description: 'Bloco com efeito parallax e conteúdo sobreposto.',
		component: Parallax,
		defaultData: {
			type: 'parallax',
			image: '',
			imageMobile: '',
			height: '65vh',
			speed: 0.45,
			overlay: true,
			content: '',
			backgroundPosition: 'center center',
			backgroundPositionMobile: '',
			backgroundSize: 'cover',
			backgroundSizeMobile: '',
			backgroundBaseColor: '',
			backgroundBaseImage: '',
			backgroundBaseImageMobile: '',
			backgroundBasePosition: '',
			backgroundBasePositionMobile: '',
			backgroundBaseSize: '',
			backgroundBaseSizeMobile: ''
		},
		fields: [
			{ path: 'image', label: 'Imagem desktop (jpg/webp)', type: 'url', required: true },
			{ path: 'imageMobile', label: 'Imagem mobile', type: 'url', required: true },
			{ path: 'height', label: 'Altura', type: 'text', placeholder: '65vh' },
			{ path: 'speed', label: 'Velocidade do efeito', type: 'number', step: 0.05 },
			{ path: 'overlay', label: 'Overlay escuro', type: 'boolean' },
			{
				path: 'backgroundPosition',
				label: 'Posição da imagem (desktop)',
				type: 'text',
				placeholder: 'center center'
			},
			{
				path: 'backgroundPositionMobile',
				label: 'Posição da imagem (mobile)',
				type: 'text',
				placeholder: 'herda do desktop'
			},
			{
				path: 'backgroundSize',
				label: 'Tamanho da imagem (desktop)',
				type: 'text',
				placeholder: 'cover'
			},
			{
				path: 'backgroundSizeMobile',
				label: 'Tamanho da imagem (mobile)',
				type: 'text',
				placeholder: 'herda do desktop'
			},
			{ path: 'backgroundBaseColor', label: 'Cor de fundo (fallback)', type: 'color' },
			{ path: 'backgroundBaseImage', label: 'Imagem de fundo (desktop)', type: 'url' },
			{ path: 'backgroundBaseImageMobile', label: 'Imagem de fundo (mobile)', type: 'url' },
			{
				path: 'backgroundBasePosition',
				label: 'Fundo • posição desktop',
				type: 'text',
				placeholder: 'inherit'
			},
			{
				path: 'backgroundBasePositionMobile',
				label: 'Fundo • posição mobile',
				type: 'text',
				placeholder: 'herda do desktop'
			},
			{
				path: 'backgroundBaseSize',
				label: 'Fundo • tamanho desktop',
				type: 'text',
				placeholder: 'cover'
			},
			{
				path: 'backgroundBaseSizeMobile',
				label: 'Fundo • tamanho mobile',
				type: 'text',
				placeholder: 'herda do desktop'
			},
			{ path: 'content', label: 'HTML sobreposto', type: 'richtext', rows: 3 }
		]
	},
	{
		type: 'antes-depois',
		label: 'Antes & Depois',
		icon: '🪞',
		category: 'Interativo',
		description: 'Comparativo interativo com duas imagens e slider.',
		component: BeforeAfter,
		defaultData: {
			type: 'antes-depois',
			beforeImage: '',
			beforeImageMobile: '',
			beforeCaption: '',
			beforeCredit: '',
			afterImage: '',
			afterImageMobile: '',
			afterCaption: '',
			afterCredit: '',
			beforeLabel: 'Antes',
			afterLabel: 'Depois',
			orientation: 'vertical'
		},
		fields: [
			{ path: 'beforeImage', label: 'Imagem "Antes"', type: 'url', required: true },
			{ path: 'beforeImageMobile', label: 'Imagem "Antes" (mobile)', type: 'url', required: true },
			{ path: 'afterImage', label: 'Imagem "Depois"', type: 'url', required: true },
			{ path: 'afterImageMobile', label: 'Imagem "Depois" (mobile)', type: 'url', required: true },
			{ path: 'beforeLabel', label: 'Legenda antes', type: 'text' },
			{ path: 'afterLabel', label: 'Legenda depois', type: 'text' },
			{ path: 'beforeCaption', label: 'Descrição antes (HTML)', type: 'textarea', rows: 2 },
			{ path: 'beforeCredit', label: 'Crédito antes', type: 'text' },
			{ path: 'afterCaption', label: 'Descrição depois (HTML)', type: 'textarea', rows: 2 },
			{ path: 'afterCredit', label: 'Crédito depois', type: 'text' },
			{
				path: 'orientation',
				label: 'Orientação do slider',
				type: 'select',
				options: [
					{ label: 'Vertical', value: 'vertical' },
					{ label: 'Horizontal', value: 'horizontal' }
				]
			}
		]
	},
	{
		type: 'scrolly',
		label: 'Scrollytelling',
		icon: '📜',
		category: 'Interativo',
		description: 'Sequência de passos que avançam conforme o scroll.',
		component: ScrollyTelling,
		defaultData: {
			type: 'scrolly',
			steps: [
				{
					title: 'Título do passo',
					text: '<p>Descreva o momento desta passagem.</p>',
					position: 'right',
					variant: 'default',
					backgroundColor: 'rgba(15, 23, 42, 0.82)',
					overlayColor: 'rgba(0, 0, 0, 0.35)',
					textColor: '#F9FAFB',
					accentColor: '#C4170C',
					borderColor: 'rgba(255, 255, 255, 0.12)',
					padding: '2rem',
					maxWidth: '460px',
					maxWidthMobile: '92%',
					cardVisibility: 'card',
					slideFromBottom: true,
					travelDistance: '45vh',
					image: '',
					imageMobile: '',
					video: '',
					videoMobile: '',
					alt: '',
					caption: ''
				}
			],
			fullWidth: false
		},
		fields: [
			{
				path: 'steps',
				label: 'Passos do scrollytelling',
				type: 'scrolly-steps'
			},
			{ path: 'fullWidth', label: 'Ocupar largura total', type: 'boolean' }
		]
	},
	{
		type: 'scrollyframes',
		label: 'Scrolly Frames',
		icon: '🎞️',
		category: 'Interativo',
		description: 'Animação quadro a quadro controlada pelo scroll, com frames desktop/mobile.',
		component: ScrollyFrames,
		defaultData: {
			type: 'scrollyframes',
			imagePrefix: '',
			imagePrefixMobile: '',
			imageSuffix: '.jpg',
			imageSuffixMobile: '.webp',
			frameStart: 1,
			frameStop: 120,
			height: '400vh',
			showProgress: true,
			showTime: false,
			preloadFrames: 10
		},
		fields: [
			{
				path: 'imagePrefix',
				label: 'Prefixo desktop',
				type: 'text',
				placeholder: 'https://cdn/.../frame_'
			},
			{
				path: 'imagePrefixMobile',
				label: 'Prefixo mobile',
				type: 'text',
				placeholder: 'https://cdn/.../mobile/frame_'
			},
			{ path: 'imageSuffix', label: 'Extensão desktop', type: 'text', placeholder: '.jpg' },
			{ path: 'imageSuffixMobile', label: 'Extensão mobile', type: 'text', placeholder: '.webp' },
			{ path: 'frameStart', label: 'Frame inicial', type: 'number', min: 0 },
			{ path: 'frameStop', label: 'Frame final', type: 'number', min: 1 },
			{ path: 'height', label: 'Altura da seção', type: 'text', placeholder: '400vh' },
			{ path: 'showProgress', label: 'Mostrar barra de progresso', type: 'boolean' },
			{ path: 'showTime', label: 'Mostrar contador de frames', type: 'boolean' },
			{ path: 'preloadFrames', label: 'Raio de preload', type: 'number', min: 1, max: 40 }
		]
	},
	{
		type: 'flourish',
		label: 'Flourish Embed',
		icon: '📊',
		category: 'Interativo',
		description: 'Embed responsivo de visualizações Flourish.',
		component: FlourishEmbed,
		defaultData: {
			type: 'flourish',
			src: 'https://flo.uri.sh/visualisation/12345/embed',
			height: '600px',
			caption: '',
			credit: ''
		},
		fields: [
			{ path: 'src', label: 'URL do Flourish', type: 'url', required: true },
			{ path: 'height', label: 'Altura', type: 'text', placeholder: '600px' },
			{ path: 'caption', label: 'Legenda (HTML)', type: 'richtext', rows: 2 },
			{ path: 'credit', label: 'Crédito', type: 'text' }
		]
	},
	{
		type: 'flourish-scrolly',
		label: 'Flourish Scrolly',
		icon: '🌀',
		category: 'Interativo',
		description: 'História Flourish com etapas sincronizadas.',
		component: FlourishScrolly,
		defaultData: {
			type: 'flourish-scrolly',
			src: 'https://flo.uri.sh/story/12345/embed',
			steps: []
		},
		fields: [
			{ path: 'src', label: 'URL do story Flourish', type: 'url', required: true },
			{
				path: 'steps',
				label: 'Steps',
				type: 'flourish-scrolly-steps',
				description: 'Adicione cards de texto e associe a um slide do story Flourish.',
				emptyValue: []
			}
		]
	},
	{
		type: 'recommended-items',
		label: 'Itens recomendados',
		icon: '🧲',
		category: 'Narrativa',
		hidden: true,
		description: 'Lista de conteúdos relacionados com layout grid ou lista.',
		component: RecommendedItems,
		defaultData: {
			type: 'recommended-items',
			title: 'conteúdos relacionados',
			layout: 'grid',
			columns: 5,
			showTitle: true,
			backgroundColor: '',
			titleColor: '',
			textColor: '',
			titleFontSizeDesktop: '',
			titleFontSizeMobile: '',
			itemTitleFontSizeDesktop: '',
			itemTitleFontSizeMobile: '',
			itemTextFontSizeDesktop: '',
			itemTextFontSizeMobile: '',
			items: []
		},
		fields: [
			{ path: 'title', label: 'Título da seção', type: 'text' },
			{
				path: 'layout',
				label: 'Layout',
				type: 'select',
				options: [
					{ label: 'Grade', value: 'grid' },
					{ label: 'Lista', value: 'list' }
				]
			},
			{ path: 'columns', label: 'Colunas (grid)', type: 'number', min: 1, max: 6 },
			{ path: 'showTitle', label: 'Exibir título', type: 'boolean' },
			{ path: 'backgroundColor', label: 'Cor de fundo', type: 'color' },
			{ path: 'titleColor', label: 'Cor do título', type: 'color' },
			{ path: 'textColor', label: 'Cor do texto', type: 'color' },
			{
				path: 'titleFontSizeDesktop',
				label: 'Título seção • tamanho desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'titleFontSizeMobile',
				label: 'Título seção • tamanho mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'itemTitleFontSizeDesktop',
				label: 'Item título • tamanho desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'itemTitleFontSizeMobile',
				label: 'Item título • tamanho mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'itemTextFontSizeDesktop',
				label: 'Item texto • tamanho desktop',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'itemTextFontSizeMobile',
				label: 'Item texto • tamanho mobile',
				type: 'text',
				placeholder: 'herda do tema'
			},
			{
				path: 'items',
				label: 'Itens (JSON)',
				type: 'json',
				rows: 8,
				placeholder: '[{"title":"","description":"","image":"","link":""}]',
				emptyValue: []
			}
		]
	},
	{
		type: 'character-presentation',
		label: 'Apresentação de personagens',
		icon: '🧑‍🤝‍🧑',
		category: 'Narrativa',
		hidden: true,
		description: 'Grade animada com personagens e descrições.',
		component: CharacterPresentation,
		defaultData: {
			type: 'character-presentation',
			personagens: [],
			shapeColor: '#dc2626',
			nameColor: '#0f172a',
			textColor: '#ffffff',
			backgroundColor: '#000000',
			animationSpeed: 'normal',
			sectionHeight: '100vh',
			sectionHeightMobile: '100vh'
		},
		fields: [
			{
				path: 'personagens',
				label: 'Personagens (JSON)',
				type: 'json',
				rows: 8,
				placeholder: '[{"nome":"Personagem","descricao":"Bio","foto":"https://..."}]',
				emptyValue: []
			},
			{ path: 'shapeColor', label: 'Cor dos elementos decorativos', type: 'color' },
			{ path: 'nameColor', label: 'Cor dos nomes', type: 'color' },
			{ path: 'textColor', label: 'Cor do texto', type: 'color' },
			{ path: 'backgroundColor', label: 'Cor de fundo', type: 'color' },
			{
				path: 'animationSpeed',
				label: 'Velocidade da animação',
				type: 'select',
				options: [
					{ label: 'Lenta', value: 'slow' },
					{ label: 'Normal', value: 'normal' },
					{ label: 'Rápida', value: 'fast' }
				]
			},
			{ path: 'sectionHeight', label: 'Altura desktop', type: 'text', placeholder: '100vh' },
			{ path: 'sectionHeightMobile', label: 'Altura mobile', type: 'text', placeholder: '100vh' }
		]
	},
	{
		type: 'curiosidades',
		label: 'Curiosidades',
		icon: '❓',
		category: 'Narrativa',
		hidden: true,
		description: 'Cartões animados com fatos e curiosidades.',
		component: Curiosidades,
		defaultData: {
			type: 'curiosidades',
			personagens: [],
			shapeColor: '#b51207',
			nameColor: '#0f172a',
			textColor: '#ffffff',
			backgroundColor: '#000000',
			quoteColor: '#ffd700'
		},
		fields: [
			{
				path: 'personagens',
				label: 'Itens (JSON)',
				type: 'json',
				rows: 8,
				placeholder: '[{"nome":"Curiosidade","descricao":"Texto","frase":"Quote"}]',
				emptyValue: []
			},
			{ path: 'shapeColor', label: 'Cor dos elementos', type: 'color' },
			{ path: 'nameColor', label: 'Cor do título', type: 'color' },
			{ path: 'textColor', label: 'Cor do texto', type: 'color' },
			{ path: 'backgroundColor', label: 'Cor de fundo', type: 'color' },
			{ path: 'quoteColor', label: 'Cor das citações', type: 'color' }
		]
	},
	{
		type: 'timeline-interactive',
		label: 'Timeline interativa',
		icon: '🗓️',
		category: 'Investigativo',
		hidden: true,
		description: 'Linha do tempo com eventos detalhados e animações.',
		component: TimelineInteractive,
		defaultData: {
			type: 'timeline-interactive',
			events: [],
			theme: 'dramatic',
			autoAdvance: false,
			showProgress: true,
			height: '100vh',
			fullWidth: false,
			highlightCurrent: true
		},
		fields: [
			{
				path: 'events',
				label: 'Eventos (JSON)',
				type: 'json',
				rows: 10,
				placeholder: '[{"title":"","date":"","description":""}]',
				emptyValue: []
			},
			{
				path: 'theme',
				label: 'Tema',
				type: 'select',
				options: [
					{ label: 'Investigativo', value: 'investigative' },
					{ label: 'Dramático', value: 'dramatic' },
					{ label: 'Clean', value: 'clean' }
				]
			},
			{ path: 'autoAdvance', label: 'Avanço automático', type: 'boolean' },
			{ path: 'showProgress', label: 'Mostrar barra de progresso', type: 'boolean' },
			{ path: 'height', label: 'Altura mínima', type: 'text', placeholder: '100vh' },
			{ path: 'fullWidth', label: 'Largura total', type: 'boolean' },
			{ path: 'highlightCurrent', label: 'Destacar evento atual', type: 'boolean' }
		]
	},
	{
		type: 'document-viewer',
		label: 'Documentos interativos',
		icon: '📄',
		category: 'Investigativo',
		hidden: true,
		description: 'Visualizador de documentos com marcações e galeria.',
		component: DocumentViewer,
		defaultData: {
			type: 'document-viewer',
			documents: [],
			classification: 'CONFIDENCIAL',
			theme: 'investigative',
			showWatermark: true,
			highlightAreas: [],
			allowDownload: false,
			showThumbnails: true
		},
		fields: [
			{
				path: 'documents',
				label: 'Documentos (JSON)',
				type: 'json',
				rows: 8,
				placeholder: '[{"title":"","src":"https://..."}]',
				emptyValue: []
			},
			{
				path: 'classification',
				label: 'Carimbo de classificação',
				type: 'text',
				placeholder: 'CONFIDENCIAL'
			},
			{
				path: 'theme',
				label: 'Tema',
				type: 'select',
				options: [
					{ label: 'Investigativo', value: 'investigative' },
					{ label: 'Neutro', value: 'neutral' },
					{ label: 'Escuro', value: 'dark' }
				]
			},
			{ path: 'showWatermark', label: 'Mostrar marca d água', type: 'boolean' },
			{
				path: 'highlightAreas',
				label: 'Áreas destacadas (JSON)',
				type: 'json',
				rows: 4,
				placeholder: '[{"page":1,"text":"..."}]',
				emptyValue: []
			},
			{ path: 'allowDownload', label: 'Permitir download', type: 'boolean' },
			{ path: 'showThumbnails', label: 'Mostrar miniaturas', type: 'boolean' }
		]
	},
	{
		type: 'crime-explainer',
		label: 'Crime Explainer',
		icon: '⚖️',
		category: 'Investigativo',
		hidden: true,
		description: 'Explica cada crime com penas, detalhes e interatividade.',
		component: CrimeExplainer,
		defaultData: {
			type: 'crime-explainer',
			crimes: [],
			theme: 'judicial',
			interactive: true,
			showPenalties: true,
			layout: 'cards',
			autoAdvance: false
		},
		fields: [
			{
				path: 'crimes',
				label: 'Lista de crimes (JSON)',
				type: 'json',
				rows: 8,
				placeholder: '[{"title":"","description":"","penalty":""}]',
				emptyValue: []
			},
			{
				path: 'theme',
				label: 'Tema visual',
				type: 'select',
				options: [
					{ label: 'Judicial', value: 'judicial' },
					{ label: 'Dramático', value: 'dramatic' },
					{ label: 'Clean', value: 'clean' }
				]
			},
			{ path: 'interactive', label: 'Interatividade ativada', type: 'boolean' },
			{ path: 'showPenalties', label: 'Mostrar penas', type: 'boolean' },
			{
				path: 'layout',
				label: 'Layout',
				type: 'select',
				options: [
					{ label: 'Cards', value: 'cards' },
					{ label: 'Linha do tempo', value: 'timeline' }
				]
			},
			{ path: 'autoAdvance', label: 'Avançar automaticamente', type: 'boolean' }
		]
	},
	{
		type: 'flexible-layout',
		label: 'Flexible Layout',
		icon: '🧬',
		category: 'Layout',
		hidden: true,
		description: 'Hero flexível com textos posicionados e duas camadas de mídia.',
		component: FlexibleLayout,
		defaultData: {
			type: 'flexible-layout',
			text: 'Cabeçalho impactante<br>com imagens posicionadas',
			textAlign: 'left',
			textPosition: 'left',
			backgroundColor: '#020617',
			textColor: '#f8fafc',
			fontSize: 'clamp(2rem, 5vw, 4rem)',
			fontSizeMobile: 'clamp(1.6rem, 8vw, 2.8rem)',
			minHeight: '90vh',
			minHeightMobile: '80vh',
			padding: '3rem',
			paddingMobile: '1.5rem',
			textZIndex: '12',
			image1Desktop: '',
			image1Mobile: '',
			image1Width: '320px',
			image1Height: 'auto',
			image1WidthMobile: '220px',
			image1HeightMobile: 'auto',
			image1X: '10%',
			image1Y: '20%',
			image1XMobile: '50%',
			image1YMobile: '10%',
			image1ZIndex: '8',
			image2Desktop: '',
			image2Mobile: '',
			image2Width: '520px',
			image2Height: 'auto',
			image2WidthMobile: '320px',
			image2HeightMobile: 'auto',
			image2X: '60%',
			image2Y: '40%',
			image2XMobile: '50%',
			image2YMobile: '55%',
			image2ZIndex: '2',
			image2Position: 'right'
		},
		fields: [
			{ path: 'text', label: 'Texto (HTML suportado)', type: 'richtext', rows: 4 },
			{
				path: 'textAlign',
				label: 'Alinhamento do texto',
				type: 'select',
				options: [
					{ label: 'Esquerda', value: 'left' },
					{ label: 'Centro', value: 'center' },
					{ label: 'Direita', value: 'right' }
				]
			},
			{
				path: 'textPosition',
				label: 'Posição do bloco de texto',
				type: 'select',
				options: [
					{ label: 'Esquerda', value: 'left' },
					{ label: 'Centro', value: 'center' },
					{ label: 'Direita', value: 'right' }
				]
			},
			{ path: 'backgroundColor', label: 'Cor de fundo', type: 'color' },
			{ path: 'textColor', label: 'Cor do texto', type: 'color' },
			{
				path: 'fontSize',
				label: 'Font size desktop',
				type: 'text',
				placeholder: 'clamp(2rem, 5vw, 4rem)'
			},
			{
				path: 'fontSizeMobile',
				label: 'Font size mobile',
				type: 'text',
				placeholder: 'clamp(1.6rem, 8vw, 2.8rem)'
			},
			{ path: 'minHeight', label: 'Altura mínima desktop', type: 'text', placeholder: '90vh' },
			{ path: 'minHeightMobile', label: 'Altura mínima mobile', type: 'text', placeholder: '80vh' },
			{ path: 'padding', label: 'Padding desktop', type: 'text', placeholder: '3rem' },
			{ path: 'paddingMobile', label: 'Padding mobile', type: 'text', placeholder: '1.5rem' },
			{ path: 'textZIndex', label: 'Z-index do texto', type: 'number' },
			{ path: 'image1Desktop', label: 'Imagem destaque desktop', type: 'url' },
			{ path: 'image1Mobile', label: 'Imagem destaque mobile', type: 'url' },
			{ path: 'image1Width', label: 'Largura imagem 1 desktop', type: 'text' },
			{ path: 'image1WidthMobile', label: 'Largura imagem 1 mobile', type: 'text' },
			{ path: 'image1X', label: 'Posição X desktop imagem 1', type: 'text' },
			{ path: 'image1Y', label: 'Posição Y desktop imagem 1', type: 'text' },
			{ path: 'image1XMobile', label: 'Posição X mobile imagem 1', type: 'text' },
			{ path: 'image1YMobile', label: 'Posição Y mobile imagem 1', type: 'text' },
			{ path: 'image1ZIndex', label: 'Z-index imagem 1', type: 'number' },
			{ path: 'image2Desktop', label: 'Imagem principal desktop', type: 'url' },
			{ path: 'image2Mobile', label: 'Imagem principal mobile', type: 'url' },
			{ path: 'image2Width', label: 'Largura imagem 2 desktop', type: 'text' },
			{ path: 'image2WidthMobile', label: 'Largura imagem 2 mobile', type: 'text' },
			{ path: 'image2X', label: 'Posição X desktop imagem 2', type: 'text' },
			{ path: 'image2Y', label: 'Posição Y desktop imagem 2', type: 'text' },
			{ path: 'image2XMobile', label: 'Posição X mobile imagem 2', type: 'text' },
			{ path: 'image2YMobile', label: 'Posição Y mobile imagem 2', type: 'text' },
			{ path: 'image2ZIndex', label: 'Z-index imagem 2', type: 'number' },
			{
				path: 'image2Position',
				label: 'Posicionamento imagem 2',
				type: 'select',
				options: [
					{ label: 'Esquerda', value: 'left' },
					{ label: 'Direita', value: 'right' }
				]
			}
		]
	},
	{
		type: 'responsive-media',
		label: 'Responsive Media Layout',
		icon: '🖥️',
		category: 'Layout',
		hidden: true,
		description: 'Canvas responsivo com textos e imagens posicionadas via JSON.',
		component: ResponsiveMediaLayout,
		defaultData: {
			type: 'responsive-media',
			heightDesktop: '100vh',
			heightMobile: '100vh',
			backgroundType: 'color',
			backgroundColor: '#020617',
			backgroundImageDesktop: '',
			backgroundImageMobile: '',
			backgroundVideoDesktop: '',
			backgroundVideoMobile: '',
			backgroundPositionDesktop: 'center center',
			backgroundPositionMobile: 'center center',
			backgroundSizeDesktop: 'cover',
			backgroundSizeMobile: 'cover',
			textos: [],
			imagens: []
		},
		fields: [
			{ path: 'heightDesktop', label: 'Altura desktop', type: 'text', placeholder: '100vh' },
			{ path: 'heightMobile', label: 'Altura mobile', type: 'text', placeholder: '100vh' },
			{
				path: 'backgroundType',
				label: 'Tipo de fundo',
				type: 'select',
				options: [
					{ label: 'Cor', value: 'color' },
					{ label: 'Imagem', value: 'image' },
					{ label: 'Vídeo', value: 'video' }
				]
			},
			{ path: 'backgroundColor', label: 'Cor de fundo', type: 'color' },
			{ path: 'backgroundImageDesktop', label: 'Imagem desktop', type: 'url' },
			{ path: 'backgroundImageMobile', label: 'Imagem mobile', type: 'url' },
			{ path: 'backgroundVideoDesktop', label: 'Vídeo desktop', type: 'url' },
			{ path: 'backgroundVideoMobile', label: 'Vídeo mobile', type: 'url' },
			{
				path: 'backgroundPositionDesktop',
				label: 'Background position desktop',
				type: 'text',
				placeholder: 'center center'
			},
			{
				path: 'backgroundPositionMobile',
				label: 'Background position mobile',
				type: 'text',
				placeholder: 'center center'
			},
			{
				path: 'backgroundSizeDesktop',
				label: 'Background size desktop',
				type: 'text',
				placeholder: 'cover'
			},
			{
				path: 'backgroundSizeMobile',
				label: 'Background size mobile',
				type: 'text',
				placeholder: 'cover'
			},
			{
				path: 'textos',
				label: 'Textos posicionados (JSON)',
				type: 'json',
				rows: 10,
				placeholder: '[{"content":"","fontSize":{"desktop":"4rem"}}]',
				emptyValue: []
			},
			{
				path: 'imagens',
				label: 'Imagens posicionadas (JSON)',
				type: 'json',
				rows: 8,
				placeholder: '[{"srcDesktop":"","position":{"desktop":{"x":"10%","y":"20%"}}}]',
				emptyValue: []
			}
		]
	},
	{
		type: 'free-canvas',
		label: 'Free Canvas',
		icon: '🖼️',
		category: 'Layout',
		description: 'Canvas livre com elementos arrastáveis em pixels.',
		component: FreeCanvas,
		defaultData: {
			type: 'free-canvas',
			minHeightDesktop: 400,
			maxHeightDesktop: null,
			minHeightMobile: 400,
			maxHeightMobile: null,
			backgroundSource: 'color',
			backgroundColor: '#000000',
			backgroundColorDesktop: '#000000',
			backgroundColorMobile: '#000000',
			backgroundImageDesktop: '',
			backgroundImageMobile: '',
			backgroundVideoDesktop: '',
			backgroundVideoMobile: '',
			backgroundVideoPosterDesktop: '',
			backgroundVideoPosterMobile: '',
			videoAutoplay: true,
			videoLoop: true,
			videoMuted: true,
			items: []
		},
		fields: []
	},
	{
		type: 'ancora',
		label: 'Ponto de âncora',
		icon: '⛳️',
		category: 'Utilitário',
		hidden: true,
		description: 'Marca um ponto da página para navegação interna.',
		component: AnchorPoint,
		defaultData: {
			type: 'ancora',
			id: 'bloco-1'
		},
		fields: [{ path: 'id', label: 'ID da âncora', type: 'text', required: true }]
	}
];

export function getComponentDefinition(type) {
	return componentRegistry.find((component) => component.type === type);
}

export function listComponentsByCategory() {
	return componentRegistry.reduce((acc, component) => {
		if (component.hidden) {
			return acc;
		}
		const category = component.category || 'Outros';
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(component);
		return acc;
	}, {});
}
