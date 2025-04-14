chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action.indexOf('OPUS_ASK') === 0) {
		chrome.tabs.sendMessage(message.tabId, {
			action: message.action,
			data: message.data
		});

		return true;
	}

	return false;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action.indexOf('OPUS_GET') === 0) {
		sendResponse({
			action: message.action,
			data: message.data
		});

		return true;
	}

	return false;
});

