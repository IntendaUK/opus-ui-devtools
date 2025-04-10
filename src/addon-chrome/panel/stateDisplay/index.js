import buildSectionInfo from './sectionBuilders/info.js';
import buildSectionFlows from './sectionBuilders/flows.js';
import buildSectionScripts from './sectionBuilders/scripts.js';
import buildSectionState from './sectionBuilders/state/index.js';

// Display component state in the sidebar
const displayStateInSidebar = (data, componentId, domNode) => {
	const stateContent = document.getElementById('state-content');
	stateContent.innerHTML = '';

	if (!data) {
		stateContent.textContent = 'No state available for this component';

		return;
	}

	const state = data.state;

	buildSectionInfo(stateContent, componentId, domNode, state);

	buildSectionState(stateContent, componentId, domNode, state);

	if (state.flows?.length > 0)
		buildSectionFlows(stateContent, componentId, domNode, state);

	if (state.scps?.length > 0)
		buildSectionScripts(stateContent, componentId, domNode, state);
};

export { displayStateInSidebar };
