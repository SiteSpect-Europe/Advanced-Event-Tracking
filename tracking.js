/* Copyright 2019, SiteSpect Europe. All Rights Reserved.                  */
/*                                                                         */
/* Author: Erwin Kerk <ekerk@sitespect.com>                                */
/*                                                                         */
/* Inject this code right before the </head> using a global variation.     */
/*                                                                         */
var _stsp = _stsp || [];
window.SS = window.SS || {}
window.SS.Tracking = {
	enumerate : function(selector) {
		document.querySelectorAll(selector).forEach(function(el,idx){
			el.setAttribute('stsp-sequence',idx+1);
		})
	},
	send: function(item,element) {
		var trackingUrl = '/__ssobj/track?' + Object.entries(item).filter(function([k,v]){
			var skipAttributes = new Set(['selector','filter', 'match']);
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
		
		try {
			var xhr = window.ActiveXObject ? new window.ActiveXObject("Microsoft.XMLHTTP") : new window.XMLHttpRequest;
			xhr.open('GET', trackingUrl);
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
			if(!!window.SS.Tracking.debug)
				console.log(trackingUrl);
			xhr.send(null)
		} catch (e) {
			if (e.number & 1) return false;
		}
		return true;
	},
	matcher: function(criteria) {
		return !Object.entries(criteria).filter(function([prop,val]){
			switch(prop) {
				case 'hostname':
				case 'pathname':
				case 'href':
				case 'host':
				case 'hash':
				case 'search':
					return !(new RegExp(val)).test(document.location[prop]);
					break;
				case 'cookie':
					return !(new RegExp(val)).test(document.cookie);
					break;
			}
		}).length;
	},
	setup : function() {
		document.addEventListener('click',function(event){
			if(!event.target) return;
			
			_stsp.filter(function(item){
				return !! item.selector && event.target.matches(item.selector+','+item.selector+' *');
			}).forEach(function(item){
				if(!item.event) return;
				var element = event.target.closest(item.selector);
				if(!element.getAttribute('stsp-sequence') && item.enumerate) {
					window.SS.Tracking.enumerate(item.selector);
				}
				if((!item.filter || item.filter(element)) && (!item.match || window.SS.Tracking.matcher(item.match))) {
					window.SS.Tracking.send(item,element);
				}
			});
		});
		_stsp.push = function(data) {
			if(data.enumerate) {
				window.SS.Tracking.enumerate(data.selector);
			}
			if(!data.selector) {
				window.SS.Tracking.send(data,null);				
			}
			Array.prototype.push.call(this,data);
		}
	}
}
window.SS.Tracking.setup();
