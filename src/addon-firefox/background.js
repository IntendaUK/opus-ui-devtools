chrome.runtime.onMessage.addListener(message => {
	if (message.action.indexOf('OPUS_ASK') === 0) {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: message.action,
				data: message.data
			});
		});
	} else if (message.action.indexOf('OPUS_GET') === 0) {
		chrome.runtime.sendMessage({
			action: message.action,
			data: message.data
		});
	}
});
