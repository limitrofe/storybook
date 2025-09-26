const BASE_CLASS = 'story-section';

export function getSectionStyling(paragraph = {}) {
	const section = paragraph?.section || {};
	const styles = [];
	const classNames = [BASE_CLASS, `${BASE_CLASS}--${(paragraph.type || 'block').toLowerCase()}`];

	if (section.backgroundColor) {
		styles.push(`background:${section.backgroundColor}`);
		classNames.push(`${BASE_CLASS}--with-background`);
	}

	if (section.textColor) {
		styles.push(`color:${section.textColor}`);
		styles.push(`--story-text-color:${section.textColor}`);
		classNames.push(`${BASE_CLASS}--with-text-color`);
	}

	if (section.paddingTop !== undefined && section.paddingTop !== '') {
		styles.push(`--story-section-padding-top:${section.paddingTop}`);
	}

	if (section.paddingBottom !== undefined && section.paddingBottom !== '') {
		styles.push(`--story-section-padding-bottom:${section.paddingBottom}`);
	}

	return {
		className: classNames.filter(Boolean).join(' '),
		style: styles.length ? styles.join(';') : undefined
	};
}
