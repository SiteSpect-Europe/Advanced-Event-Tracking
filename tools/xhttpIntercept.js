/** 
 * Intercept Xhttp requests
*/
(function(){
	let oldXHROpen = window.XMLHttpRequest.prototype.open,
		watchedUrls = []

	window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
		// do something with the method, url and etc.
		console.log('intercept got hit!', url)
		this.addEventListener('load', function() {
			ifActiveExecuteCallback(url);
		});

		return oldXHROpen.apply(this, arguments);
	}

	function ifActiveExecuteCallback(url){
		watchedUrls.forEach(config => {
			const watchingForUrl = url.match(config.url);

			if(watchingForUrl && config.callback){
				config.callback();
			}
		})
	}

	window.watchForXHTTPRequest = function(url, callback){
		watchedUrls.push({ url: new RegExp(url, 'g'), callback });
	}
})()


watchForXHTTPRequest('customer/basket/add', function(res){
	console.log('has been hit!', res)
})
