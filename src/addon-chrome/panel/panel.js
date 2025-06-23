/* eslint-disable max-lines-per-function, no-inline-comments, max-lines */

import { buildTreeMap, createHtmlFromTree, selectTreeNode } from './treeBuilder.js';
import { displayStateInSidebar } from './stateDisplay/index.js';
import { set as setGlobalConfig } from './globalConfig.js';
import './search.js';

const tabId = chrome.devtools.inspectedWindow.tabId;

let domData;
let selectedComponentId;
let componentTypeFilters = new Map(); // Map to store component type filters
let filterDropdown = null; // Reference to the filter dropdown element
let testIdDropdown = null; // Reference to the test id dropdown element

// Function to get all unique component types from the data
const getComponentTypes = () => {
	if (!Array.isArray(domData)) return [];

	// Extract unique component types
	const types = new Set();
	domData.forEach(node => {
		if (node.type) types.add(node.type);
	});

	return Array.from(types).sort();
};

// Function to handle clicks on a test ID item
const onClickFindTestId = clickedType => {
	const isFiltered = clickedType.includes('Filtered');
	clickedType = clickedType.replace('Filtered ', '');

	const isGridCell = clickedType.includes('Grid Cell');
	clickedType = clickedType.replace('Grid Cell ', '');

	chrome.runtime.sendMessage({
		action: 'OPUS_ASK_BUILD_TEST_ID_LOCATOR',
		tabId,
		data: {
			elementId: selectedComponentId,
			findType: clickedType,
			isFiltered,
			isGridCell
		}
	});
};

// Function to create the Test ID dropdown
const createTestIdDropdown = () => {
	// If a dropdown already exists, remove it
	const existing = document.getElementById('testid-dropdown');
	if (existing)
		existing.remove();

	// Create the dropdown container
	testIdDropdown = document.createElement('div');
	testIdDropdown.className = 'dropdown';
	testIdDropdown.id = 'testid-dropdown';

	// Optional: a header or title for the dropdown
	const header = document.createElement('div');
	header.className = 'dropdown-header';
	header.textContent = 'Select Test ID';
	testIdDropdown.appendChild(header);

	// List of test ID types
	const testIdTypes = [
		'Basic',
		'Input',
		'Click',
		'Filtered Click',
		'Grid Cell Click',
		'Grid Cell Input'
	];

	// Create a container for the items
	const content = document.createElement('div');
	content.className = 'dropdown-content';
	testIdDropdown.appendChild(content);

	// For each type, create a clickable item
	testIdTypes.forEach(type => {
		const item = document.createElement('div');
		item.className = 'dropdown-item';
		item.textContent = type;

		item.addEventListener('click', e => {
			e.stopPropagation();
			onClickFindTestId(type);
			testIdDropdown.classList.toggle('visible', false);
		});

		content.appendChild(item);
	});

	document.querySelector('.search-wrapper').appendChild(testIdDropdown);

	// ────────────────────────────────────────────────────────────────────────────
	// New "Resolve Test ID" section
	// ────────────────────────────────────────────────────────────────────────────
	const resolveHeader = document.createElement('div');
	resolveHeader.className = 'dropdown-header';
	resolveHeader.textContent = 'Resolve Test ID';
	testIdDropdown.appendChild(resolveHeader);

	const resolveContainer = document.createElement('div');
	resolveContainer.className = 'resolve-container';

	const input = document.createElement('input');
	input.type = 'text';
	input.className = 'resolve-input';
	input.placeholder = 'Enter selector';
	resolveContainer.appendChild(input);

	const button = document.createElement('button');
	button.className = 'resolve-button';
	button.textContent = 'Resolve';
	resolveContainer.appendChild(button);

	testIdDropdown.appendChild(resolveContainer);

	// Helper to run the query in the inspected window and log the count
	const runQuery = () => {
		const selector = input.value.trim();
		if (!selector)
			return;

		chrome.devtools.inspectedWindow.eval(
			`(() => {
			 const els = document.querySelectorAll(${JSON.stringify(selector)});
			 // always dump the NodeList
			 console.log('Matched elements:', els);
			 const n = els.length;
			 if (n > 1) {
			   console.error(\`❌ \${n} element(s) matched. Invalid selector.\`);
			 } else {
			   console.log(\`🧮 \${n} element(s) found for selector.\`);
			 }
			 return n;
			})()`,
			(count, exceptionDetails) => {
				if (exceptionDetails) {
					// if the snippet itself blew up, report here:
					console.error('Error running selector-check snippet:', exceptionDetails);
				}
				// otherwise everything (logs + errors) already fired in the *page* console
			}
		);

		testIdDropdown.classList.toggle('visible', false);
		input.value = '';
	};

	// Wire up Enter key and button click
	input.addEventListener('keydown', e => {
		if (e.key === 'Enter') {
			e.preventDefault();
			runQuery();
		}
	});
	button.addEventListener('click', e => {
		e.stopPropagation();
		runQuery();
	});

	// Return the dropdown element in case the caller needs it
	return testIdDropdown;
};

// Function to create the filter dropdown
const createFilterDropdown = () => {
	// Remove existing dropdown if it exists
	if (filterDropdown)
		filterDropdown.remove();

	// Create the dropdown element
	filterDropdown = document.createElement('div');
	filterDropdown.id = 'filter-dropdown';

	// Create header
	const header = document.createElement('div');
	header.className = 'filter-dropdown-header';
	header.textContent = 'Filter Component Types';
	filterDropdown.appendChild(header);

	// Create content container
	const content = document.createElement('div');
	content.className = 'filter-dropdown-content';
	filterDropdown.appendChild(content);

	// Get all component types
	const componentTypes = getComponentTypes();

	// Initialize filters if empty
	if (componentTypeFilters.size === 0) {
		componentTypes.forEach(type => {
			componentTypeFilters.set(type, true); // All checked by default
		});
	}

	// Add filter items for each component type
	componentTypes.forEach(type => {
		const isChecked = componentTypeFilters.get(type) !== false;

		const item = document.createElement('div');
		item.className = 'filter-item';

		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.className = 'filter-checkbox';
		checkbox.checked = isChecked;
		checkbox.dataset.type = type;

		const label = document.createElement('span');
		label.className = 'filter-label';
		label.textContent = type;

		// Add event listener to checkbox
		checkbox.addEventListener('change', e => {
			e.stopPropagation();
			componentTypeFilters.set(type, checkbox.checked);
			applyFilters();
		});

		// Add event listener to label for exclusive/inclusive selection
		item.addEventListener('click', e => {
			if (e.target !== checkbox) {
				e.stopPropagation();

				// Check if this type is already selected and if it's the only one selected
				const isAlreadySelected = componentTypeFilters.get(type) !== false;
				const isOnlyOneSelected = [...componentTypeFilters.values()].filter(v => v !== false).length === 1
					&& componentTypeFilters.get(type) !== false;

				if (isAlreadySelected && isOnlyOneSelected) {
					// If this is the only selected type, select all types
					componentTypes.forEach(t => {
						componentTypeFilters.set(t, true);
					});
				} else {
					// Otherwise, select only this type
					componentTypes.forEach(t => {
						componentTypeFilters.set(t, t === type);
					});
				}

				// Update checkboxes to reflect the new state
				document.querySelectorAll('.filter-checkbox').forEach(cb => {
					cb.checked = componentTypeFilters.get(cb.dataset.type) !== false;
				});

				applyFilters();
			}
		});

		item.appendChild(checkbox);
		item.appendChild(label);
		content.appendChild(item);
	});

	// Add the dropdown to the search container
	document.querySelector('.search-wrapper').appendChild(filterDropdown);

	return filterDropdown;
};

// Function to toggle the filter dropdown visibility
const toggleFilterDropdown = () => {
	if (!filterDropdown)
		createFilterDropdown();

	const isVisible = filterDropdown.classList.contains('visible');
	filterDropdown.classList.toggle('visible', !isVisible);

	// Add a click event listener to close the dropdown when clicking outside
	if (!isVisible) {
		setTimeout(() => {
			const closeDropdownOnOutsideClick = e => {
				if (!filterDropdown.contains(e.target) && e.target.id !== 'filter-btn') {
					filterDropdown.classList.remove('visible');
					document.removeEventListener('click', closeDropdownOnOutsideClick);
				}
			};
			document.addEventListener('click', closeDropdownOnOutsideClick);
		}, 0);
	}
};

// Function to toggle the test dropdown visibility
const toggleTestDropdown = () => {
	if (!testIdDropdown)
		createTestIdDropdown();

	const isVisible = testIdDropdown.classList.contains('visible');
	testIdDropdown.classList.toggle('visible', !isVisible);

	// Add a click event listener to close the dropdown when clicking outside
	if (!isVisible) {
		setTimeout(() => {
			const closeDropdownOnOutsideClick = e => {
				if (!testIdDropdown.contains(e.target) && e.target.id !== 'test-btn') {
					testIdDropdown.classList.remove('visible');
					document.removeEventListener('click', closeDropdownOnOutsideClick);
				}
			};
			document.addEventListener('click', closeDropdownOnOutsideClick);
		}, 0);
	}
};

// Function to check if a node or any of its children match the filter
const nodeMatchesFilter = (node, childrenMap) => {
	// Check if this node's type passes the filter
	const typeMatches = componentTypeFilters.get(node.type) !== false;

	// If this node matches, return true immediately
	if (typeMatches) return true;

	// If this node doesn't match, check its children recursively
	const children = childrenMap.get(node.id) || [];

	return children.some(child => nodeMatchesFilter(child, childrenMap));
};

// Function to apply filters to the tree
const applyFilters = () => {
	if (!Array.isArray(domData)) return;

	// Rebuild the tree with filters applied
	displayData(domData);
};

// Function to display the component tree
const displayData = data => {
	domData = data;

	const container = document.getElementById('data-container');
	container.innerHTML = '';

	if (!Array.isArray(domData)) {
		container.textContent = 'No data received yet.';

		return;
	}

	// Initialize filters if this is the first time
	if (componentTypeFilters.size === 0) {
		getComponentTypes().forEach(type => {
			componentTypeFilters.set(type, true); // All checked by default
		});
	}

	const { childrenMap, nodeMap } = buildTreeMap(domData);

	// Create a custom tree builder that respects filters
	const treeDom = createHtmlFromTree(undefined, childrenMap, 0, 0, [], componentTypeFilters);
	container.appendChild(treeDom);
};

const toggleSelectButton = toggle => {
	const selectComponentBtn = document.getElementById('select-component-btn');
	selectComponentBtn.classList.toggle('active');

	if (toggle) {
		chrome.runtime.sendMessage({
			action: 'OPUS_ASK_SHOW_COMPONENT_SELECTOR',
			tabId
		});
	} else {
		chrome.runtime.sendMessage({
			action: 'OPUS_ASK_HIDE_COMPONENT_SELECTOR',
			tabId
		});
	}
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(message => {
	if (message.action === 'OPUS_GET_JSON_DATA')
		displayData(message.data);
	else if (message.action === 'OPUS_GET_STATE_DATA') {
		const { data: { id, state } } = message;

		selectedComponentId = id;

		const domNode = domData.find(f => f.id === id);

		displayStateInSidebar(state, id, domNode);
		document.getElementById('test-btn').classList.toggle('hidden', false);
	} else if (message.action === 'OPUS_GET_SELECT_COMPONENT') {
		selectTreeNode({ id: message.data.id });

		toggleSelectButton(false);
	} else if (message.action === 'OPUS_GET_COMPONENT_TREE')
		displayData(message.data);
	else if (message.action === 'OPUS_GET_OPUS_CONFIG')
		setGlobalConfig(message.data.opusConfig);
});

document.addEventListener('DOMContentLoaded', () => {
	const selectComponentBtn = document.getElementById('select-component-btn');
	const filterBtn = document.getElementById('filter-btn');
	const testBtn = document.getElementById('test-btn');

	// Toggle select component button
	selectComponentBtn.addEventListener('click', () => {
		toggleSelectButton(!selectComponentBtn.classList.contains('active'));
	});

	// Toggle filter dropdown
	filterBtn.addEventListener('click', e => {
		e.stopPropagation();
		toggleFilterDropdown();
	});

	// Toggle test dropdown
	testBtn.addEventListener('click', e => {
		e.stopPropagation();
		toggleTestDropdown();
	});

	// Sidebar resize functionality
	const resizeHandle = document.getElementById('resize-handle');
	const sidebar = document.getElementById('state-sidebar');
	let isResizing = false;
	let lastX = 0;

	// Function to handle mouse down on resize handle
	const handleMouseDown = e => {
		isResizing = true;
		lastX = e.clientX;
		document.body.style.cursor = 'col-resize';
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		e.preventDefault();
	};

	// Function to handle mouse move during resize
	const handleMouseMove = e => {
		if (!isResizing) return;

		const deltaX = e.clientX - lastX;
		const newWidth = Math.max(150, Math.min(600, sidebar.offsetWidth - deltaX));

		sidebar.style.width = `${newWidth}px`;
		lastX = e.clientX;
	};

	// Function to handle mouse up after resize
	const handleMouseUp = () => {
		isResizing = false;
		document.body.style.cursor = '';
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	};

	// Add event listener to resize handle
	resizeHandle.addEventListener('mousedown', handleMouseDown);
});

chrome.runtime.sendMessage({
	action: 'OPUS_ASK_OPUS_CONFIG',
	tabId
});

chrome.runtime.sendMessage({
	action: 'OPUS_ASK_COMPONENT_TREE',
	tabId
});

export { domData };
