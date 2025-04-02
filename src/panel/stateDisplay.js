import { createElement } from './domHelper.js';
import { selectTreeNode } from './treeBuilder.js';

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
		innerHTML: `<span class="property-key">id:</span> ${componentId}`,
		parent: metadataSection
	});

	// Parent ID
	createElement({
		type: 'div',
		className: 'state-property',
		innerHTML: `<span class="property-key">parent id:</span> ${state.parentId}`,
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
			parent: flowsSection,
			events: {
				mouseenter: () => {
					chrome.runtime.sendMessage({
						action: 'OPUS_ASK_SHOW_FLOW',
						data: flow
					});
				},
				mouseleave: () => {
					chrome.runtime.sendMessage({ action: 'OPUS_ASK_HIDE_FLOW' });
				}
			}
		});

		const idFrom = flow.from.length > 9 ? `${flow.from.substring(0, 8)}&hellip;` : flow.from;
		createElement({
			type: 'div',
			className: 'flow-block',
			innerHTML: `${idFrom}.${flow.fromKey}`,
			parent: flowItem,
			events: {
				click: () => {
					selectTreeNode(flow.from);

					chrome.runtime.sendMessage({ action: 'OPUS_ASK_HIDE_FLOW' });
				}
			}
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
			parent: flowItem,
			events: {
				click: () => {
					selectTreeNode(flow.to);

					chrome.runtime.sendMessage({ action: 'OPUS_ASK_HIDE_FLOW' });
				}
			}
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

		const propertyContainer = createElement({
			type: 'div',
			className: 'state-property',
			parent: stateSection
		});

		// Create the property key
		createElement({
			type: 'span',
			className: 'property-key',
			textContent: `${key}:`,
			parent: propertyContainer
		});

		// Add a space after the key
		propertyContainer.appendChild(document.createTextNode(' '));

		// Handle different value types
		if (typeof value === 'boolean') {
			// Create a checkbox for boolean values
			const checkbox = createElement({
				type: 'input',
				attributes: {
					type: 'checkbox',
					checked: value
				},
				className: 'state-boolean-checkbox',
				parent: propertyContainer,
				events: {
					change: e => {
						chrome.runtime.sendMessage({
							action: 'OPUS_ASK_SET_COMPONENT_STATE',
							data: {
								target: componentId,
								key,
								value: e.target.checked
							}
						});
					}
				}
			});
		} else if (typeof value === 'number') {
			// Create a number input for numeric values
			const numberInput = createElement({
				type: 'input',
				attributes: {
					type: 'number',
					value
				},
				className: 'state-number-input',
				parent: propertyContainer,
				events: {
					input: e => {
						const newValue = e.target.valueAsNumber;
						chrome.runtime.sendMessage({
							action: 'OPUS_ASK_SET_COMPONENT_STATE',
							data: {
								target: componentId,
								key,
								value: newValue
							}
						});
					}
				}
			});
		} else if (typeof value === 'string') {
			// Create a text input for string values
			const textInput = createElement({
				type: 'input',
				attributes: {
					type: 'text',
					value
				},
				className: 'state-string-input',
				parent: propertyContainer,
				events: {
					input: e => {
						chrome.runtime.sendMessage({
							action: 'OPUS_ASK_SET_COMPONENT_STATE',
							data: {
								target: componentId,
								key,
								value: e.target.value
							}
						});
					}
				}
			});
		} else if (value === null) {
			createElement({
				type: 'span',
				className: 'state-null',
				textContent: 'null',
				parent: propertyContainer
			});
		} else if (value === undefined) {
			createElement({
				type: 'span',
				className: 'state-undefined',
				textContent: 'undefined',
				parent: propertyContainer
			});
		} else if (typeof value === 'object') {
			// Arrays and objects are not editable
			createElement({
				type: 'span',
				className: 'state-object',
				textContent: JSON.stringify(value),
				parent: propertyContainer
			});
		}
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
		buildSectionScripts(stateContent, componentId, domNode, state);
};

export { displayStateInSidebar };
