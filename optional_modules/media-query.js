/** 
 * Fire event whenever there is a resize and the resolution is within bounds
 * 
 * Example usage:

 _stsp.push({
	event: "MobileResolution",
	responsive_query: "(min-width: 500px) and (max-width: 1200px)",
	track: 'media-query',
	callback: function(event, prom){ // second argument is a clone of the promise.
		console.log('fetch callback', arguments)
		if(prom){ 
			prom.json().then(res => console.log('got JSON body in callback!', res))
		}
	}
})

*/
window.SS.Tracking.addModule('mediaQueryTrigger', function(){
	function mediaQueryChecker(event){
		function mediaQueryStatusChange(e){
			if(e.matches){
				var filteredEvent = Object.assign({}, event);
				delete filteredEvent.responsive_query
				window.SS.Tracking.evalEventSent(filteredEvent, false, e)
			}
		}
		
		var QueryList = window.matchMedia(event.responsive_query);

		if(QueryList.matches){
			mediaQueryStatusChange(QueryList)
		}

		QueryList.onchange = mediaQueryStatusChange
	}

	function newEvent(event){
		if(event.track==='media-query' && event.responsive_query){
			mediaQueryChecker(event)
		}
	}

	return {
		newEvent: newEvent
	}
});