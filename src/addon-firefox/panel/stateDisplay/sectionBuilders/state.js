import { createElement } from '../../domHelper.js';
import { getKey as getGlobalConfigKey } from '../../globalConfig.js';

// Global variable to track the currently open dropdown
let activeDropdown = null;

// Function to close any open dropdown
const closeActiveDropdown = () => {
	if (activeDropdown) {
		activeDropdown.remove();
		activeDropdown = null;
	}
};

// Add a global click event listener to close dropdowns when clicking outside
document.addEventListener('click', (e) => {
	// If we clicked on a dropdown or its trigger, the dropdown's own click handlers will manage it
	if (!e.target.closest('.custom-dropdown') && !e.target.closest('.custom-dropdown-trigger')) {
		closeActiveDropdown();
	}
});

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
			parent
		});
	} else if (typeof value === 'number') {
		createElement({
			type: 'span',
			className: 'state-number',
			textContent: value.toString(),
			parent
		});
	} else if (typeof value === 'string') {
		createElement({
			type: 'span',
			className: 'state-string',
			textContent: `"${value}"`,
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

	const propSpec = getGlobalConfigKey('propSpecs')[state.type];

	const entries = stateKeys.map(key => {
		const res = {
			key,
			value: state[key]
		};

		if (propSpec[key]?.options)
			res.options = propSpec[key].options;

		return res;
	});

	entries.forEach(({ key, value, options }) => {
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
			if (options && Array.isArray(options)) {
				// Create a container for the dropdown
				const dropdownContainer = createElement({
					type: 'div',
					className: 'custom-dropdown-container',
					parent: propertyContainer
				});
				
				// Create the value display element
				const valueDisplay = createElement({
					type: 'span',
					className: 'dropdown-value',
					textContent: value,
					parent: dropdownContainer
				});
				
				// Create a custom dropdown trigger
				const dropdownTrigger = createElement({
					type: 'div',
					className: 'custom-dropdown-trigger',
					parent: dropdownContainer,
					events: {
						click: (e) => {
							e.stopPropagation(); // Prevent the document click handler from firing
							
							// Close any existing dropdown
							closeActiveDropdown();
							
							// Create and position the dropdown
							const dropdown = createElement({
								type: 'div',
								className: 'custom-dropdown',
								parent: document.body // Append to body to avoid containment issues
							});
							
							// Calculate position
							const rect = dropdownTrigger.getBoundingClientRect();
							dropdown.style.top = `${rect.bottom}px`;
							dropdown.style.left = `${rect.left}px`;
							
							// Add options to the dropdown
							options.forEach(optionValue => {
								const option = createElement({
									type: 'div',
									className: `dropdown-option ${optionValue === value ? 'selected' : ''}`,
									textContent: optionValue,
									events: {
										click: (e) => {
											e.stopPropagation();
											
											// Update the value display text
											valueDisplay.textContent = optionValue;
											
											// Send the update message
											chrome.runtime.sendMessage({
												action: 'OPUS_ASK_SET_COMPONENT_STATE',
												data: {
													target: componentId,
													key,
													value: optionValue
												}
											});
											
											// Close the dropdown
											closeActiveDropdown();
										},
										mouseover: (e) => {
											e.target.style.backgroundColor = 'var(--select-bg)';
										},
										mouseout: (e) => {
											if (optionValue !== value) {
												e.target.style.backgroundColor = 'transparent';
											}
										}
									},
									parent: dropdown
								});
							});
							
							// Store the active dropdown
							activeDropdown = dropdown;
						}
					}
				});
				
				// Add the value display to the trigger
				valueDisplay.remove(); // Remove from container
				dropdownTrigger.appendChild(valueDisplay); // Add to trigger
				
				// Add a dropdown indicator
				createElement({
					type: 'span',
					className: 'dropdown-icon',
					textContent: '▼',
					parent: dropdownTrigger
				});
			} else {
				// Create a text input for string values without options
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
			}
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
