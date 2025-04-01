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
	}
`;
(document.head || document.documentElement).appendChild(script);
script.remove();

window.getState = function (id) {
	return {
		id,
		state: `State data for ${id}`,
		timestamp: new Date().toISOString()
	};
};

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
		const result = window.getState(message.id);

		chrome.runtime.sendMessage({
			action: 'showState',
			data: result
		});
	}
});
