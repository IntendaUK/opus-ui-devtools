import { buildTreeMap, createHtmlFromTree, selectTreeNode } from './treeBuilder.js';
import { displayStateInSidebar } from './stateDisplay/index.js';
import { set as setGlobalConfig } from './globalConfig.js';
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
	else if (message.action === 'OPUS_GET_OPUS_CONFIG')
		setGlobalConfig(message.data.opusConfig);
});

document.addEventListener('DOMContentLoaded', () => {
	const selectComponentBtn = document.getElementById('select-component-btn');

	// Toggle select component button
	selectComponentBtn.addEventListener('click', () => {
		toggleSelectButton(!selectComponentBtn.classList.contains('active'));
	});

	// Sidebar resize functionality
	const resizeHandle = document.getElementById('resize-handle');
	const sidebar = document.getElementById('state-sidebar');
	let isResizing = false;
	let lastX = 0;

	// Function to handle mouse down on resize handle
	const handleMouseDown = (e) => {
		isResizing = true;
		lastX = e.clientX;
		document.body.style.cursor = 'col-resize';
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		e.preventDefault();
	};

	// Function to handle mouse move during resize
	const handleMouseMove = (e) => {
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


chrome.runtime.sendMessage({ action: 'OPUS_ASK_OPUS_CONFIG' });
chrome.runtime.sendMessage({ action: 'OPUS_ASK_COMPONENT_TREE' });

export {
	domData
};
