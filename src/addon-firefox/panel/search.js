import { domData } from './panel.js';
import { selectTreeNode } from './treeBuilder.js';

let searchMatches = [];
let currentMatchIndex = -1;

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
			node.type.toLowerCase().includes(searchTerm) ||
			node.scopes.some(f => f.toLowerCase().includes(searchTerm)) ||
			node.relId?.includes(searchTerm)
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

	// Highlight the component and scroll to it
	selectTreeNode({ id: matchId });

	// Update the search results count
	updateSearchResultsCount();
};

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.getElementById('search-input');

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
});
