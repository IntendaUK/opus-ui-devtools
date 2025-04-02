let jsonData = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'sendDataToDevtools') {
		jsonData = message.data;

		chrome.runtime.sendMessage({
			action: 'updatePanel',
			data: jsonData
		});
	}

	if (message.action === 'getState' && message.id) {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: 'getState',
				id: message.id
			});
		});
	}

	if (message.action === 'showState') {
		chrome.runtime.sendMessage({
			action: 'showState',
			data: message.data,
			id: message.data.id
		});
	}
});

chrome.runtime.onConnect.addListener(port => {
	if (port.name === 'devtools') {
		port.onMessage.addListener(msg => {
			if (msg.action === 'requestData') {
				port.postMessage({
					action: 'loadData',
					data: jsonData
				});
			}
		});
	}
});
