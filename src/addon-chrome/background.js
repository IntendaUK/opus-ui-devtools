chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action.indexOf('OPUS_ASK') === 0) {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: message.action,
				data: message.data
			});

			return true;
		});
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

