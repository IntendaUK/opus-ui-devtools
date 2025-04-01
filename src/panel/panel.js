const buildTreeMap = flatNodes => {
	const childrenMap = new Map();
	const nodeMap = new Map();

	flatNodes.forEach(node => {
		nodeMap.set(node.id, node);

		const parentId = node.parentId;
		if (!childrenMap.has(parentId))
			childrenMap.set(parentId, []);

		childrenMap.get(parentId).push(node);
	});

	return {
		childrenMap,
		nodeMap
	};
};

const createHtmlFromTree = (parentId, childrenMap, depth = 0) => {
	const nodes = childrenMap.get(parentId) || [];
	const container = document.createElement('div');

	nodes.forEach(node => {
		const line = document.createElement('div');
		line.className = 'devtools-line';
		line.style.marginLeft = `${depth * 16}px`;

		//Convert "componentType" to "Component Type"
		const componentType = node.type[0].toUpperCase() + node.type.substr(1);

		line.innerHTML = `${componentType} id="<span style="color:var(--accent-color)">${node.id}</span>"`;

		line.onclick = () => {
			chrome.runtime.sendMessage({
				action: 'getState',
				id: node.id
			});
		};

		container.appendChild(line);

		const childContainer = createHtmlFromTree(node.id, childrenMap, depth + 1);
		container.appendChild(childContainer);
	});

	return container;
};

const displayData = data => {
	const container = document.getElementById('data-container');
	container.innerHTML = '';

	if (!Array.isArray(data)) {
		container.textContent = 'No data received yet.';

		return;
	}

	const { childrenMap } = buildTreeMap(data);
	const treeDom = createHtmlFromTree(undefined, childrenMap);
	container.appendChild(treeDom);
};

const showPopup = message => {
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
};

chrome.runtime.onMessage.addListener(message => {
	if (message.action === 'showState')
		showPopup(JSON.stringify(message.data, null, 2));
});

window.displayData = displayData;
