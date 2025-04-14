/* eslint-disable max-lines-per-function, max-len, max-lines */

import { getScopeColorByDepth } from './colors.js';
import { createElement } from './domHelper.js';

const tabId = chrome.devtools.inspectedWindow.tabId;

// Build a tree map from flat nodes
const buildTreeMap = flatNodes => {
	const childrenMap = new Map();
	const nodeMap = new Map();

	flatNodes.forEach(node => {
		nodeMap.set(node.id, node);

		const parentId = node.parentId;
		if (!childrenMap.has(parentId))
			childrenMap.set(parentId, []);

		childrenMap.get(parentId).push(node);
	});

	return {
		childrenMap,
		nodeMap
	};
};

// Highlight the selected component
const highlightSelectedComponent = selectedId => {
	// Remove highlight from all components
	document.querySelectorAll('.devtools-line').forEach(element => {
		element.classList.remove('selected');
	});

	// Find and highlight the selected component
	document.querySelectorAll('.devtools-line').forEach(element => {
		if (element.dataset.componentId === selectedId)
			element.classList.add('selected');
	});
};

export const selectTreeNode = ({ id, doScroll = true }) => {
	// Highlight this component
	highlightSelectedComponent(id);

	// Request state for this component
	chrome.runtime.sendMessage({
		action: 'OPUS_ASK_STATE_DATA',
		tabId,
		data: { id }
	});

	// Scroll the node into view if doScroll is true
	if (doScroll) {
		const element = document.querySelector(`.devtools-line[data-component-id="${id}"]`);
		if (element) {
			element.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		}
	}
};

// Toggle the visibility of a node's children
const toggleNodeChildren = nodeId => {
	const childContainer = document.querySelector(`.child-container[data-parent-id="${nodeId}"]`);
	if (!childContainer) return;

	const isExpanded = childContainer.style.display !== 'none';
	childContainer.style.display = isExpanded ? 'none' : 'block';

	// Update the toggle icon
	const toggleIcon = document.querySelector(`.toggle-icon[data-node-id="${nodeId}"]`);
	if (toggleIcon) {
		toggleIcon.classList.toggle('collapsed', isExpanded);
		toggleIcon.title = isExpanded ? 'Expand' : 'Collapse';
	}
};

// Function to check if a node or any of its children match the filter
const nodeMatchesFilter = (node, childrenMap, filters) => {
	// If no filters are provided or filters is empty, everything matches
	if (!filters || filters.size === 0) return true;

	// Check if this node's type passes the filter
	const typeMatches = filters.get(node.type) !== false;

	// If this node matches, return true immediately
	if (typeMatches) return true;

	// If this node doesn't match, check its children recursively
	const children = childrenMap.get(node.id) || [];

	return children.some(child => nodeMatchesFilter(child, childrenMap, filters));
};

// Create HTML representation of the tree
const createHtmlFromTree = (parentId, childrenMap, depth = 0, scopeDepth = 0, parentScopes = [], filters = null) => {
	const nodes = childrenMap.get(parentId) || [];
	const container = createElement({
		type: 'div',
		className: 'tree-container'
	});

	nodes.forEach(node => {
		// Check if this node or any of its children match the filter
		const nodeMatches = !filters || nodeMatchesFilter(node, childrenMap, filters);
		const typeMatches = !filters || filters.get(node.type) !== false;

		// Skip this node entirely if it doesn't match and none of its children match
		if (!nodeMatches) return;

		// Create a node container to hold the line and its scope indicators
		const nodeContainer = createElement({
			type: 'div',
			className: `node-container${(!typeMatches && nodeMatches) ? ' filtered-out' : ''}`,
			style: { position: 'relative' },
			parent: container
		});

		// Check if this node has children
		const hasChildren = childrenMap.has(node.id) && childrenMap.get(node.id).length > 0;

		//Convert "componentType" to "Component Type"
		const componentType = node.type[0].toUpperCase() + node.type.substr(1);

		// Format ID - truncate if longer than 9 characters
		const displayId = node.id.length > 9 ? `${node.id.substring(0, 8)}&hellip;` : node.id;

		// Build the display string
		let displayText = `${componentType} <span>id=<span style="color:var(--accent-color)">${displayId}</span></span>`;

		// Get node scopes or empty array if none
		const nodeScopes = node.scopes || [];

		// Add scopes if present
		if (nodeScopes.length === 1)
			displayText += ` <span>scope=<span style="color:var(--accent-color)">${nodeScopes.join(', ')}</span></span>`;
		else if (nodeScopes.length > 1)
			displayText += ` <span>scope=[<span style="color:var(--accent-color)">${nodeScopes.join(', ')}</span>]</span>`;

		// Add relId if present
		if (node.relId)
			displayText += ` <span>relId=<span style="color:var(--accent-color)">${node.relId}</span></span>`;

		// Create the line element for the node content
		const lineContainer = createElement({
			type: 'div',
			className: 'line-container',
			style: {
				display: 'flex',
				alignItems: 'center'
			},
			parent: nodeContainer
		});

		// Add toggle icon for nodes with children
		if (hasChildren) {
			const toggleIcon = createElement({
				type: 'div',
				className: 'toggle-icon',
				textContent: '▼', // Default to expanded
				style: {
					marginLeft: `${(12 + (depth * 16))}px`,
					marginRight: '4px',
					cursor: 'pointer',
					userSelect: 'none',
					width: '12px',
					textAlign: 'center',
					color: 'var(--fg-color)'
				},
				dataset: { nodeId: node.id },
				attributes: { title: 'Collapse' },
				events: {
					click: e => {
						e.stopPropagation(); // Prevent triggering the line click event
						toggleNodeChildren(node.id);
					}
				},
				parent: lineContainer
			});
		} else {
			// Add a spacer for nodes without children to maintain alignment
			createElement({
				type: 'div',
				style: {
					marginLeft: `${(12 + (depth * 16))}px`,
					width: '16px'
				},
				parent: lineContainer
			});
		}

		// Create the line element for the node content
		const line = createElement({
			type: 'div',
			className: 'devtools-line',
			style: { flex: 1 },
			innerHTML: displayText,
			dataset: { componentId: node.id },
			events: {
				click: () => {
					selectTreeNode({
						id: node.id,
						doScroll: false
					});
				},
				mouseenter: () => {
					chrome.runtime.sendMessage({
						action: 'OPUS_ASK_SHOW_OVERLAY',
						tabId,
						data: { id: node.id }
					});
				},
				mouseleave: () => {
					chrome.runtime.sendMessage({
						action: 'OPUS_ASK_HIDE_OVERLAY',
						tabId
					});
				}
			},
			parent: lineContainer
		});

		// Add indicators for hasScripts and hasFlows
		if (node.hasScripts) {
			createElement({
				type: 'div',
				className: 'indicator-badge',
				textContent: 'S',
				style: {
					backgroundColor: 'var(--scope-color-1)',
					color: 'var(--bg-color)',
					borderRadius: '4px',
					padding: '1px 4px',
					fontSize: '10px',
					fontWeight: 'bold',
					marginLeft: '6px',
					display: 'inline-block'
				},
				attributes: { title: 'Has Scripts' },
				parent: line
			});
		}

		if (node.hasFlows) {
			createElement({
				type: 'div',
				className: 'indicator-badge',
				textContent: 'F',
				style: {
					backgroundColor: 'var(--scope-color-3)',
					color: 'var(--bg-color)',
					borderRadius: '4px',
					padding: '1px 4px',
					fontSize: '10px',
					fontWeight: 'bold',
					marginLeft: '6px',
					display: 'inline-block'
				},
				attributes: { title: 'Has Flows' },
				parent: line
			});
		}

		// Add vertical scope lines for this node
		if (nodeScopes.length > 0) {
			// Add scope indicators for each scope
			nodeScopes.forEach((scope, index) => {
				const scopeColor = getScopeColorByDepth(scopeDepth, index);

				// Create vertical line element
				createElement({
					type: 'div',
					className: 'scope-vertical-line',
					style: {
						left: `${(depth * 16) + (index * 4)}px`, // Position based on depth and scope index
						backgroundColor: scopeColor
					},
					attributes: { title: `Scope: ${scope}` },
					parent: nodeContainer
				});
			});
		}

		// Recursively create child container with current node's scopes
		const childContainer = createHtmlFromTree(node.id, childrenMap, depth + 1, scopeDepth + (nodeScopes.length ?? 0), nodeScopes, filters);
		childContainer.style.position = 'relative'; // For proper positioning of child scope lines

		// Create a wrapper for the child container with data attribute for parent ID
		const childWrapper = createElement({
			type: 'div',
			className: 'child-container',
			style: {
				position: 'relative',
				display: 'block'
			}, // Default to expanded
			dataset: { parentId: node.id },
			parent: container
		});

		// Add vertical scope lines that extend from parent to children
		if (nodeScopes.length > 0) {
			// Add scope indicators for each scope that extend to children
			nodeScopes.forEach((scope, index) => {
				const scopeColor = getScopeColorByDepth(scopeDepth, index);

				// Create vertical line element that spans to children
				createElement({
					type: 'div',
					className: 'scope-vertical-line-to-children',
					style: {
						left: `${(depth * 16) + (index * 4)}px`, // Position based on depth and scope index
						backgroundColor: scopeColor
					},
					parent: childWrapper
				});
			});
		}

		// Add the child container to the wrapper
		childWrapper.appendChild(childContainer);
	});

	return container;
};

export {
	buildTreeMap,
	createHtmlFromTree,
	highlightSelectedComponent
};
