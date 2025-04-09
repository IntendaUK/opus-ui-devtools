import { createElement } from '../../../domHelper.js';

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

export default createObjectTree;
