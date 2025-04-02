import { createElement } from './domHelper.js';
import { getScopeColor } from './colors.js';

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
	
	createElement({
		type: 'div',
		className: 'state-property',
		innerHTML: `<span class="property-key">id:</span> ${componentId}`,
		parent: metadataSection
	});

	createElement({
		type: 'div',
		className: 'state-property',
		innerHTML: `<span class="property-key">parent id:</span> ${state.parentId}`,
		parent: metadataSection
	});

	createElement({
		type: 'div',
		className: 'state-property',
		innerHTML: `<span class="property-key">index in parent:</span> ${state.indexInParent}`,
		parent: metadataSection
	});

	createElement({
		type: 'div',
		className: 'state-property',
		innerHTML: `<span class="property-key">type:</span> ${state.type}`,
		parent: metadataSection
	});
	
	if (domNode.scopes?.length > 0) {
		const scopeValue = domNode.scopes.join(', ');
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">scope:</span> ${scopeValue}`,
			parent: metadataSection
		});
	}
	
	if (domNode.relId) {
		const relIdValue = domNode.relId;
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">relId:</span> ${relIdValue}`,
			parent: metadataSection
		});
	}
	
	if (state.path) {
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">path:</span> ${state.path}`,
			parent: metadataSection
		});
	}

	if (state.updates > 0) {
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">re-renders:</span> ${state.updates + 1}`,
			parent: metadataSection
		});
	}

	if (state.tags.length > 0) {
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">tags:</span> ${state.tags.join(', ')}`,
			parent: metadataSection
		});
	}
};

const buildSectionFlows = (stateContent, componentId, domNode, state) => {
	const flowsSection = createElement({
		type: 'div',
		className: 'sidebar-section',
		parent: stateContent
	});
	
	createElement({
		type: 'div',
		className: 'section-header',
		textContent: 'Flows',
		parent: flowsSection
	});
	
	state.flows.forEach(flow => {
		const flowItem = createElement({
			type: 'div',
			className: 'flow-item',
			parent: flowsSection
		});
		
		const idFrom = flow.from.length > 9 ? `${flow.from.substring(0, 8)}&hellip;` : flow.from;
		createElement({
			type: 'div',
			className: 'flow-block',
			innerHTML: `${idFrom}.${flow.fromKey}`,
			parent: flowItem
		});
		
		// Arrow
		createElement({
			type: 'div',
			className: 'flow-arrow',
			textContent: '→',
			parent: flowItem
		});
		
		const idTo = flow.to.length > 9 ? `${flow.to.substring(0, 8)}&hellip;` : flow.to;
		createElement({
			type: 'div',
			className: 'flow-block',
			innerHTML: `${idTo}.${flow.toKey}`,
			parent: flowItem
		});
	});
};

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
	
	createElement({
		type: 'div',
		className: 'state-property',
		innerHTML: `<span class="state-array">${JSON.stringify(state.scps)}</span>`,
		parent: scpsSection
	});
};

const buildSectionState = (stateContent, componentId, domNode, state) => {
	const stateSection = createElement({
		type: 'div',
		className: 'sidebar-section',
		parent: stateContent
	});

	createElement({
		type: 'div',
		className: 'section-header',
		textContent: 'State',
		parent: stateSection
	});
	
	Object.entries(state).forEach(([key, value]) => {
		if (['id', 'type', 'flows', 'scps', 'path', 'updates', 'parentId', 'indexInParent', 'tags'].includes(key))
			return;
		
		let displayValue = value;
		if (typeof value === 'boolean') {
			displayValue = `<span class="state-boolean">${value}</span>`;
		} else if (typeof value === 'number') {
			displayValue = `<span class="state-number">${value}</span>`;
		} else if (value === null) {
			displayValue = `<span class="state-null">null</span>`;
		} else if (value === undefined) {
			displayValue = `<span class="state-undefined">undefined</span>`;
		} else if (typeof value === 'object') {
			displayValue = `<span class="state-object">${JSON.stringify(value)}</span>`;
		}
		
		createElement({
			type: 'div',
			className: 'state-property',
			innerHTML: `<span class="property-key">${key}:</span> ${displayValue}`,
			parent: stateSection
		});
	});
	
	if (state.timestamp) {
		createElement({
			type: 'div',
			className: 'state-timestamp',
			innerHTML: `<small>Updated: ${new Date(state.timestamp).toLocaleTimeString()}</small>`,
			parent: stateContent
		});
	}
};

// Display component state in the sidebar
const displayStateInSidebar = (data, componentId, domNode) => {
	const stateContent = document.getElementById('state-content');
	stateContent.innerHTML = '';

	if (!data) {
		stateContent.textContent = 'No state available for this component';
		return;
	}

	const state = data.state;

	buildSectionInfo(stateContent, componentId, domNode, state);

	buildSectionState(stateContent, componentId, domNode, state);

	if (state.flows?.length > 0)
		buildSectionFlows(stateContent, componentId, domNode, state);

	if (state.scps?.length > 0)
		buildSectionFlows(stateContent, componentId, domNode, state);
};

export {
	displayStateInSidebar
};
