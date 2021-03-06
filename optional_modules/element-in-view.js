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

	// https://stackoverflow.com/a/7557433
	function isVisible($el, eventConfig){
		if(!$el){ return false; }
		var rect = $el.getBoundingClientRect()

		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}

	// watch out, needs to be fast af
	function checkEvents(){
		var remove = []
		for(var i=0; i<tracking.length; i++){
			var $els = document.documentElement.querySelectorAll(tracking[i].selector);
			
			for(var x=0; x<$els.length; x++){
				var $el = $els[x];
				var elVisible = isVisible($el);

				// console.log({$el, elVisible})

				if($el && elVisible && !$el.visible){
					if(!tracking[i].persistent){
						remove.push(i)
					}

					$el.visible = true;

					window.SS.Tracking.evalEventSent(tracking[i], $el, {'event': 'elementInViewport'})
					$el.times_visible ++;
				} else if($el && !elVisible && $el.visible === true){
					$el.visible = false;
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