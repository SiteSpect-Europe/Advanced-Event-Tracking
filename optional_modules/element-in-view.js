/** 
 * element_in_view track type for advanced event tracking
 * 
 * With this track type, you can send an event when an element is in the viewport
 * optionaly you can persist the element tracking, and track how many times it has been in 
 * the viewport
 * 
 * Also it's possible to define thresholds for % of element in viewport
*/
window.SS.Tracking.addModule('element_in_view', function(){
	var throttleSpeed = 100, // throttled at 10 times a second
		tracking = [];
		
	// throttle where we ensure final execution is after last scroll
	var t_out = null
	function throttle(fn, wait) {
		return function(){
			if(t_out!==null){
				return;
			}
		
			t_out = setTimeout(function(){
				fn()
				t_out = null;
			}, wait)
		}
	}

	// https://stackoverflow.com/a/20227394
	function isVisible($el, eventConfig){
		if(!$el){ return false; }
		
		
		var rect = $el.getBoundingClientRect();
		var elementArea = (rect.width * rect.height);
		var docHeight = (window.innerHeight || document.documentElement.clientHeight)
		var bottomMinus = docHeight - rect.bottom
		
		var visibleWidth = (
			rect.left >= 0 ? rect.width : rect.width + rect.left
		);
		if (visibleWidth < 0) {
			visibleWidth = 0;
		}
		
		var visibleHeight = (
			rect.top >= 0 ? rect.height - (bottomMinus<=0 ? Math.abs(bottomMinus) : 0) : rect.height + rect.top
		);
		if (visibleHeight < 0) {
			visibleHeight = 0;
		}

		var visibleArea = visibleWidth * visibleHeight;
		var visiblePercentage = (visibleArea / elementArea * 100);
		
		if(!eventConfig.threshold){
			return visiblePercentage === 100;
		} else {
			// console.log({$el, visiblePercentage})
			return visiblePercentage >= eventConfig.threshold;
		}
	}

	// watch out, needs to be fast af
	function checkEvents(){
		var remove = []
		for(var i=0; i<tracking.length; i++){
			var event = Object.assign({}, tracking[i]),
				e_id = event.__eat_id ? event.__eat_id : '',
				is_visible_key =  e_id+'_is_visible';
			var $els = document.documentElement.querySelectorAll(tracking[i].selector);
			
			for(var x=0; x<$els.length; x++){
				var $el = $els[x];
				var elVisible = isVisible($el, event);

				// console.log({$el, elVisible})

				if($el && elVisible && !$el[is_visible_key]){
					tracking[i].times_visible ++;

					if(!tracking[i].persistent){
						remove.push(i)
						delete event.times_visible;
					}

					$el[is_visible_key] = true;

					window.SS.Tracking.evalEventSent(tracking[i], $el, {'event': 'elementInViewport'})
				} else if($el && !elVisible && $el[is_visible_key] === true){
					$el[is_visible_key] = false;
				}
			}
		}

		for (var i = remove.length -1; i >= 0; i--){
			tracking.splice(remove[i],1);
		}
		// remove all 'remove' events from tracking array

		listenerToggleCheck()
	}

	var throttledCheckEvents = throttle(checkEvents, throttleSpeed)
	var isSubscribed = false // prevent double events

	// enable or disable the listeners when no elements are there to watch for
	function listenerToggleCheck(){
		var action = false
		if(isSubscribed && tracking.length===0){
			action = 'removeEventListener'
			isSubscribed = false
		} else if(!isSubscribed && tracking.length > 0) {
			action = 'addEventListener'
			isSubscribed = true
		}
		if(!action){ // if no action is needed, stop
			return;
		}

		['scroll', 'DOMContentLoaded', 'resize', 'load'].forEach(function(type){ // set all event listeners
			var fn = window[action] // target event listener
			fn(type, throttledCheckEvents) // set event listener
		})

		checkEvents() // check if currently visible on page
	}

	function newEvent(event){
		if(event.track==='element_in_view'){
			event.times_visible = 0; // will hold number of times visible, usable in event
			event.visible = false; // currently in view?
			tracking.push(event)
			listenerToggleCheck()
		}
	}

	return {
		newEvent: newEvent
	}
});