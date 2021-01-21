/**
 * Use this module when tracking won't work because bubbling is prevented somewhere in the DOM.
 * 
 * When defining a event with the attribute 'bubbling-fix: true', 
 * this module will put a mutationObserver on the selector. 
 * Whenever the selector is found, the listener is added. 
 * 
 * Anytime (something within) the selector changes, the listener is validated or re-created
 * 
 * mutations are debounced at 100ms to improve performance
 */
window.SS.Tracking.addModule('bubble-fix', function(){
	var debounceTime = 100,
		tracking = [];

	function setListener(event, $nodeList){
		var eventType = 'click';
		if(event.form){
			eventType = 'submit';
		}
		if(event.track){
			eventType = event.track
		}
		
		// console.log('Found node, setting listener', event, $nodeList, eventType)

		$nodeList.forEach(function($node){
			$node.addEventListener(eventType, function(e){
				window.SS.Tracking.checkEventSend(eventType, $node, e)
			})
		})
	}

	// simple but functional debounce
	// https://www.telerik.com/blogs/debouncing-and-throttling-in-javascript
	var timerId = null;
	var debounce = function (func, delay) {
		clearTimeout(timerId)
		timerId = setTimeout(func, delay)
	}	

	function elementsCheck(){
		tracking.forEach(function(event){
			var selector = (event.selector ? event.selector : event.form) + ':not([listenerSet])'
			if (document.querySelector(selector)) {
				setListener(event, document.querySelectorAll(selector))
				document.querySelector(selector).setAttribute('listenerSet', true)
			}
		})
	}
	
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

	var observerActive = false;
	function startObserver(){
		if(observerActive){
			return;
		}
		var observer = new MutationObserver(function() {
			debounce(elementsCheck, debounceTime);
		});
		observer.observe(document, {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true,
		})
		observerActive = true;
	}

	function newEvent(event){
		if(event['bubble-fix']){
			tracking.push(event)
			startObserver()
		}
	}

	return {
		newEvent: newEvent
	}
});