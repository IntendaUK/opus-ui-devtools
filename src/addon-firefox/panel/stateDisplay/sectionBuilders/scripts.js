import { createElement } from '../../domHelper.js';

const buildSectionScripts = (stateContent, componentId, domNode, state) => {
	const scpsSection = createElement({
		type: 'div',
		className: 'sidebar-section',
		parent: stateContent
	});

	createElement({
		type: 'div',
		className: 'section-header',
		textContent: 'SCPs',
		parent: scpsSection
	});

	// SCPs are arrays, so they're not editable
	const scpsContainer = createElement({
		type: 'div',
		className: 'state-property',
		parent: scpsSection
	});

	createElement({
		type: 'span',
		className: 'property-key',
		textContent: 'scps:',
		parent: scpsContainer
	});

	createElement({
		type: 'span',
		className: 'state-object',
		textContent: JSON.stringify(state.scps),
		parent: scpsContainer
	});
};

export default buildSectionScripts;
