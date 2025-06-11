let panelCreated = false;

const tabId = chrome.devtools.inspectedWindow.tabId;

chrome.runtime.onMessage.addListener(message => {
	if (message.action === 'OPUS_GET_ADDON_IS_READY') {
		chrome.runtime.sendMessage({
			action: 'OPUS_ASK_IS_OPUS_APP',
			tabId
		});

		return true;
	} else if (
		message.action === 'OPUS_GET_IS_OPUS_APP' &&
		message.data.result === true &&
		!panelCreated
	) {
		// Only create the panel if window.opus exists and panel hasn't been created yet
		chrome.devtools.panels.create(
			'Opus UI Dev',
			'../favicon.png',
			'../panel/panel.html'
		);

		panelCreated = true;
	}
});

chrome.runtime.sendMessage({
	action: 'OPUS_ASK_IS_OPUS_APP',
	tabId
});
