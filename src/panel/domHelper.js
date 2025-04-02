/**
 * Helper function to create DOM elements with specified properties
 * @param {Object} options - Configuration options for the element
 * @param {string} options.type - Element type (div, span, input, etc.)
 * @param {string|string[]} [options.className] - CSS class name(s) to apply
 * @param {string} [options.innerHTML] - HTML content to set
 * @param {string} [options.textContent] - Text content to set
 * @param {Object} [options.style] - Style properties to apply
 * @param {Object} [options.attributes] - HTML attributes to set
 * @param {Object} [options.dataset] - Dataset attributes to set
 * @param {Object} [options.events] - Event listeners to attach
 * @param {HTMLElement} [options.parent] - Parent element to append to
 * @returns {HTMLElement} The created element
 */
const createElement = (options) => {
	const {
		type,
		className,
		innerHTML,
		textContent,
		style,
		attributes,
		dataset,
		events,
		parent
	} = options;

	// Create the element
	const element = document.createElement(type);

	// Set class name(s)
	if (className) {
		if (Array.isArray(className)) {
			element.className = className.join(' ');
		} else {
			element.className = className;
		}
	}

	// Set content (innerHTML takes precedence over textContent)
	if (innerHTML !== undefined) {
		element.innerHTML = innerHTML;
	} else if (textContent !== undefined) {
		element.textContent = textContent;
	}

	// Set style properties
	if (style) {
		Object.entries(style).forEach(([property, value]) => {
			element.style[property] = value;
		});
	}

	// Set attributes
	if (attributes) {
		Object.entries(attributes).forEach(([name, value]) => {
			element.setAttribute(name, value);
		});
	}

	// Set dataset properties
	if (dataset) {
		Object.entries(dataset).forEach(([name, value]) => {
			element.dataset[name] = value;
		});
	}

	// Add event listeners
	if (events) {
		Object.entries(events).forEach(([event, handler]) => {
			element.addEventListener(event, handler);
		});
	}

	// Append to parent if provided
	if (parent) {
		parent.appendChild(element);
	}

	return element;
};

export {
	createElement
};
