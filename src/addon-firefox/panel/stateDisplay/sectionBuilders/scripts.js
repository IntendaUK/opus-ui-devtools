import { createElement } from '../../domHelper.js';

const buildSectionScripts = (stateContent, componentId, domNode, state) => {
	const scpsSection = createElement({
		type: 'div',
		className: 'sidebar-section',
		parent: stateContent
	});

	createElement({
		type: 'div',
		className: 'section-header',
		textContent: 'SCPs',
		parent: scpsSection
	});

	// Container for all scripts
	const scpsContainer = createElement({
		type: 'div',
		className: 'scripts-container',
		parent: scpsSection
	});

	// If there are no scripts, show a message
	if (!state.scps || state.scps.length === 0) {
		createElement({
			type: 'div',
			className: 'no-scripts',
			textContent: 'No scripts available',
			parent: scpsContainer
		});
		return;
	}

	// Render each script in a rounded rectangle
	state.scps.forEach((script, index) => {
		const scriptBox = createElement({
			type: 'div',
			className: 'script-box',
			parent: scpsContainer
		});

		// Create a container for triggers
		const triggersContainer = createElement({
			type: 'div',
			className: 'triggers-container',
			parent: scriptBox
		});

		// Add each trigger as a line of text
		if (script.triggers && script.triggers.length > 0) {
			script.triggers.forEach(trigger => {
				createElement({
					type: 'div',
					className: 'trigger-line',
					textContent: `${trigger.event}: ${trigger.source ?? 'self'}.${trigger.key ?? 'value'}`,
					parent: triggersContainer
				});
			});
		} else {
			createElement({
				type: 'div',
				className: 'trigger-line',
				textContent: 'No triggers',
				parent: triggersContainer
			});
		}

		// Add arrow pointing down
		createElement({
			type: 'div',
			className: 'arrow-down',
			textContent: '↓',
			parent: scriptBox
		});

		// Add actions count
		const actionsCount = script.actions ? script.actions.length : 0;
		createElement({
			type: 'div',
			className: 'actions-count',
			textContent: `${actionsCount} action${actionsCount !== 1 ? 's' : ''}`,
			parent: scriptBox
		});
	});
};

export default buildSectionScripts;
