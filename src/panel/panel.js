function createHtmlFromJson (data, parentKey = '', depth = 0) {
	const container = document.createElement('div');

	if (typeof data === 'object' && data !== null) {
		Object.entries(data).forEach(([key, value]) => {
			const item = document.createElement('div');
			item.style.marginLeft = `${depth * 10}px`;

			if (key === 'id' && typeof value === 'string') {
				const button = document.createElement('button');
				button.textContent = `Highlight and Get State: ${value}`;
				button.onclick = () => {
					chrome.runtime.sendMessage({
						action: 'getState',
						id: value
					});
				};

				item.innerHTML = `<strong>${key}:</strong> ${value}`;
				item.appendChild(button);
			} else if (Array.isArray(value)) {
				item.innerHTML = `<strong>${key}:</strong>`;
				value.forEach(child => {
					item.appendChild(createHtmlFromJson(child, `${parentKey}.${key}`, depth + 1));
				});
			} else if (typeof value === 'object' && value !== null) {
				item.innerHTML = `<strong>${key}:</strong>`;
				item.appendChild(createHtmlFromJson(value, `${parentKey}.${key}`, depth + 1));
			} else
				item.innerHTML = `<strong>${key}:</strong> ${value}`;

			container.appendChild(item);
		});
	} else
		container.innerHTML = data;

	return container;
}

function displayData (data) {
	const container = document.getElementById('data-container');
	container.innerHTML = '';
	if (data)
		container.appendChild(createHtmlFromJson(data));
	else
		container.textContent = 'No data received yet.';
}

function showPopup (message) {
	const popup = document.createElement('div');
	popup.style.position = 'fixed';
	popup.style.top = '10px';
	popup.style.right = '10px';
	popup.style.padding = '10px';
	popup.style.backgroundColor = '#333';
	popup.style.color = '#fff';
	popup.style.border = '1px solid #555';
	popup.style.zIndex = '1000';
	popup.innerHTML = `<strong>getState Result:</strong> ${message}`;
	document.body.appendChild(popup);

	setTimeout(() => {
		popup.remove();
	}, 3000);
}

chrome.runtime.onMessage.addListener(message => {
	if (message.action === 'showState')
		showPopup(JSON.stringify(message.data, null, 2));
});

window.displayData = displayData;
