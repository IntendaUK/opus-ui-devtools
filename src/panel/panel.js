import { buildTreeMap, createHtmlFromTree, highlightSelectedComponent } from './treeBuilder.js';
import { displayStateInSidebar } from './stateDisplay.js';

// Function to display the component tree
const displayData = data => {
	const container = document.getElementById('data-container');
	container.innerHTML = '';

	if (!Array.isArray(data)) {
		container.textContent = 'No data received yet.';
		return;
	}

	const { childrenMap } = buildTreeMap(data);
	const treeDom = createHtmlFromTree(undefined, childrenMap);
	container.appendChild(treeDom);
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(message => {
	if (message.action === 'showState') {
		const componentId = message.id || 'Unknown';
		displayStateInSidebar(message.data, componentId);
	}
});

// Expose displayData function to the window object for external access
window.displayData = displayData;
