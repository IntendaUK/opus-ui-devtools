// Create a script element to load the inject.js file
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = function() {
    this.remove(); // Remove the script element after it loads
};
(document.head || document.documentElement).appendChild(script);

// Browser Tab -> Devtools (BG)
window.addEventListener('message', event => {
	if (event.source !== window || !event.data)
		return;

	if (event.data.type === 'OPUS_CHECK_EXISTS') {
		chrome.runtime.sendMessage({
			action: event.data.type,
			data: event.data.data
		});

		return true;
	} else if (typeof(event.data.type) === 'string' && event.data.type.indexOf('OPUS_GET') === 0) {
		chrome.runtime.sendMessage({
			action: event.data.type,
			data: event.data.data
		});

		return true;
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
