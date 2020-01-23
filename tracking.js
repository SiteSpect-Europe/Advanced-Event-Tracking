/* Copyright 2020, SiteSpect Europe. All Rights Reserved.                  */
/*                                                                         */
/* Authors: Erwin Kerk <ekerk@sitespect.com>                               */
/*          Jonas van Ineveld <jvanineveld@sitespect.com>                  */
/*                                                                         */
/* Inject this code right before the </head> using a global variation.     */
/*                                                                         */
/*                           Version 1.0.2                                 */

var _stsp = _stsp || [];
window.SS = window.SS || {}
window.SS.Tracking = {
	enumerate : function(selector) {
		var nodes = document.querySelectorAll(selector);
		for(var i=0; i<nodes.length; i++){
			nodes[i].setAttribute('stsp-sequence',i+1);
		}
	},
	hash :function(s){
		var a = 1, c = 0, h, o;
		if (s) {
			a = 0;
			/*jshint plusplus:false bitwise:false*/
			for (h = s.length - 1; h >= 0; h--) {
				o = s.charCodeAt(h);
				a = (a<<6&268435455) + o + (o<<14);
				c = a & 266338304;
				a = c!==0?a^c>>21:a;
			}
		}
		return String(a);
	},
	send: function(item,element) {
		var attributes = [],
			itemAttrs = Object.entries(item);

		for(var i =0; i<itemAttrs.length; i++){
			var attr = itemAttrs[i],
				_key = attr[0],
				_val = attr[1],
				attrStr = '';

			if(['selector','filter', 'match','event','callback'].indexOf(_key) > -1){
				continue;
			}

			if(_key=='enumerate') {
				attrStr = 'sequence='+element.getAttribute('stsp-sequence');
			} else if(typeof _val == 'function') {
				attrStr = _key + '=' + _val(element);
			} else {
				attrStr = _key + '=' + _val;
			}

			attributes.push(attrStr)
		}

		attributes.sort();
		
		var itemEvent = typeof item.event === 'function' ? item.event(element) : item.event;
		var trackingUrl = '/__ssobj/track?event=' + itemEvent + (attributes.length ? '&' + attributes.join('&') : '') + '&x=' + Math.floor(Math.random() * 99999999) + '-1';
		var xhr = window.ActiveXObject ? new window.ActiveXObject("Microsoft.XMLHTTP") : new window.XMLHttpRequest;

		try {
			xhr.open('GET', trackingUrl);
			
			if(!!window.ssp_current_data) {
				xhr.onreadystatechange = function(a,b,c){
					if(xhr.readyState == xhr.HEADERS_RECEIVED) {
						if(xhr.getResponseHeader("SiteSpect-Metrics-Info")) {
							var data = 	xhr.getResponseHeader("SiteSpect-Metrics-Info");
							var metrics = JSON.parse(data);
							var newmetrics = {};
							for(id in metrics) {
								newid = id + '-' + window.SS.Tracking.hash(attributes.join('&'));
								newmetrics[newid]={};
								Object.assign(newmetrics[newid],metrics[id]);
								newmetrics[newid].ID=newid;
								if(attributes.length)
									newmetrics[newid].Name += '<br/>AET: '+attributes.join(', '); 
							}
							data = JSON.stringify(newmetrics);
							function ssApplyEventTrackMetric(req, obj) {
								if ( document.querySelector('.dx-pane--diagnostics .dx-pane--dx-table') ) {
									__preview_history.add_event_track_metric(
										data,
										'Metric (EventTrack)'
									);
								} else {
									setTimeout(
										function() {
											ssApplyEventTrackMetric(req, obj);
										},100
									);
								}
							}
							ssApplyEventTrackMetric(xhr, xhr);
						}
					}
				}
			}
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
			if(!!window.SS.Tracking.debug || !!window.ssp_current_data)
				console.log(trackingUrl);
		
			xhr.send(null);
		} catch (e) {
			if (e.number & 1) return false;
		}
		return true;
	},
	matcher: function(criteria) {
		return !Object.entries(criteria).filter(function(arr){
			var prop = arr[0],
				val = arr[1];

			switch(prop) {
				case 'hostname':
				case 'pathname':
				case 'href':
				case 'host':
				case 'hash':
				case 'search':
					return !(new RegExp(val)).test(document.location[prop]);
				case 'cookie':
					return !(new RegExp(val)).test(document.cookie);
			}
		}).length;
	},
	process : function(data){
		if(data.enumerate) {
			window.SS.Tracking.enumerate(data.selector);
		}
		if(!data.selector && (!data.filter || data.filter(data)) && (!data.match || window.SS.Tracking.matcher(data.match))) {
			window.SS.Tracking.send(data,null);
			if(data.callback) {
				data.callback(data);
			}				
		}
	},
	setup : function() {
		for(var i=0; i<_stsp.length; i++){
			window.SS.Tracking.process(_stsp[i]);
		}

		document.addEventListener('click',function(event){
			if(!event.target) return;

			for(var i=0; i<_stsp.length; i++){
				var item = _stsp[i];

				if(!item.event || !item.selector || !event.target.matches(item.selector+','+item.selector+' *')){
					continue;
				}
				
				var element = event.target.closest(item.selector);
				if(!element.getAttribute('stsp-sequence') && item.enumerate) {
					window.SS.Tracking.enumerate(item.selector);
				}
				if((!item.filter || item.filter(element)) && (!item.match || window.SS.Tracking.matcher(item.match))) {
					window.SS.Tracking.send(item,element);
					if(item.callback) {
						item.callback(item);
					}
				}
			}
		});

		_stsp.push = function(data) {
			window.SS.Tracking.process(data)

			Array.prototype.push.call(this,data);
		}
	}
}

if (!Element.prototype.matches) {
	Element.prototype.matches = 
	Element.prototype.matchesSelector || 
	Element.prototype.mozMatchesSelector ||
	Element.prototype.msMatchesSelector || 
	Element.prototype.oMatchesSelector || 
	Element.prototype.webkitMatchesSelector ||
	function(s) {
		var matches = (this.document || this.ownerDocument).querySelectorAll(s),
			i = matches.length;
		while (--i >= 0 && matches.item(i) !== this) {}
		return i > -1;            
	};
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
	var el = this;

	do {
		if (el.matches(s)) return el;
		el = el.parentElement || el.parentNode;
	} while (el !== null && el.nodeType === 1);
		return null;
	};
}

if (!Object.entries) {
	Object.entries = function( obj ){
		var ownProps = Object.keys( obj ),
			i = ownProps.length,
			resArray = new Array(i); // preallocate the Array
		while (i--)
			resArray[i] = [ownProps[i], obj[ownProps[i]]];
		
		return resArray;
	};
}

if (typeof Object.assign !== 'function') {
	// Must be writable: true, enumerable: false, configurable: true
	Object.defineProperty(Object, "assign", {
	  value: function assign(target, varArgs) { // .length of function is 2
		'use strict';
		if (target === null || target === undefined) {
		  throw new TypeError('Cannot convert undefined or null to object');
		}
  
		var to = Object(target);
  
		for (var index = 1; index < arguments.length; index++) {
		  var nextSource = arguments[index];
  
		  if (nextSource !== null && nextSource !== undefined) { 
			for (var nextKey in nextSource) {
			  // Avoid bugs when hasOwnProperty is shadowed
			  if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
				to[nextKey] = nextSource[nextKey];
			  }
			}
		  }
		}
		return to;
	  },
	  writable: true,
	  configurable: true
	});
}

window.SS.Tracking.setup();
