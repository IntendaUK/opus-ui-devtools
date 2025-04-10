import { createElement } from '../../domHelper.js';
import { selectTreeNode } from '../../treeBuilder.js';

const buildSectionFlows = (stateContent, componentId, domNode, state) => {
	const flowsSection = createElement({
		type: 'div',
		className: 'sidebar-section',
		parent: stateContent
	});

	createElement({
		type: 'div',
		className: 'section-header',
		textContent: 'Flows',
		parent: flowsSection
	});

	state.flows.forEach(flow => {
		const flowItem = createElement({
			type: 'div',
			className: 'flow-item',
			parent: flowsSection,
			events: {
				mouseenter: () => {
					chrome.runtime.sendMessage({
						action: 'OPUS_ASK_SHOW_FLOW',
						data: flow
					});
				},
				mouseleave: () => {
					chrome.runtime.sendMessage({ action: 'OPUS_ASK_HIDE_FLOW' });
				}
			}
		});

		const idFrom = flow.from.length > 9 ? `${flow.from.substring(0, 8)}&hellip;` : flow.from;
		createElement({
			type: 'div',
			className: 'flow-block',
			innerHTML: `${idFrom}.${flow.fromKey}`,
			parent: flowItem,
			events: {
				click: () => {
					selectTreeNode(flow.from);

					chrome.runtime.sendMessage({ action: 'OPUS_ASK_HIDE_FLOW' });
				}
			}
		});

		// Arrow
		createElement({
			type: 'div',
			className: 'flow-arrow',
			textContent: '→',
			parent: flowItem
		});

		const idTo = flow.to.length > 9 ? `${flow.to.substring(0, 8)}&hellip;` : flow.to;
		createElement({
			type: 'div',
			className: 'flow-block',
			innerHTML: `${idTo}.${flow.toKey}`,
			parent: flowItem,
			events: {
				click: () => {
					selectTreeNode(flow.to);

					chrome.runtime.sendMessage({ action: 'OPUS_ASK_HIDE_FLOW' });
				}
			}
		});
	});
};

export default buildSectionFlows;
