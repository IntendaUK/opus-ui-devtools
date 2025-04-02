import { getScopeColorByDepth } from './colors.js';

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

// Create HTML representation of the tree
const createHtmlFromTree = (parentId, childrenMap, depth = 0, scopeDepth = 0, parentScopes = []) => {
	const nodes = childrenMap.get(parentId) || [];
	const container = document.createElement('div');
	container.className = 'tree-container';

	nodes.forEach(node => {
		// Create a node container to hold the line and its scope indicators
		const nodeContainer = document.createElement('div');
		nodeContainer.className = 'node-container';
		nodeContainer.style.position = 'relative';
		
		// Create the line element for the node content
		const line = document.createElement('div');
		line.className = 'devtools-line';
		line.style.marginLeft = `${depth * 16}px`;

		//Convert "componentType" to "Component Type"
		const componentType = node.type[0].toUpperCase() + node.type.substr(1);

		// Format ID - truncate if longer than 9 characters
		const displayId = node.id.length > 9 ? `${node.id.substring(0, 8)}&hellip;` : node.id;
		
		// Build the display string
		let displayText = `${componentType} id=<span style="color:var(--accent-color)">${displayId}</span>`;
		
		// Get node scopes or empty array if none
		const nodeScopes = node.scopes || [];
		
		// Add scopes if present
		if (nodeScopes.length === 1) {
			displayText += ` scope=<span style="color:var(--accent-color)">${nodeScopes.join(', ')}</span>`;
		} else if (nodeScopes.length > 1) {
			displayText += ` scope=[<span style="color:var(--accent-color)">${nodeScopes.join(', ')}</span>]`;
		}
		
		// Add relId if present
		if (node.relId) {
			displayText += ` relId=<span style="color:var(--accent-color)">${node.relId}</span>`;
		}
		
		line.innerHTML = displayText;
		line.dataset.componentId = node.id;

		line.onclick = () => {
			// Highlight this component
			highlightSelectedComponent(node.id);
			
			// Request state for this component
			chrome.runtime.sendMessage({
				action: 'getState',
				id: node.id
			});
		};

		nodeContainer.appendChild(line);
		
		// Add vertical scope lines for this node
		if (nodeScopes.length > 0) {
			// Add scope indicators for each scope
			nodeScopes.forEach((scope, index) => {
				const scopeColor = getScopeColorByDepth(scopeDepth, index);
				
				// Create vertical line element
				const verticalLine = document.createElement('div');
				verticalLine.className = 'scope-vertical-line';
				verticalLine.style.left = `${(depth * 16) + 4 + (index * 4)}px`; // Position based on depth and scope index
				verticalLine.style.backgroundColor = scopeColor;
				
				// Add a title attribute to show the scope name on hover
				verticalLine.title = `Scope: ${scope}`;
				
				nodeContainer.appendChild(verticalLine);
			});
		}
		
		container.appendChild(nodeContainer);

		// Recursively create child container with current node's scopes
		const childContainer = createHtmlFromTree(node.id, childrenMap, depth + 1, scopeDepth + (nodeScopes.length ?? 0), nodeScopes);
		childContainer.style.position = 'relative'; // For proper positioning of child scope lines
		
		// Add vertical scope lines that extend from parent to children
		if (nodeScopes.length > 0) {
			// Create a wrapper for the child container to position the scope lines
			const childWrapper = document.createElement('div');
			childWrapper.className = 'child-wrapper';
			childWrapper.style.position = 'relative';
			
			// Add scope indicators for each scope that extend to children
			nodeScopes.forEach((scope, index) => {
				const scopeColor = getScopeColorByDepth(scopeDepth, index);
				
				// Create vertical line element that spans to children
				const verticalLine = document.createElement('div');
				verticalLine.className = 'scope-vertical-line-to-children';
				verticalLine.style.position = 'absolute';
				verticalLine.style.left = `${(depth * 16) + 4 + (index * 4)}px`; // Position based on depth and scope index
				verticalLine.style.top = '0';
				verticalLine.style.bottom = '0';
				verticalLine.style.width = '2px';
				verticalLine.style.backgroundColor = scopeColor;
				verticalLine.style.zIndex = '0'; // Behind the text
				
				childWrapper.appendChild(verticalLine);
			});
			
			childWrapper.appendChild(childContainer);
			container.appendChild(childWrapper);
		} else {
			container.appendChild(childContainer);
		}
	});

	return container;
};

// Highlight the selected component
const highlightSelectedComponent = (selectedId) => {
	// Remove highlight from all components
	document.querySelectorAll('.devtools-line').forEach(element => {
		element.classList.remove('selected');
	});

	// Find and highlight the selected component
	document.querySelectorAll('.devtools-line').forEach(element => {
		if (element.dataset.componentId === selectedId) {
			element.classList.add('selected');
		}
	});
};

export {
	buildTreeMap,
	createHtmlFromTree,
	highlightSelectedComponent
};
