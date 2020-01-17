/** 
 * Intercept Xhttp requests
*/
(function(){
	let oldFetch =  window.fetch,
		watchedUrls = []

	window.fetch = function(url, request) {
		// do something with the method, url and etc.
		console.log('intercept got hit!', url)
		ifActiveExecuteCallback(url);

		return oldFetch.apply(this, arguments);
	}

	function ifActiveExecuteCallback(url){
		watchedUrls.forEach(config => {
			const watchingForUrl = url.match(config.url);

			if(watchingForUrl && config.callback){
				config.callback();
			}
		})
	}

	window.watchForFetchRequest = function(url, callback){
		watchedUrls.push({ url: new RegExp(url, 'g'), callback });
	}
})()


watchForFetchRequest('customer/basket/add', function(){
	console.log('has been hit!')
})
