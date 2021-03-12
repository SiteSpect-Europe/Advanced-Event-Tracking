/** 
 * datalayer patches the datalayer so you can detect and send events based on the datalayer
 * 
 * Usage:

 _stsp.push({
	'event': 'AddToBasket',
	'track': 'datalayer',
	'filter': function($node, item){ 
		try {
			return item.category === 'BasketChange'
		} catch (error) {}
		return false;
	}
})

Notes: 
Datalayer can be bound to different names. For this purpuse you can define a different name in:
window.SS.Tracking.aet_dl_key = 'yourDLName'

In the filter function, since there is no related node in the DOM, this is an undefined attribute. 
Use the second argument to validate the new datalayer entry
*/
window.SS.Tracking.aet_dl_key = 'datalayer'; // to what key the datalayer is mapped
window.SS.Tracking.addModule('datalayer', function(){
	var dlkey = window.SS.Tracking.aet_dl_key;
	var tracking = []

	function checkEvents(item){
		for(var i=0; i<tracking.length; i++){
			window.SS.Tracking.evalEventSent(tracking[i], null , item)
		}
	}

	// enable or disable the listeners when no elements are there to watch for
	function patchDatalayer(){
		window.origDatalayer = window[dlkey].push;
		window[dlkey].push = function(item) {
			checkEvents(item);
			return window.origDatalayer.apply(window[dlkey], arguments);
		};
		for(var i=0; i<window[dlkey].length; i++){
			checkEvents(window[dlkey][i])
		}
	}

	function newEvent(event){
		if(event.track==='datalayer'){
			tracking.push(event)
			patchDatalayer()
		}
	}

	return {
		newEvent: newEvent
	}
});