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
				data: { id }
			}, '*');
		}
	};

	window.addEventListener('message', event => {
		if (event.data.type === 'OPUS_ASK_STATE_DATA') {
			const id = event.data.data.id;
			const originalState = window._OPUS_DEVTOOLS_GLOBAL_HOOK.getState(id);

			//If the state contains a ref (inputs), remove it
			const shallowCopiedState = { ...originalState };
			shallowCopiedState.state = { ...shallowCopiedState.state };
			delete shallowCopiedState.state.boxRef;

			const state = JSON.parse(JSON.stringify(shallowCopiedState));

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
				data: { opusConfig }
			}, '*');
		} else if (event.data.type === 'OPUS_ASK_BUILD_TEST_ID_LOCATOR') {
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
						data: { result: true }
					});
				} else if (attemptsLeft > 0)
					setTimeout(checkIfOpusExists, delayBetweenAttempts);
			};

			setTimeout(checkIfOpusExists, delayBetweenAttempts);
		}
	});

	window.postMessage({ type: 'OPUS_GET_ADDON_IS_READY' });
}
