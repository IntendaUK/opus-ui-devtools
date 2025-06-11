/* eslint-disable max-lines-per-function */

//findType: ['Basic', 'Input', 'Click']
/*
	Algorithm:
		1. Note findType
			a. If 'Basic', note the [data-testid] for the elementId
			b. If 'Input', find the [data-testid] of the closest '.cpnInput input'
			c. If 'Click', find the [data-testid] of the closest '.cpnContainer' OR '.cpnButton'
		2. Repeat the following until we exit:
			a. Perform document.querySelectorAll with the testid
			b. If we get 1 result back, return (and exit) the following:
				'[data-testid="testid of ancestor"] [innerSelector]'
				but if the 2 testids are the same, only return a single selector
			c. Choose the parent of the current element instead and start over from 2.a.
*/
const findUniqueTestId = (elementId, findType) => {
	// We build a string of JavaScript that will run inside the inspected window.
	const pageFunction = `
		(function(elementId, findType) {
			// ────────────────────────────────────────────────────────────────────────────
			// Helper: BFS to find the closest match up or down the DOM tree
			// ────────────────────────────────────────────────────────────────────────────
			function closestAnywhere(startEl, selector) {
				const visited = new Set();
				const queue = [startEl];
				visited.add(startEl);

				while (queue.length > 0) {
					const node = queue.shift();

					if (node !== startEl && node.matches(selector)) {
						return node;
					}

					const parent = node.parentElement;
					if (parent && !visited.has(parent)) {
						visited.add(parent);
						queue.push(parent);
					}

					for (let i = 0; i < node.children.length; i++) {
						const child = node.children[i];
						if (!visited.has(child)) {
							visited.add(child);
							queue.push(child);
						}
					}
				}
				return null;
			}

			// ────────────────────────────────────────────────────────────────────────────
			// 1. Grab the element by ID (prerequisite for step 1)
			// ────────────────────────────────────────────────────────────────────────────
			var originalEl = document.getElementById(elementId);
			if (!originalEl) {
				return null;
			}

			// ────────────────────────────────────────────────────────────────────────────
			// 1.a/1.b/1.c: Determine the “original” element and testId based on findType
			// ────────────────────────────────────────────────────────────────────────────
			var elementFromStep1;
			var originalTestId;
			var innerSelector;

			if (findType === 'Basic') {
				elementFromStep1 = originalEl;
				originalTestId = elementFromStep1.getAttribute('data-testid');
				if (!originalTestId) return null;
				innerSelector = '[data-testid=\"' + originalTestId + '\"]';
			} else if (findType === 'Input') {
				elementFromStep1 = closestAnywhere(originalEl, '.cpnInput input');
				if (!elementFromStep1) return null;

				var inputTestId = elementFromStep1.getAttribute('data-testid');
				if (inputTestId) {
					originalTestId = inputTestId;
					innerSelector = '[data-testid=\"' + originalTestId + '\"]';
				} else {
					var parent = elementFromStep1.parentElement;
					if (!parent) return null;
					var grand = parent.parentElement;
					if (!grand) return null;
					var grandTestId = grand.getAttribute('data-testid');
					if (!grandTestId) return null;
					originalTestId = grandTestId;
					innerSelector = '[data-testid=\"' + originalTestId + '\"] input';
				}
			} else if (findType === 'Click') {
				elementFromStep1 = closestAnywhere(originalEl, '.cpnContainer, .cpnButton');
				if (!elementFromStep1) return null;
				originalTestId = elementFromStep1.getAttribute('data-testid');
				if (!originalTestId) return null;
				innerSelector = '[data-testid=\"' + originalTestId + '\"]';
			} else {
				return null;
			}

			// ────────────────────────────────────────────────────────────────────────────
			// 2. Now repeat the following while climbing up from elementFromStep1:
			//    a. Read the current element’s data-testid.
			//    b. Query all elements with that data-testid.
			//    c. If exactly one match, that’s our uniqueTestId.
			//    d. Otherwise, move up to the parent element and repeat.
			// ────────────────────────────────────────────────────────────────────────────
			var el = elementFromStep1;
			var uniqueTestId = null;

			while (el) {
				// 2.a. Read this element’s data-testid
				var testId = el.getAttribute('data-testid');

				// 2.b. Query all elements in the page that share this testId
				if (testId) {
					var matches = document.querySelectorAll('[data-testid=\"' + testId + '\"]');

					// 2.c. If exactly one match, store testId and break
					if (matches.length === 1) {
						uniqueTestId = testId;
						break;
					}
				}

				// 2.d. Otherwise, climb one level up in the DOM
				el = el.parentElement;
			}

			// ────────────────────────────────────────────────────────────────────────────
			// 3. If we found a uniqueTestId, return the appropriate selector.
			//    - If uniqueTestId === originalTestId, return only innerSelector.
			//    - Otherwise return "[data-testid=\"uniqueTestId\"] " + innerSelector.
			// ────────────────────────────────────────────────────────────────────────────
			if (uniqueTestId) {
				if (uniqueTestId === originalTestId) {
					return innerSelector;
				} else {
					return '[data-testid=\"' + uniqueTestId + '\"] ' + innerSelector;
				}
			}

			// ────────────────────────────────────────────────────────────────────────────
			// 4. Reached <html> without finding a unique data-testid
			// ────────────────────────────────────────────────────────────────────────────
			return null;
		})(${JSON.stringify(elementId)}, ${JSON.stringify(findType)});
	`;

	const copyTextToClipboard = text => {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			return navigator.clipboard.writeText(text)
				.then(() => console.log('✅ Selector copied to clipboard'))
				.catch(err => {
					console.warn('⚠️ navigator.clipboard failed, falling back to execCommand', err);
					fallbackCopy();
				});
		}
		// fallback
		function fallbackCopy () {
			const ta = document.createElement('textarea');
			ta.value = text;
			ta.style.position = 'fixed';
			ta.style.top = '0';
			ta.style.left = '0';
			ta.style.width = '1px';
			ta.style.height = '1px';
			ta.style.padding = '0';
			ta.style.border = 'none';
			ta.style.outline = 'none';
			ta.style.boxShadow = 'none';
			ta.style.background = 'transparent';
			document.body.appendChild(ta);
			ta.focus();
			ta.select();
			try {
				document.execCommand('copy');
				console.log('✅ Selector copied to clipboard (execCommand)');
			} catch (err) {
				console.error('❌ Fallback: unable to copy', err);
			}
			document.body.removeChild(ta);
		}
		fallbackCopy();
	};

	// Now invoke that string in the inspected page context:
	chrome.devtools.inspectedWindow.eval(
		pageFunction,
		// Callback receives two args: result (the returned selector or null) and exceptionDetails
		(result, exceptionDetails) => {
			if (exceptionDetails) {
				console.error(
					'Error evaluating in inspectedWindow:',
					exceptionDetails
				);

				return;
			}

			if (result) {
				// ───────────────────────────────────────────────────────────────────
				// Now *inject* a tiny copy-to-clipboard snippet into the *page*,
				// using execCommand there (avoids the devtools Clipboard API policy).
				// ───────────────────────────────────────────────────────────────────
				const escaped = JSON.stringify(result);
				const copySnippet = `
				(function(text) {
					const ta = document.createElement('textarea');
					ta.value = text;
					ta.style.position = 'fixed';
					ta.style.top = '0';
					ta.style.left = '0';
					ta.style.width = '1px';
					ta.style.height = '1px';
					ta.style.padding = '0';
					ta.style.border = 'none';
					ta.style.outline = 'none';
					ta.style.boxShadow = 'none';
					ta.style.background = 'transparent';
					document.body.appendChild(ta);
					ta.focus();
					ta.select();
					document.execCommand('copy');
					document.body.removeChild(ta);
					console.log('🔍 Selector copied to clipboard');
				})(${escaped});
			`;

				chrome.devtools.inspectedWindow.eval(copySnippet, (_, copyErr) => {
					if (copyErr)
						console.error('Failed to copy in page context:', copyErr);
					else
						console.log('✅ Selector copied to clipboard (via page execCommand)');
				});
			} else {
				console.warn(
					`No unique data-testid was found when starting from ID "${elementId}" with findType "${findType}".`
				);
			}
		}
	);
};

export default findUniqueTestId;
