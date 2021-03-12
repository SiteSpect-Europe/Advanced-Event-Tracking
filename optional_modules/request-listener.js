/** 
 * Whenever a request is made with XHR or fetch
 * We can intercept based on a url match
 * 
 * Patches: XHR, Fetch and BeaconAPI
 * 
 * Example usage:

 _stsp.push({
	event: "FETCH_Detected",
	url_match: /request-test/,
	track: 'request',
	callback: function(event, prom){ // second argument is a clone of the promise.
		console.log('fetch callback', arguments)
		if(prom){ 
			prom.json().then(res => console.log('got JSON body in callback!', res))
		}
	}
})

*/
window.SS.Tracking.addModule('request', function(){
	var tracking = [],
		isSubscribed = false // prevent double events

	function checkEventForUrl(url, object){
		tracking.forEach(function(event){
			if(url.match(event.url_match)){
				window.SS.Tracking.evalEventSent(event, false, object)
			}
		})
		// check events to see if url matches event
	}

	function patchRequests(){
		if(isSubscribed){
			return;
		}
		isSubscribed = true;

		// Patch fetch
		if(window.fetch){
			var originalFetch = window.fetch;
			window.fetch = function(url) {
				return originalFetch.apply(this, arguments).then(function(res){
					try {
						// send a clone of the promise to event
						checkEventForUrl(url, res.clone())
					} catch (error) {
						console.log('error in fetch monkeypatch', error)
					}
			
					return res
				});
			}
		}

		// Patch XHR
		var originalXHRSend = XMLHttpRequest.prototype.send;
		XMLHttpRequest.prototype.send = function(data) {
			this.onprogress = function() {
				checkEventForUrl(this.responseURL, this)
			};
			return originalXHRSend.apply(this, arguments);
		};

		// Patch beaconAPI
		if(navigator && navigator.sendBeacon){
			var originalSendBeacon = navigator.sendBeacon;
			navigator.sendBeacon = function(url) {
				checkEventForUrl(url, this)
				return originalSendBeacon.apply(this, arguments);
			};
		}
	}
	
	function newEvent(event){
		if(event.track==='request' && event.url_match){
			tracking.push(event)
			patchRequests()
		}
	}

	return {
		newEvent: newEvent
	}
});