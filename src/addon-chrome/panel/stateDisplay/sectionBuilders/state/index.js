import { createElement } from '../../../domHelper.js';
import { getKey as getGlobalConfigKey } from '../../../globalConfig.js';
import createObjectTree from './createObjectTree.js';

const tabId = chrome.devtools.inspectedWindow.tabId;

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
document.addEventListener('click', e => {
	// If we clicked on a dropdown or its trigger, the dropdown's own click handlers will manage it
	if (!e.target.closest('.custom-dropdown') && !e.target.closest('.custom-dropdown-trigger'))
		closeActiveDropdown();
});

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

	const basePropSpec = getGlobalConfigKey('propSpecs').baseProps;
	const propSpec = getGlobalConfigKey('propSpecs')[state.type];

	// Categorize entries into sections
	const categorizeEntry = key => {
		if (!propSpec || propSpec[key] === undefined) return 'custom';
		if (propSpec[key].cssAttr !== undefined) return 'cssAttributes';
		if (propSpec[key].cssVar !== undefined) return 'cssVariables';
		if (propSpec[key].internal === true) return 'internal';
		if (propSpec[key].classMap !== undefined) return 'cssClasses';
		// Check if it's in propSpec but not in baseProps
		if (propSpec[key] !== undefined && (!basePropSpec || basePropSpec[key] === undefined)) return 'own';

		return 'other';
	};

	// Create entries with category information
	const entries = stateKeys.map(key => {
		const res = {
			key,
			value: state[key],
			category: categorizeEntry(key)
		};

		if (propSpec && propSpec[key]?.options)
			res.options = propSpec[key].options;

		return res;
	});

	// Track rendered properties to ensure they only appear in one section
	const renderedProperties = new Set();

	// Group entries by category
	const categorizedEntries = {
		custom: entries.filter(entry => entry.category === 'custom'),
		cssAttributes: entries.filter(entry => entry.category === 'cssAttributes'),
		cssVariables: entries.filter(entry => entry.category === 'cssVariables'),
		internal: entries.filter(entry => entry.category === 'internal'),
		cssClasses: entries.filter(entry => entry.category === 'cssClasses'),
		own: entries.filter(entry => entry.category === 'own'),
		other: entries.filter(entry => entry.category === 'other')
	};

	// Section titles
	const sectionTitles = {
		custom: 'Custom',
		cssAttributes: 'CSS Attributes',
		cssVariables: 'CSS Variables',
		internal: 'Internal',
		cssClasses: 'CSS Classes',
		own: 'Own',
		other: 'Other'
	};

	// Define the order of sections to ensure properties are rendered in the correct order
	const sectionOrder = ['custom', 'own', 'cssAttributes', 'cssVariables', 'cssClasses', 'internal', 'other'];

	// Create sections for each category in the defined order
	sectionOrder.forEach(category => {
	// Filter out properties that have already been rendered
		const categoryEntries = categorizedEntries[category].filter(entry => !renderedProperties.has(entry.key));

		// Skip empty categories
		if (categoryEntries.length === 0) return;

		// Add all properties in this section to the rendered set
		categoryEntries.forEach(entry => renderedProperties.add(entry.key));

		// Create section for this category
		const categorySection = createElement({
			type: 'div',
			className: 'state-category',
			parent: stateSection
		});

		// Add category title with collapse/expand functionality
		const headerElement = createElement({
			type: 'div',
			className: 'category-header',
			parent: categorySection
		});

		// Add collapse/expand icon
		const collapseIcon = createElement({
			type: 'span',
			className: 'collapse-icon',
			textContent: '▼', // Down arrow for expanded state
			parent: headerElement
		});

		// Add space after icon
		headerElement.appendChild(document.createTextNode(' '));

		// Add title text
		createElement({
			type: 'span',
			textContent: sectionTitles[category],
			parent: headerElement
		});

		// Create content container that can be collapsed
		// Start with collapsed state for all sections except 'custom' and 'own'
		const shouldBeCollapsed = category !== 'custom' && category !== 'own';
		const contentContainer = createElement({
			type: 'div',
			className: `category-content${shouldBeCollapsed ? ' collapsed' : ''}`,
			parent: categorySection
		});

		// Set initial collapse icon based on collapsed state
		collapseIcon.textContent = shouldBeCollapsed ? '▶' : '▼';

		// Add click event to header for collapsing/expanding
		headerElement.addEventListener('click', e => {
		// Toggle the collapsed state
			contentContainer.classList.toggle('collapsed');
			// Toggle the icon
			collapseIcon.textContent = contentContainer.classList.contains('collapsed') ? '▶' : '▼';
		});

		// Add entries for this category to the content container
		categoryEntries.forEach(({ key, value, options }) => {
			const propertyContainer = createElement({
				type: 'div',
				className: 'state-property',
				parent: contentContainer
			});

			// Create the property key
			createElement({
				type: 'span',
				className: 'property-key',
				textContent: key,
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
								tabId,
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
								tabId,
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
							click: e => {
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
											click: e => {
												e.stopPropagation();

												// Update the value display text
												valueDisplay.textContent = optionValue;

												// Send the update message
												chrome.runtime.sendMessage({
													action: 'OPUS_ASK_SET_COMPONENT_STATE',
													tabId,
													data: {
														target: componentId,
														key,
														value: optionValue
													}
												});

												// Close the dropdown
												closeActiveDropdown();
											},
											mouseover: e => {
												e.target.style.backgroundColor = 'var(--select-bg)';
											},
											mouseout: e => {
												if (optionValue !== value)
													e.target.style.backgroundColor = 'transparent';
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
									tabId,
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
