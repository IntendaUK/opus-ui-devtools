// Get scope colors from CSS variables
const scopeColors = [
	getComputedStyle(document.documentElement).getPropertyValue('--scope-color-1').trim(),
	getComputedStyle(document.documentElement).getPropertyValue('--scope-color-2').trim(),
	getComputedStyle(document.documentElement).getPropertyValue('--scope-color-3').trim(),
	getComputedStyle(document.documentElement).getPropertyValue('--scope-color-4').trim()
];

// Generate a pastel color for a given string (scope name)
const generatePastelColor = (str) => {
	// This function is referenced but not defined in the original code
	// Adding a simple implementation based on string hashing
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	
	// Use the hash to select a color from the predefined scope colors
	const index = Math.abs(hash) % scopeColors.length;
	return scopeColors[index];
};

// Get color for a scope based on depth and index
const getScopeColorByDepth = (depth, index) => {
	const colorIndex = (depth + index) % scopeColors.length;
	return scopeColors[colorIndex];
};

// Map to store scope colors
const scopeColorMap = new Map();

// Get color for a scope, creating it if it doesn't exist
const getScopeColor = (scope) => {
    if (!scopeColorMap.has(scope)) {
        scopeColorMap.set(scope, generatePastelColor(scope));
    }
    return scopeColorMap.get(scope);
};

export {
	scopeColors,
	getScopeColorByDepth,
	getScopeColor,
	generatePastelColor
};
