import { buildTreeMap, createHtmlFromTree, selectTreeNode } from './treeBuilder.js';
import { displayStateInSidebar } from './stateDisplay.js';

let domData;
let searchMatches = [];
let currentMatchIndex = -1;

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
		selectTreeNode(message.data.id);

		toggleSelectButton(false);
	} else if (message.action === 'OPUS_GET_COMPONENT_TREE')
		displayData(message.data);
});

chrome.runtime.sendMessage({ action: 'OPUS_ASK_COMPONENT_TREE' });

// Search functionality
const updateSearchResultsCount = () => {
	const resultsCountElement = document.getElementById('search-results-count');

	if (searchMatches.length === 0) {
		resultsCountElement.textContent = '';

		return;
	}

	resultsCountElement.textContent = `${currentMatchIndex + 1} of ${searchMatches.length}`;
};

const findMatches = searchTerm => {
	if (!searchTerm || !domData || !Array.isArray(domData)) {
		searchMatches = [];
		currentMatchIndex = -1;
		updateSearchResultsCount();

		return;
	}

	searchTerm = searchTerm.toLowerCase();
	searchMatches = [];

	// Find all components that match the search term in id or type
	domData.forEach(node => {
		if (
			node.id.toLowerCase().includes(searchTerm) ||
			node.type.toLowerCase().includes(searchTerm)
		)
			searchMatches.push(node.id);
	});

	currentMatchIndex = searchMatches.length > 0 ? 0 : -1;
	updateSearchResultsCount();
};

const highlightNextMatch = () => {
	if (searchMatches.length === 0)
		return;

	// Move to the next match or wrap around to the first
	currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
	const matchId = searchMatches[currentMatchIndex];

	// Highlight the component
	selectTreeNode(matchId);

	// Find the element and scroll to it
	const matchElement = document.querySelector(`.devtools-line[data-component-id="${matchId}"]`);
	if (matchElement) {
		matchElement.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
	}

	// Update the search results count
	updateSearchResultsCount();
};

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.getElementById('search-input');
	const selectComponentBtn = document.getElementById('select-component-btn');

	// Search on input change
	searchInput.addEventListener('input', () => {
		findMatches(searchInput.value);

		// If there are matches, highlight the first one
		if (searchMatches.length > 0)
			highlightNextMatch();
	});

	// Cycle through matches on Enter key
	searchInput.addEventListener('keydown', event => {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (searchMatches.length > 0)
				highlightNextMatch();
		}
	});

	// Toggle select component button
	selectComponentBtn.addEventListener('click', () => {
		toggleSelectButton(!selectComponentBtn.classList.contains('active'));
	});
});

// Expose displayData function to the window object for external access
window.displayData = displayData;
