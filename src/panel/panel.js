import { buildTreeMap, createHtmlFromTree, highlightSelectedComponent } from './treeBuilder.js';
import { displayStateInSidebar } from './stateDisplay.js';
import { createElement } from './domHelper.js';

let domData;

// Function to display the component tree
const displayData = data => {
	domData = data;

	const container = document.getElementById('data-container');
	container.innerHTML = '';

	if (!Array.isArray(domData)) {
		container.textContent = 'No data received yet.';
		return;
	}

	const { childrenMap } = buildTreeMap(domData);
	const treeDom = createHtmlFromTree(undefined, childrenMap);
	container.appendChild(treeDom);
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(message => {
	if (message.action === 'showState') {
		const componentId = message.id || 'Unknown';

		const domNode = domData.find(f => f.id === componentId);

		displayStateInSidebar(message.data, componentId, domNode);
	}
});

// Expose displayData function to the window object for external access
window.displayData = displayData;
