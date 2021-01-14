/** 
 * SPA adapter for advanced event tracking
 * 
 * This adapter will ensure page navigations will evaluate all 'non' event related events
 * So if there is a click, form, or track event related to the event, it won't get evaluated every
 * navigation.
*/
(function(STSP_Tracking){
	function evalEvents(){
		for(var i=0; i<_stsp.length; i++){
			var event = _stsp[i];
			// all the 'non' event related events need to be evaluated
			if(!event.form && !event.selector && !event.track) {
				STSP_Tracking.process(event);
			}
		}
	}

	(function(history) { 
		function mp(type){
			var orig = history[type]; 
			history[type] = function(state) { 
				evalEvents()
				return orig.apply(history, arguments); 
			} 
		}

		['pushState', 'replaceState', 'back', 'go'].forEach(mp)
	})(window.history); 
})(window.SS.Tracking)