import { createElement } from '../../domHelper.js';

const getShortId = id => {
	const displayId = id.length > 9 ? `${id.substring(0, 8)}&hellip;` : id;

	return displayId;
};

const buildSectionInfo = (stateContent, componentId, domNode, state) => {
	const metadataSection = createElement({
		type: 'div',
		className: 'sidebar-section',
		parent: stateContent
	});

	createElement({
		type: 'div',
		className: 'section-header',
		textContent: 'Component Info',
		parent: metadataSection
	});

	// ID
	createElement({
		type: 'div',
		className: 'state-property',
		innerHTML: `<span class="property-key">id:</span> ${getShortId(componentId)}`,
		parent: metadataSection
	});

	// Parent ID
	createElement({
		type: 'div',
		className: 'state-property',
		innerHTML: `<span class="property-key">parent id:</span> ${getShortId(state.parentId)}`,
		parent: metadataSection
	});

	// Index in parent
	createElement({
		type: 'div',
		className: 'state-property',
		innerHTML: `<span class="property-key">index in parent:</span> ${state.indexInParent}`,
		parent: metadataSection
	});

	// Type
	createElement({
		type: 'div',
		className: 'state-property',
		innerHTML: `<span class="property-key">type:</span> ${state.type}`,
		parent: metadataSection
	});

	// Scopes
	if (domNode.scopes?.length > 0) {
		const scopeValue = domNode.scopes.join(', ');
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">scope:</span> ${scopeValue}`,
			parent: metadataSection
		});
	}

	// RelId
	if (domNode.relId) {
		const relIdValue = domNode.relId;
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">relId:</span> ${relIdValue}`,
			parent: metadataSection
		});
	}

	// Path
	if (state.path) {
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">path:</span> ${state.path}`,
			parent: metadataSection
		});
	}

	// Re-renders
	if (state.updates > 0) {
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">re-renders:</span> ${state.updates + 1}`,
			parent: metadataSection
		});
	}

	// Tags
	if (state.tags.length > 0) {
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">tags:</span> ${state.tags.join(', ')}`,
			parent: metadataSection
		});
	}
};

export default buildSectionInfo;
