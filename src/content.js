const script = document.createElement('script');
script.textContent = `
	if (!window._OPUS_DEVTOOLS_GLOBAL_HOOK) {
		window._OPUS_DEVTOOLS_GLOBAL_HOOK = {
			onDomChanged: dom => {
				window.postMessage({
					type: 'OPUS_JSON_DATA',
					payload: dom
				}, '*');
			}
		};

		window.addEventListener('message', function (event) {
			if (event.source !== window || !event.data || event.data.type !== 'OPUS_GET_STATE_REQUEST') return;

			const id = event.data.id;
			const result = window._OPUS_DEVTOOLS_GLOBAL_HOOK.getState(id);

			window.postMessage({
				type: 'OPUS_GET_STATE_RESPONSE',
				id,
				result
			}, '*');
		});
	}
`;
(document.head || document.documentElement).appendChild(script);
script.remove();

window.addEventListener('message', event => {
	if (event.source !== window || !event.data || event.data.type !== 'OPUS_JSON_DATA')
		return;

	chrome.runtime.sendMessage({
		action: 'sendDataToDevtools',
		data: event.data.payload
	});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'getState' && message.id) {
		// Send message into the page context
		window.postMessage({
			type: 'OPUS_GET_STATE_REQUEST',
			id: message.id
		}, '*');
	}
});

// Listen for response from the page context
window.addEventListener('message', event => {
	if (
		event.source !== window ||
		!event.data ||
		event.data.type !== 'OPUS_GET_STATE_RESPONSE'
	)
		return;

	chrome.runtime.sendMessage({
		action: 'showState',
		data: event.data.result
	});
});
