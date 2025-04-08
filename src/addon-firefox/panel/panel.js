import { buildTreeMap, createHtmlFromTree, selectTreeNode } from './treeBuilder.js';
import { displayStateInSidebar } from './stateDisplay.js';
import './search.js';

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

const toggleSelectButton = toggle => {
	const selectComponentBtn = document.getElementById('select-component-btn');
	selectComponentBtn.classList.toggle('active');

	if (toggle)
		chrome.runtime.sendMessage({ action: 'OPUS_ASK_SHOW_COMPONENT_SELECTOR' });
	else
		chrome.runtime.sendMessage({ action: 'OPUS_ASK_HIDE_COMPONENT_SELECTOR' });
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(message => {
	if (message.action === 'OPUS_GET_JSON_DATA')
		displayData(message.data);
	else if (message.action === 'OPUS_GET_STATE_DATA') {
		const { data: { id, state } } = message;

		const domNode = domData.find(f => f.id === id);

		displayStateInSidebar(state, id, domNode);
	} else if (message.action === 'OPUS_GET_SELECT_COMPONENT') {
		selectTreeNode({ id: message.data.id });

		toggleSelectButton(false);
	} else if (message.action === 'OPUS_GET_COMPONENT_TREE')
		displayData(message.data);
});

document.addEventListener('DOMContentLoaded', () => {
	const selectComponentBtn = document.getElementById('select-component-btn');

	// Toggle select component button
	selectComponentBtn.addEventListener('click', () => {
		toggleSelectButton(!selectComponentBtn.classList.contains('active'));
	});
});


chrome.runtime.sendMessage({ action: 'OPUS_ASK_COMPONENT_TREE' });

export {
	domData
};
