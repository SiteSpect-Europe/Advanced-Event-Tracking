/* Copyright 2020, SiteSpect Europe. All Rights Reserved.                  */
/*                                                                         */
/* Authors: Erwin Kerk <ekerk@sitespect.com>                               */
/*          Jonas van Ineveld <jvanineveld@sitespect.com>                  */
/*                                                                         */
/* Inject this code right before the </head> using a global variation.     */
/*                                                                         */

var _stsp = _stsp || [];
window.SS = window.SS || {}
window.SS.Tracking = {
	version: '%dev_version%',
	eventTrackUrl: '/__ssobj/track',
	asmtCallBack: null,
	isDebug: function(){ return !!window.SS.Tracking.debug },
	isPreview: function(){ return !!window.ssp_current_data },
	eventHandlers : [],
	modules: {
		index: []
	},
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
	sendXHR: function(trackingUrl, attributes){
		var xhr = window.ActiveXObject ? new window.ActiveXObject("Microsoft.XMLHTTP") : new window.XMLHttpRequest;

		// could happen when it's a fallback for sendBeacon
		if(!attributes){
			attributes = []
		}

		try {
			xhr.open('GET', trackingUrl);
			
			if(window.SS.Tracking.isPreview()) {
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

			xhr.send(null);
		} catch(e) { 
			
			return false; 
		}
	},
	sendBeacon: function(trackingUrl){
		if(!navigator || !navigator.sendBeacon || window.SS.Tracking.preventBeaconAPI){
			window.SS.Tracking.sendXHR(trackingUrl)
			return;
		}
		try {
			navigator.sendBeacon(trackingUrl);
		} catch (error) {
			window.SS.Tracking.sendXHR(trackingUrl) // send xhr anyway
			console.log('error sending beacon!', error)
		}
	},
	send: function(item,element, optionalEvent) {
		var attributes = [],
			itemAttrs = Object.entries(item),
			resolved = {
				_event: {
					stspEvent: item,
					element: element,
					event: optionalEvent, 
				}
			},
			countedMetric = !!item.counted_metric,
			event_id = item.__eat_id;
		
		for(var i =0; i<itemAttrs.length; i++){
			var attr = itemAttrs[i],
				_key = attr[0],
				_val = attr[1],
				attrStr = '';

			if(['selector','filter', 'match','event','callback', 'form', 'delay', 'track', 'url_match', 'counted_metric', '__eat_id'].indexOf(_key) > -1){
				continue;
			}

			if(['object'].indexOf(typeof _val) > -1){
				continue;
			}

			if(_key=='enumerate') {
				attrStr = 'sequence='+element.getAttribute('stsp-sequence');
			} else if(typeof _val == 'function') {
				var res = _val(element, optionalEvent ? optionalEvent : false);
				attrStr = _key + '=' + res
				resolved[_key] = res
			} else {
				attrStr = _key + '=' + _val;
				resolved[_key] = _val;
			}

			attributes.push(attrStr)
		}

		attributes.sort();
		
		var itemEvent = typeof item.event === 'function' ? item.event(element) : item.event;
		var trackingUrl = window.SS.Tracking.eventTrackUrl + '?event=' + itemEvent + (attributes.length ? '&' + attributes.join('&') : '') + '&x=' + event_id;
	
		try {
			if(window.SS.Tracking.isPreview() || window.SS.Tracking.isDebug()){
				console.log(trackingUrl);
				window.SS.Tracking.sendXHR(trackingUrl, attributes);
			} else {
				window.SS.Tracking.sendBeacon(trackingUrl);
			}
			if(countedMetric && window.SS.Tracking.asmtCallBack){
				// small timeout for metric to make user counted
				setTimeout(function(){
					function reqListener () {
						try {
							var asmtData = JSON.parse(this.responseText);
							window.SS.Tracking.asmtCallBack(asmtData)
						} catch (error) {
							
						}
					}
					
					var oReq = new XMLHttpRequest();
					oReq.addEventListener("load", reqListener);
					oReq.open("GET", "/__ssobj/asmt_update");
					oReq.send();
				}, 100);
			}
		} catch (e) {
			if (e.number & 1) return false;
		}
		return resolved;
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
		data.__eat_id = Math.floor(Math.random() * 99999999) + '-1';

		if(data.enumerate) {
			this.enumerate(data.selector);
		}
		if(!data.form && !data.selector && (!data.filter || data.filter(data)) && (data.track !== 'media-query') && (!data.match || window.SS.Tracking.matcher(data.match))) {
			var rdata = this.send(data,null);
			if(data.callback) {
				data.callback(rdata);
			}
		}
		if(data.track){
			this.listenToEvent(data.track, function(event){
				window.SS.Tracking.checkEventSend(data.track, event.target, event)
			});
		}

		this.modulesFn('newEvent', data);
	},
	setup : function() {
		for(var i=0; i<_stsp.length; i++){
			window.SS.Tracking.process(_stsp[i]);
		}

		this.listenToEvent('click', function(event){
			window.SS.Tracking.checkEventSend('click', event.target, event)
		});

		this.listenToEvent('submit', function(event){
			window.SS.Tracking.checkEventSend('submit', event.target, event)
		});

		_stsp.push = function(data) {
			window.SS.Tracking.process(data)

			Array.prototype.push.call(this,data);
		}
	},
	// used to directly send a event from module
	evalEventSent: function(item, target, originalEvent){
		var send = function(item, target){
			if(!target){ // not DOM related

			} else {
				var element = target.closest(item.selector);
				if(!element.getAttribute('stsp-sequence') && item.enumerate) {
					window.SS.Tracking.enumerate(item.selector);
				}
			}

			if((!item.filter || item.filter(element, originalEvent))) {
				var rdata = window.SS.Tracking.send(item,element, originalEvent ? originalEvent : false);
				if(item.callback) {
					item.callback(rdata, originalEvent);
				}
			}
		}
		if((!item.match || window.SS.Tracking.matcher(item.match))){
			if(item.delay){
				setTimeout(function(data){ send(data.item, data.target, originalEvent ? originalEvent : false) }, item.delay, { item: item, target: target })
			} else {
				send(item, target, originalEvent ? originalEvent : false)
			}
		}
	},
	checkEventSend : function(type, target, originalEvent){

		for(var i=0; i<_stsp.length; i++){
			var item = _stsp[i];

			// no event, or event type differs from item
			if(!item.event || item.track && item.track!==type){
				continue;
			}

			if(item.track && item.track!==type){
				continue;
			}

			// now events are filtered for type. So click listener only has click events here, etc.
			
			if(type==='submit'){
				if(!item.selector && (!item.form || !target.matches(item.form+','+item.selector+' *'))){
					continue;
				}
				
				// cast form selector to item, 
				item.selector = item.selector ? item.selector : item.form
			}
			
			if(!item.selector || !target.matches(item.selector+','+item.selector+' *')){
				continue;
			}

			if(type==='change'){
				item.value = target.value
			}

			if(item.form && type==='click' && item.track !== 'click'){
				continue;
			}

			this.evalEventSent(item, target, originalEvent);
		}
	},
	isListening : function(type){
		return this.eventHandlers.filter(function(config){
			return config.type === type
		}).length
	},
	listenToEvent : function(type, callback, $node){
		if(this.isListening(type)){
			return; // no double listeners
		}
		var target = $node ? $node : document
		var handler = target.addEventListener(type, function(event){
			if(!event.target) return;

			callback(event)
		});

		this.eventHandlers.push({ type: type, handler: handler });
	},
	addModule : function(name, tracker){
		if(this.modules.index.indexOf(name) > -1){
			return;
		}
		window.SS.Tracking.modules[name] = tracker();
		this.modules.index.push(name)

		// push existing events to module
		if(window.SS.Tracking.modules[name]['newEvent']){
			for(var i=0; i<_stsp.length; i++){
				var item = _stsp[i];
				window.SS.Tracking.modules[name].newEvent(item);
			}
		}
	},
	modulesFn : function(type, event){ // a way to send update to all modules
		Object.keys(window.SS.Tracking.modules).forEach(function(name){
			if(typeof window.SS.Tracking.modules[name][type] === 'function'){
				var fn = window.SS.Tracking.modules[name][type]
				fn(event)
			}
		})
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