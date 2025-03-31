chrome.devtools.panels.create(
	'Opus DevTools',
	'',
	'../panel/panel.html',
	panel => {
		panel.onShown.addListener(window => {
			const port = chrome.runtime.connect({ name: 'devtools' });
			port.postMessage({ action: 'requestData' });

			port.onMessage.addListener(msg => {
				if (msg.action === 'loadData' && msg.data)
					window.displayData(msg.data);
			});

			chrome.runtime.onMessage.addListener(message => {
				if (message.action === 'updatePanel')
					window.displayData(message.data);

				if (message.action === 'showState')
					window.showPopup(JSON.stringify(message.data, null, 2));
			});
		});
	}
);
