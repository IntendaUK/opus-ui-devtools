/* eslint-disable max-lines-per-function */

const findUniqueTestId = (elementId, findType, isFiltered = false) => {
	const pageFunction = `
    (function(elementId, findType, isFiltered) {
      // Helper: BFS up/down
      function closestAnywhere(startEl, selector) {
        if (startEl.matches(selector)) return startEl;
        const visited = new Set([startEl]);
        const queue = [startEl];
        while (queue.length) {
          const node = queue.shift();
          const parent = node.parentElement;
          if (parent && !visited.has(parent)) {
            visited.add(parent);
            if (parent.matches(selector)) return parent;
            queue.push(parent);
          }
          for (const child of node.children) {
            if (!visited.has(child)) {
              visited.add(child);
              if (child.matches(selector)) return child;
              queue.push(child);
            }
          }
        }
        return null;
      }

      // Helper: BFS text-only, returns element and text
      function closestTextNode(startEl) {
        const visited = new Set([startEl]);
        const queue = [startEl];
        while (queue.length) {
          const node = queue.shift();
          if (node.childElementCount === 0) {
            const txt = node.textContent.trim();
            if (txt) return { el: node, text: txt };
          }
          const parent = node.parentElement;
          if (parent && !visited.has(parent)) {
            visited.add(parent);
            queue.push(parent);
          }
          for (const child of node.children) {
            if (!visited.has(child)) {
              visited.add(child);
              queue.push(child);
            }
          }
        }
        return null;
      }

      // Helper: distance between two nodes via BFS
      function distanceBetween(startEl, targetEl) {
        const visited = new Set([startEl]);
        const queue = [{ el: startEl, dist: 0 }];
        while (queue.length) {
          const { el: node, dist } = queue.shift();
          if (node === targetEl) return dist;
          const parent = node.parentElement;
          if (parent && !visited.has(parent)) {
            visited.add(parent);
            queue.push({ el: parent, dist: dist + 1 });
          }
          for (const child of node.children) {
            if (!visited.has(child)) {
              visited.add(child);
              queue.push({ el: child, dist: dist + 1 });
            }
          }
        }
        return -1;
      }

      // Unique-selector builder (same as before)
      function buildUniqueSelector(el) {
        const tid = el.getAttribute('data-testid');
        if (!tid) return null;
        const base = '[data-testid="' + tid + '"]';
        if (document.querySelectorAll(base).length === 1) return base;
        const ancestors = [];
        let p = el.parentElement;
        while (p) {
          const ptid = p.getAttribute('data-testid');
          if (ptid) ancestors.push('[data-testid="' + ptid + '"]');
          p = p.parentElement;
        }
        let chain = null;
        for (let i = 0; i < ancestors.length; i++) {
          const segs = ancestors.slice(0, i + 1).reverse().concat([base]);
          const sel = segs.join(' > ');
          if (document.querySelectorAll(sel).length === 1) {
            chain = segs;
            break;
          }
        }
        if (!chain) return null;
        let improved = true;
        while (improved) {
          improved = false;
          for (let k = 0; k < chain.length - 1; k++) {
            const test = chain.slice(0, k).concat(chain.slice(k + 1));
            if (document.querySelectorAll(test.join(' > ')).length === 1) {
              chain = test;
              improved = true;
              break;
            }
          }
        }
        return chain.join(' > ');
      }

      const originalEl = document.getElementById(elementId);
      if (!originalEl) return null;

      // FILTERED MODE
      if (isFiltered) {
        // 1. find text node + text
        const txtNode = closestTextNode(originalEl);
        if (!txtNode) return null;
        const filterString = txtNode.text;
        // 2. find container relative to text node
        let container;
        if (findType === 'Click') container = closestAnywhere(txtNode.el, '.cpnContainer, .cpnButton');
        else if (findType === 'Input') container = closestAnywhere(txtNode.el, '.cpnInput input');
        else container = txtNode.el;
        if (!container) return null;
        // determine selector type
        let typeSel = '';
        if (container.matches('.cpnContainer')) typeSel = '.cpnContainer';
        else if (container.matches('.cpnButton')) typeSel = '.cpnButton';
        else if (container.matches('input')) typeSel = '.cpnInput input';
        else if (container.matches('[data-testid]')) typeSel = '[data-testid="' + container.getAttribute('data-testid') + '"]';
        else return null;
        // 3. climb parents while still unique among siblings of same type
        let current = container;
        while (current.parentElement) {
          current = current.parentElement;
          const count = current.querySelectorAll(typeSel).length;
          if (count > 1)
            break;
        }
        // 4. build unique selector for the final parent
        const sel = buildUniqueSelector(current);
        if (!sel) return null;
        // 5. compute distance from container to text node
        const dist = distanceBetween(container, txtNode.el);
        return sel + ' ' + typeSel + ':filter(' + filterString + '):distance(' + dist + ')';
      }

      // NON-FILTERED MODE (unchanged)
      let elementFromStep1, innerSelector;
      if (findType === 'Basic') {
        elementFromStep1 = originalEl;
        const tid = originalEl.getAttribute('data-testid');
        if (!tid) return null;
        innerSelector = '[data-testid="' + tid + '"]';
      } else if (findType === 'Input') {
        elementFromStep1 = closestAnywhere(originalEl, '.cpnInput input');
        if (!elementFromStep1) return null;
        const inputTid = elementFromStep1.getAttribute('data-testid');
        if (inputTid) innerSelector = '[data-testid="' + inputTid + '"]';
        else {
          const p1 = elementFromStep1.parentElement;
          const p2 = p1 && p1.parentElement;
          if (!p2) return null;
          const grandTid = p2.getAttribute('data-testid');
          if (!grandTid) return null;
          innerSelector = '[data-testid="' + grandTid + '"] input';
        }
      } else if (findType === 'Click') {
        elementFromStep1 = closestAnywhere(originalEl, '.cpnContainer, .cpnButton');
        if (!elementFromStep1) return null;
        const tid = elementFromStep1.getAttribute('data-testid');
        if (!tid) return null;
        innerSelector = '[data-testid="' + tid + '"]';
      } else {
        return null;
      }
      const sel = buildUniqueSelector(elementFromStep1);
      return sel;
    })("${elementId}", "${findType}", ${JSON.stringify(isFiltered)});
  `;

	chrome.devtools.inspectedWindow.eval(pageFunction, (result, exception) => {
		if (exception) {
			console.error('Error evaluating in inspectedWindow:', exception);

			return;
		}
		if (!result) {
			console.warn(`No unique selector found for ID "${elementId}".`);

			return;
		}
		// Copy to clipboard with styling and log
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
		chrome.devtools.inspectedWindow.eval(copySnippet, (copyResult, copyException) => {
			if (copyException) console.error('Failed to copy in page context:', copyException);
			else console.log('✅ Copied to clipboard:', result);
		});
	});
};

export default findUniqueTestId;
