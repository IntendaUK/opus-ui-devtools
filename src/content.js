const script = document.createElement('script');
script.textContent = `
	if (!window._OPUS_DEVTOOLS_GLOBAL_HOOK) {
		window._OPUS_DEVTOOLS_GLOBAL_HOOK = {
			onDomChanged: dom => {
				window.postMessage({
					type: 'OPUS_GET_JSON_DATA',
					data: dom
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
			} else if (event.data.type === 'OPUS_ASK_SHOW_OVERLAY')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.showOverlay(event.data.data.id);
			else if (event.data.type === 'OPUS_ASK_HIDE_OVERLAY')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.hideOverlay();
			else if (event.data.type === 'OPUS_ASK_SHOW_FLOW')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.showFlowArrow(event.data.data);
			else if (event.data.type === 'OPUS_ASK_HIDE_FLOW')
				window._OPUS_DEVTOOLS_GLOBAL_HOOK.hideFlowArrow();
		});
	}
`;
(document.head || document.documentElement).appendChild(script);
script.remove();

// Browser Tab -> Devtools (BG)
window.addEventListener('message', event => {
	if (event.source !== window || !event.data)
		return;

	if (typeof(event.data.type) === 'string' && event.data.type.indexOf('OPUS_GET') === 0) {
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
