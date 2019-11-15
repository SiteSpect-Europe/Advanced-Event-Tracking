/* Copyright 2019, SiteSpect, Europe. All Rights Reserved.                 */
/*                                                                         */
/* Author: Erwin Kerk <ekerk@sitespect.com>                                */
/*                                                                         */
/* Inject this code right before the </head> using a global variation.     */
/*                                                                         */
var stspTracker = stspTracker || [];
window.SS = window.SS || {}
window.SS.Tracking = {
	enumerate : function(selector) {
		document.querySelectorAll(selector).forEach(function(el,idx){
			el.setAttribute('stsp-sequence',idx+1);
		})
	},
	send(url) {
		try {
			var xhr = window.ActiveXObject ? new window.ActiveXObject("Microsoft.XMLHTTP") : new window.XMLHttpRequest;
			xhr.open('GET', url);
		} catch(e) { 
			return false; 
		}
		try {
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"), 	
			xhr.setRequestHeader("Accept", "*/*");
		} catch(e) { 
			return false; 
		}
		try {
			xhr.send(null)
		} catch (e) {
			if (e.number & 1) return false;
		}
		return true;
	},
	setup : function() {
		document.addEventListener('click',function(event){
			if(!event.target) return;
			
			stspTracker.filter(function(item){
				return !! item.selector && event.target.matches(item.selector+','+item.selector+' *');
			}).forEach(function(item){
				if(!item.event) return;
				var element = event.target.closest(item.selector);
		
				if(!element.getAttribute('stsp-sequence') && item.enumerate) {
					window.SS.Tracking.enumerate(item.selector);
				}
		
				var trackingUrl = '/__ssobj/track?' + Object.entries(item).filter(function([k,v]){
					var skipAttributes = new Set(['selector','filter']);
					return !skipAttributes.has(k);
				}).map(function([k,v]){
					if(k=='enumerate') {
						return 'sequence='+element.getAttribute('stsp-sequence');
					}
					if(typeof v == 'function') {
						return k + '=' + v(element);
					}
					return k + '=' + v
				}).sort().join('&') + '&x=' + Math.floor(Math.random() * 99999999) + '-1';
				if(!item.filter || item.filter(element)) {
					window.SS.Tracking.send(trackingUrl);
				}
			});
		});

		stspTracker.push = function(data) {
			if(data.enumerate) {
				window.SS.Tracking.enumerate(data.selector);
			}
			Array.prototype.push.call(this,data);
		}
	}
}
window.SS.Tracking.setup();