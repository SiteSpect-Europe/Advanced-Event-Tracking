/** 
 * Intercept Xhttp requests
*/
(function(){
	let oldFetch =  window.fetch,
		watchedUrls = []

	window.fetch = function(url, requestInfo) {
		try {
			ifActiveExecuteCallback(url, requestInfo);
		} catch (error) {
			console.log('error in fetch monkeypath', url, requestInfo, error)
		}

		return oldFetch.apply(this, arguments);
	}

	function ifActiveExecuteCallback(url, requestInfo){
		watchedUrls.forEach(config => {
			const watchingForUrl = url.match(config.url);

			if(watchingForUrl && config.callback){
				config.callback(requestInfo);
			}
		})
	}

	window.watchForFetchRequest = function(url, callback){
		watchedUrls.push({ url: new RegExp(url, 'g'), callback });
	}
})()


watchForFetchRequest('customer/basket/add', function(requestInfo){
	console.log('has been hit!', requestInfo)
})
