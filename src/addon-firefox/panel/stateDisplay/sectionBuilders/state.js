import { createElement } from '../../domHelper.js';

const ignoreKeys = ['id', 'type', 'flows', 'scps', 'path', 'updates', 'parentId', 'indexInParent', 'tags'];

// Create a tree view for object values
const createObjectTree = (obj, parent, initiallyExpanded = true) => {
	const container = createElement({
		type: 'div',
		className: 'object-tree-container',
		parent
	});

	// Create the toggle icon
	const toggleIcon = createElement({
		type: 'span',
		className: `toggle-icon ${initiallyExpanded ? '' : 'collapsed'}`,
		textContent: '▼',
		style: {
			cursor: 'pointer',
			marginRight: '4px',
			userSelect: 'none',
			display: 'inline-block',
			width: '12px',
			textAlign: 'center',
			color: 'var(--fg-color)',
			transition: 'transform 0.2s',
			transform: initiallyExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
		},
		events: {
			click: () => {
				const isExpanded = !toggleIcon.classList.contains('collapsed');
				toggleIcon.classList.toggle('collapsed', isExpanded);
				toggleIcon.style.transform = isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)';
				childrenContainer.style.display = isExpanded ? 'none' : 'block';
			}
		},
		parent: container
	});

	// Create the object type indicator
	const typeIndicator = createElement({
		type: 'span',
		className: 'object-type',
		textContent: Array.isArray(obj) ? '[ ]' : '{ }',
		style: {
			color: 'var(--accent-color)',
			cursor: 'pointer'
		},
		events: {
			click: () => {
				// Trigger the same toggle action as the icon
				toggleIcon.click();
			}
		},
		parent: container
	});

	// Create container for child properties
	const childrenContainer = createElement({
		type: 'div',
		className: 'object-children',
		style: {
			marginLeft: '16px',
			display: initiallyExpanded ? 'block' : 'none'
		},
		parent: container
	});

	// Handle arrays and objects differently
	if (Array.isArray(obj)) {
		obj.forEach((item, index) => {
			const itemContainer = createElement({
				type: 'div',
				className: 'array-item',
				parent: childrenContainer
			});

			// Create the index key
			createElement({
				type: 'span',
				className: 'property-key',
				textContent: `${index}:`,
				parent: itemContainer
			});

			// Add a space after the key
			itemContainer.appendChild(document.createTextNode(' '));

			// Render the value based on its type
			renderValue(item, itemContainer);
		});
	} else {
		// Get all keys and sort them
		const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));

		keys.forEach(key => {
			const propertyContainer = createElement({
				type: 'div',
				className: 'object-property',
				parent: childrenContainer
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

			// Render the value based on its type
			renderValue(obj[key], propertyContainer);
		});
	}

	return container;
};

// Helper function to render a value based on its type
const renderValue = (value, parent) => {
	if (value === null) {
		createElement({
			type: 'span',
			className: 'state-null',
			textContent: 'null',
			parent
		});
	} else if (value === undefined) {
		createElement({
			type: 'span',
			className: 'state-undefined',
			textContent: 'undefined',
			parent
		});
	} else if (typeof value === 'boolean') {
		createElement({
			type: 'span',
			className: 'state-boolean',
			textContent: value.toString(),
			style: {
				color: 'var(--accent-color)'
			},
			parent
		});
	} else if (typeof value === 'number') {
		createElement({
			type: 'span',
			className: 'state-number',
			textContent: value.toString(),
			style: {
				color: 'var(--accent-color)'
			},
			parent
		});
	} else if (typeof value === 'string') {
		createElement({
			type: 'span',
			className: 'state-string',
			textContent: `"${value}"`,
			style: {
				color: 'var(--accent-color)'
			},
			parent
		});
	} else if (typeof value === 'object') {
		// Recursively create a tree for nested objects
		createObjectTree(value, parent, false);
	} else {
		// Fallback for other types
		createElement({
			type: 'span',
			className: 'state-other',
			textContent: String(value),
			parent
		});
	}
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

	const stateKeys = Object.keys(state)
		.filter(key => !ignoreKeys.includes(key));

	stateKeys.sort((a, b) => a.localeCompare(b));

	stateKeys.forEach(key => {
		const value = state[key];

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
			// Render objects as expandable/collapsible trees
			createObjectTree(value, propertyContainer);
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

export default buildSectionState;
