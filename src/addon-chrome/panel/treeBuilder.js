/* eslint-disable max-lines-per-function, max-len, max-lines */

import { getScopeColorByDepth } from './colors.js';
import { createElement } from './domHelper.js';

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

export const selectTreeNode = id => {
	// Highlight this component
	highlightSelectedComponent(id);

	// Request state for this component
	chrome.runtime.sendMessage({
		action: 'OPUS_ASK_STATE_DATA',
		data: { id }
	});
};

// Create HTML representation of the tree
const createHtmlFromTree = (parentId, childrenMap, depth = 0, scopeDepth = 0) => {
	const nodes = childrenMap.get(parentId) || [];
	const container = createElement({
		type: 'div',
		className: 'tree-container'
	});

	nodes.forEach(node => {
		// Create a node container to hold the line and its scope indicators
		const nodeContainer = createElement({
			type: 'div',
			className: 'node-container',
			style: { position: 'relative' },
			parent: container
		});

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
		const line = createElement({
			type: 'div',
			className: 'devtools-line',
			style: { marginLeft: `${depth * 16}px` },
			innerHTML: displayText,
			dataset: { componentId: node.id },
			events: {
				click: () => {
					selectTreeNode(node.id);
				},
				mouseenter: () => {
					chrome.runtime.sendMessage({
						action: 'OPUS_ASK_SHOW_OVERLAY',
						data: { id: node.id }
					});
				},
				mouseleave: () => {
					chrome.runtime.sendMessage({ action: 'OPUS_ASK_HIDE_OVERLAY' });
				}
			},
			parent: nodeContainer
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
		const childContainer = createHtmlFromTree(node.id, childrenMap, depth + 1, scopeDepth + (nodeScopes.length ?? 0), nodeScopes);
		childContainer.style.position = 'relative'; // For proper positioning of child scope lines

		// Add vertical scope lines that extend from parent to children
		if (nodeScopes.length > 0) {
			// Create a wrapper for the child container to position the scope lines
			const childWrapper = createElement({
				type: 'div',
				className: 'child-wrapper',
				style: { position: 'relative' },
				parent: container
			});

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

			childWrapper.appendChild(childContainer);
		} else
			container.appendChild(childContainer);
	});

	return container;
};

export {
	buildTreeMap,
	createHtmlFromTree,
	highlightSelectedComponent
};
