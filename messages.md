# How Messages Flow

## Devtools -> Tab
When devtools needs to get data from the browser tab:

1. Send a message to the BG worker from within the devtools panel code:
```js
chrome.runtime.sendMessage({
    action: 'OPUS_ASK_%ACTION%',
    data: {
        data: 'goes',
        here: '!'
    }
});
```

2. The BG worker will send it to the content page automatically with this code (as long as action starts with 'OPUS_ASK'):
```js
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {
        action: message.action,
        data: message.data
    });
});
```

3. The content page will send it to the browser tab automatically with this code:
```js
window.postMessage({
    type: message.action,
    data: message.data
});
```

4. Add a handler for the action to the injected JS script (at the top of `content.js` within the `message` listener):
```js
else if (event.data.type === 'OPUS_ASK_%ACTION%')
	window._OPUS_DEVTOOLS_GLOBAL_HOOK.yourMethod(event.data.data);
```

## Tab -> Devtools (OPUS_GET_???)
When the browser tab needs to send data to devtools:

1. Send a message to the content page:
```js
window.postMessage({
    type: 'OPUS_GET_%ACTION%',
    data: {
        data: 'goes',
        here: '!'
    }
}, '*');
```

2. The content page will send it to devtools automatically with this code (as long as the action starts with 'OPUS_GET'):
```js
chrome.runtime.sendMessage({
    action: event.data.type,
    data: event.data.data
});
```

3. The BG worker will send it to the devtools panel automatically with this code:
```js
chrome.runtime.sendMessage({
    action: message.action,
    data: message.data
});
```

4. Within `panel.js` in the `onMessage` event, you can listen for your action like this:
```js
if (message.action === 'OPUS_GET_%ACTION%') {
    const { data } = message;

    //Do something with the data you received
}
```