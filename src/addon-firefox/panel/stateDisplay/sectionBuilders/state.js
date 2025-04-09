import { createElement } from '../../domHelper.js';

const ignoreKeys = ['id', 'type', 'flows', 'scps', 'path', 'updates', 'parentId', 'indexInParent', 'tags'];

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

export default buildSectionState;
