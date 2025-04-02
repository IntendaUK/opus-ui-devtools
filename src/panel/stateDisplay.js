// Display component state in the sidebar
const displayStateInSidebar = (data, componentId) => {
	const stateContent = document.getElementById('state-content');
	stateContent.innerHTML = '';

	if (!data) {
		stateContent.textContent = 'No state available for this component';
		return;
	}

	// Update sidebar header to show component ID
	const sidebarHeader = document.querySelector('.sidebar-header');
	sidebarHeader.textContent = `Component Details`;

	// Get the state object from the data
	// It could be directly in data.state as an object, or it could be the data itself
	const state = data.state && typeof data.state === 'object' ? data.state : 
		(typeof data === 'object' ? data : {});
	
	// Create a section for component metadata
	const metadataSection = document.createElement('div');
	metadataSection.className = 'sidebar-section';
	
	// Add section header
	const metadataHeader = document.createElement('div');
	metadataHeader.className = 'section-header';
	metadataHeader.textContent = 'Component Info';
	metadataSection.appendChild(metadataHeader);
	
	// Add component ID
	const idElement = document.createElement('div');
	idElement.className = 'state-property';
	idElement.innerHTML = `<span class="property-key">id:</span> ${componentId}`;
	metadataSection.appendChild(idElement);
	
	// Add scope if available
	if (data.scopes || (state.scopes && !Array.isArray(state.scopes))) {
		const scopeElement = document.createElement('div');
		scopeElement.className = 'state-property';
		const scopeValue = data.scopes || state.scope;
		scopeElement.innerHTML = `<span class="property-key">scope:</span> ${scopeValue}`;
		metadataSection.appendChild(scopeElement);
	}
	
	// Add relId if available
	if (data.relId || state.relId) {
		const relIdElement = document.createElement('div');
		relIdElement.className = 'state-property';
		const relIdValue = data.relId || state.relId;
		relIdElement.innerHTML = `<span class="property-key">relId:</span> ${relIdValue}`;
		metadataSection.appendChild(relIdElement);
	}
	
	// Add path if available
	if (state.path) {
		const pathElement = document.createElement('div');
		pathElement.className = 'state-property';
		pathElement.innerHTML = `<span class="property-key">path:</span> ${state.path}`;
		metadataSection.appendChild(pathElement);
	}
	
	stateContent.appendChild(metadataSection);
	
	// Create a section for component state
	const stateSection = document.createElement('div');
	stateSection.className = 'sidebar-section';
	
	// Add section header
	const stateHeader = document.createElement('div');
	stateHeader.className = 'section-header';
	stateHeader.textContent = 'State';
	stateSection.appendChild(stateHeader);
	
	// If state is an object, display each property (excluding flows, scps, and path)
	if (typeof state === 'object' && state !== null) {
		let hasStateProperties = false;
		
		Object.entries(state).forEach(([key, value]) => {
			// Skip id, timestamp, flows, scps, and path
			if (key === 'id' || key === 'timestamp' || key === 'flows' || key === 'scps' || key === 'path') return;
			
			hasStateProperties = true;
			const propertyElement = document.createElement('div');
			propertyElement.className = 'state-property';
			
			// Format the value based on its type
			let displayValue = value;
			if (typeof value === 'boolean') {
				displayValue = `<span class="state-boolean">${value}</span>`;
			} else if (typeof value === 'number') {
				displayValue = `<span class="state-number">${value}</span>`;
			} else if (value === null) {
				displayValue = `<span class="state-null">null</span>`;
			} else if (value === undefined) {
				displayValue = `<span class="state-undefined">undefined</span>`;
			} else if (typeof value === 'object') {
				displayValue = `<span class="state-object">${JSON.stringify(value)}</span>`;
			}
			
			propertyElement.innerHTML = `<span class="property-key">${key}:</span> ${displayValue}`;
			stateSection.appendChild(propertyElement);
		});
		
		if (!hasStateProperties) {
			const noStateElement = document.createElement('div');
			noStateElement.className = 'state-property';
			noStateElement.textContent = 'No state properties found';
			stateSection.appendChild(noStateElement);
		}
		
		stateContent.appendChild(stateSection);
		
		// Create a section for flows if available
		if (state.flows) {
			const flowsSection = document.createElement('div');
			flowsSection.className = 'sidebar-section';
			
			// Add section header
			const flowsHeader = document.createElement('div');
			flowsHeader.className = 'section-header';
			flowsHeader.textContent = 'Flows';
			flowsSection.appendChild(flowsHeader);
			
			// Add flows content
			const flowsElement = document.createElement('div');
			flowsElement.className = 'state-property';
			flowsElement.innerHTML = `<span class="state-array">${JSON.stringify(state.flows)}</span>`;
			flowsSection.appendChild(flowsElement);
			
			stateContent.appendChild(flowsSection);
		}
		
		// Create a section for scps if available
		if (state.scps) {
			const scpsSection = document.createElement('div');
			scpsSection.className = 'sidebar-section';
			
			// Add section header
			const scpsHeader = document.createElement('div');
			scpsHeader.className = 'section-header';
			scpsHeader.textContent = 'SCPs';
			scpsSection.appendChild(scpsHeader);
			
			// Add scps content
			const scpsElement = document.createElement('div');
			scpsElement.className = 'state-property';
			scpsElement.innerHTML = `<span class="state-array">${JSON.stringify(state.scps)}</span>`;
			scpsSection.appendChild(scpsElement);
			
			stateContent.appendChild(scpsSection);
		}

		// Show timestamp if available
		if (data.timestamp) {
			const timestampElement = document.createElement('div');
			timestampElement.className = 'state-timestamp';
			timestampElement.innerHTML = `<small>Updated: ${new Date(data.timestamp).toLocaleTimeString()}</small>`;
			stateContent.appendChild(timestampElement);
		}
	} else {
		const noStateElement = document.createElement('div');
		noStateElement.className = 'state-property';
		noStateElement.textContent = 'No state properties found';
		stateSection.appendChild(noStateElement);
		stateContent.appendChild(stateSection);
	}
};

export {
	displayStateInSidebar
};
