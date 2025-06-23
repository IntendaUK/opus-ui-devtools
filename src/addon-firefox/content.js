const script = document.createElement('script');
script.textContent = `
	if (!window._OPUS_DEVTOOLS_GLOBAL_HOOK) {
		window._OPUS_DEVTOOLS_GLOBAL_HOOK = {
			onDomChanged: dom => {
				window.postMessage({
					type: 'OPUS_GET_JSON_DATA',
					data: dom
				}, '*');
			},

			onSelectComponentClick: id => {
				window.postMessage({
					type: 'OPUS_GET_SELECT_COMPONENT',
					data: {
						id
					}
				}, '*');
			}
		};

		window.addEventListener('message', event => {
			if (event.data.type === 'OPUS_ASK_STATE_DATA') {
				const id = event.data.data.id;
				const originalState = window._OPUS_DEVTOOLS_GLOBAL_HOOK.getState(id);

				const state = JSON.parse(JSON.stringify(originalState));

				window.postMessage({
					type: 'OPUS_GET_STATE_DATA',
					data: {
						id,
						state
					}
				}, '*');
			} else if (event.data.type === 'OPUS_ASK_OPUS_CONFIG') {
				const opusConfig = window._OPUS_DEVTOOLS_GLOBAL_HOOK.getGlobalConfig();

				window.postMessage({
					type: 'OPUS_GET_OPUS_CONFIG',
					data: {
						opusConfig
					}
				}, '*');
			} else if (event.data.type === 'OPUS_ASK_BUILD_TEST_ID_LOCATOR') {
	console.log(123);
				const testIdLocator = window._OPUS_DEVTOOLS_GLOBAL_HOOK.buildTestIdLocator(event.data.data);

				window.postMessage({
					type: 'OPUS_GET_BUILD_TEST_ID_LOCATOR',
					data: { testIdLocator }
				}, '*');
			} else if (event.data.type === 'OPUS_ASK_SHOW_OVERLAY')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.showOverlay(event.data.data.id);
			else if (event.data.type === 'OPUS_ASK_HIDE_OVERLAY')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.hideOverlay();
			else if (event.data.type === 'OPUS_ASK_SHOW_COMPONENT_SELECTOR')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.showComponentSelector();
			else if (event.data.type === 'OPUS_ASK_HIDE_COMPONENT_SELECTOR')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.hideComponentSelector();
			else if (event.data.type === 'OPUS_ASK_SHOW_FLOW')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.showFlowArrow(event.data.data);
			else if (event.data.type === 'OPUS_ASK_HIDE_FLOW')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.hideFlowArrow();
			else if (event.data.type === 'OPUS_ASK_SET_COMPONENT_STATE')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.setComponentState(event.data.data);
			else if (event.data.type === 'OPUS_ASK_COMPONENT_TREE') {
				const componentTree = window._OPUS_DEVTOOLS_GLOBAL_HOOK.getComponentTree();

				window.postMessage({
					type: 'OPUS_GET_COMPONENT_TREE',
					data: componentTree
				}, '*');
			} else if (event.data.type === 'OPUS_ASK_IS_OPUS_APP') {
				const delayBetweenAttempts = 300;
				let attemptsLeft = 10;

				const checkIfOpusExists = () => {
					attemptsLeft--;

					if (!!window.opus || !!document.querySelector('#POPOVERS.cpnContainerSimple')) {
						window.postMessage({
							type: 'OPUS_GET_IS_OPUS_APP',
							data: {
								result: true
							}
						});
					} else if (attemptsLeft > 0)
						setTimeout(checkIfOpusExists, delayBetweenAttempts);
				};

				setTimeout(checkIfOpusExists, delayBetweenAttempts);
			}
		});

		window.postMessage({ type: 'OPUS_GET_ADDON_IS_READY' });
	}
`;
(document.head || document.documentElement).appendChild(script);
script.remove();

// Browser Tab -> Devtools (BG)
window.addEventListener('message', event => {
	if (event.source !== window || !event.data)
		return;

	if (event.data.type === 'OPUS_CHECK_EXISTS') {
		chrome.runtime.sendMessage({
			action: event.data.type,
			data: event.data.data
		});
	} else if (typeof(event.data.type) === 'string' && event.data.type.indexOf('OPUS_GET') === 0) {
		chrome.runtime.sendMessage({
			action: event.data.type,
			data: event.data.data
		});
	}
});

// Devtools (BG) -> Browser Tab (The script at the top of this file)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action.indexOf('OPUS_ASK') !== 0)
		return;

	window.postMessage({
		type: message.action,
		data: message.data
	});
});
