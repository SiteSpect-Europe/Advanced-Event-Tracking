/**
* SiteSpect Advanced Event Tracking
* Copyright 2021, SiteSpect Europe. All Rights Reserved.
* V1.0.16
*
* Included modules: element-in-view,bubble-fix,request-listener,spa-adapter,datalayer
*/
var _stsp=_stsp||[];window.SS=window.SS||{},window.SS.Tracking={version:"1.0.16",isDebug:function(){return!!window.SS.Tracking.debug},isPreview:function(){return!!window.ssp_current_data},eventHandlers:[],modules:{index:[]},enumerate:function(e){for(var t=document.querySelectorAll(e),n=0;n<t.length;n++)t[n].setAttribute("stsp-sequence",n+1)},hash:function(e){var t,n,r=1,i=0;if(e)for(r=0,t=e.length-1;0<=t;t--)r=0!==(i=266338304&(r=(r<<6&268435455)+(n=e.charCodeAt(t))+(n<<14)))?r^i>>21:r;return String(r)},sendXHR:function(e,c){var a=window.ActiveXObject?new window.ActiveXObject("Microsoft.XMLHTTP"):new window.XMLHttpRequest;c=c||[];try{a.open("GET",e),window.SS.Tracking.isPreview()&&(a.onreadystatechange=function(e,t,n){if(a.readyState==a.HEADERS_RECEIVED&&a.getResponseHeader("SiteSpect-Metrics-Info")){var r=a.getResponseHeader("SiteSpect-Metrics-Info"),i=JSON.parse(r),o={};for(id in i)newid=id+"-"+window.SS.Tracking.hash(c.join("&")),o[newid]={},Object.assign(o[newid],i[id]),o[newid].ID=newid,c.length&&(o[newid].Name+="<br/>AET: "+c.join(", "));r=JSON.stringify(o),function e(t,n){document.querySelector(".dx-pane--diagnostics .dx-pane--dx-table")?__preview_history.add_event_track_metric(r,"Metric (EventTrack)"):setTimeout(function(){e(t,n)},100)}(a,a)}})}catch(e){return!1}try{a.setRequestHeader("X-Requested-With","XMLHttpRequest"),a.setRequestHeader("Accept","*/*"),a.send(null)}catch(e){return!1}},sendBeacon:function(t){if(navigator&&navigator.sendBeacon&&!window.SS.Tracking.preventBeaconAPI)try{navigator.sendBeacon(t)}catch(e){window.SS.Tracking.sendXHR(t),console.log("error sending beacon!",e)}else window.SS.Tracking.sendXHR(t)},send:function(e,t,n){for(var r=[],i=Object.entries(e),o={_event:{stspEvent:e,element:t,event:n}},c=0;c<i.length;c++){var a=i[c],s=a[0],u=a[1],l="";if(!(-1<["selector","filter","match","event","callback","form","delay","track","url_match"].indexOf(s))&&!(-1<["object"].indexOf(typeof u))){if("enumerate"==s)l="sequence="+t.getAttribute("stsp-sequence");else if("function"==typeof u){var d=u(t,n||!1);l=s+"="+d,o[s]=d}else l=s+"="+u,o[s]=u;r.push(l)}}r.sort();var f="/__ssobj/track?event="+("function"==typeof e.event?e.event(t):e.event)+(r.length?"&"+r.join("&"):"")+"&x="+Math.floor(99999999*Math.random())+"-1";try{window.SS.Tracking.isPreview()||window.SS.Tracking.isDebug()?(console.log(f),window.SS.Tracking.sendXHR(f,r)):window.SS.Tracking.sendBeacon(f)}catch(e){if(1&e.number)return!1}return o},matcher:function(e){return!Object.entries(e).filter(function(e){var t=e[0],n=e[1];switch(t){case"hostname":case"pathname":case"href":case"host":case"hash":case"search":return!new RegExp(n).test(document.location[t]);case"cookie":return!new RegExp(n).test(document.cookie)}}).length},process:function(t){if(t.enumerate&&this.enumerate(t.selector),!t.form&&!t.selector&&(!t.filter||t.filter(t))&&(!t.match||window.SS.Tracking.matcher(t.match))){var e=this.send(t,null);t.callback&&t.callback(e)}t.track&&this.listenToEvent(t.track,function(e){window.SS.Tracking.checkEventSend(t.track,e.target,e)}),this.modulesFn("newEvent",t)},setup:function(){for(var e=0;e<_stsp.length;e++)window.SS.Tracking.process(_stsp[e]);this.listenToEvent("click",function(e){window.SS.Tracking.checkEventSend("click",e.target,e)}),this.listenToEvent("submit",function(e){window.SS.Tracking.checkEventSend("submit",e.target,e)}),_stsp.push=function(e){window.SS.Tracking.process(e),Array.prototype.push.call(this,e)}},evalEventSent:function(e,t,i){function n(e,t){if(t){var n=t.closest(e.selector);!n.getAttribute("stsp-sequence")&&e.enumerate&&window.SS.Tracking.enumerate(e.selector)}else;if(!e.filter||e.filter(n,i)){var r=window.SS.Tracking.send(e,n,i||!1);e.callback&&e.callback(r,i)}}e.match&&!window.SS.Tracking.matcher(e.match)||(e.delay?setTimeout(function(e){n(e.item,e.target)},e.delay,{item:e,target:t}):n(e,t))},checkEventSend:function(e,t,n){for(var r=0;r<_stsp.length;r++){var i=_stsp[r];if(i.event&&(!i.track||i.track===e)&&(!i.track||i.track===e)){if("submit"===e){if(!(i.selector||i.form&&t.matches(i.form+","+i.selector+" *")))continue;i.selector=i.selector?i.selector:i.form}i.selector&&t.matches(i.selector+","+i.selector+" *")&&("change"===e&&(i.value=t.value),i.form&&"click"===e&&"click"!==i.track||this.evalEventSent(i,t,n))}}},isListening:function(t){return this.eventHandlers.filter(function(e){return e.type===t}).length},listenToEvent:function(e,t,n){if(!this.isListening(e)){var r=(n||document).addEventListener(e,function(e){e.target&&t(e)});this.eventHandlers.push({type:e,handler:r})}},addModule:function(e,t){if(!(-1<this.modules.index.indexOf(e))&&(window.SS.Tracking.modules[e]=t(),this.modules.index.push(e),window.SS.Tracking.modules[e].newEvent))for(var n=0;n<_stsp.length;n++){var r=_stsp[n];window.SS.Tracking.modules[e].newEvent(r)}},modulesFn:function(t,n){Object.keys(window.SS.Tracking.modules).forEach(function(e){"function"==typeof window.SS.Tracking.modules[e][t]&&(0,window.SS.Tracking.modules[e][t])(n)})}},Element.prototype.matches||(Element.prototype.matches=Element.prototype.matchesSelector||Element.prototype.mozMatchesSelector||Element.prototype.msMatchesSelector||Element.prototype.oMatchesSelector||Element.prototype.webkitMatchesSelector||function(e){for(var t=(this.document||this.ownerDocument).querySelectorAll(e),n=t.length;0<=--n&&t.item(n)!==this;);return-1<n}),Element.prototype.closest||(Element.prototype.closest=function(e){var t=this;do{if(t.matches(e))return t;t=t.parentElement||t.parentNode}while(null!==t&&1===t.nodeType);return null}),Object.entries||(Object.entries=function(e){for(var t=Object.keys(e),n=t.length,r=new Array(n);n--;)r[n]=[t[n],e[t[n]]];return r}),"function"!=typeof Object.assign&&Object.defineProperty(Object,"assign",{value:function(e){"use strict";if(null==e)throw new TypeError("Cannot convert undefined or null to object");for(var t=Object(e),n=1;n<arguments.length;n++){var r=arguments[n];if(null!=r)for(var i in r)Object.prototype.hasOwnProperty.call(r,i)&&(t[i]=r[i])}return t},writable:!0,configurable:!0}),window.SS.Tracking.setup(),window.SS.Tracking.addModule("element_in_view",function(){var c=[],e=null;function a(e){if(!e)return!1;var t=e.getBoundingClientRect();return 0<=t.top&&0<=t.left&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&t.right<=(window.innerWidth||document.documentElement.clientWidth)}function n(){for(var e=[],t=0;t<c.length;t++)for(var n=document.documentElement.querySelectorAll(c[t].selector),r=0;r<n.length;r++){var i=n[r],o=a(i);i&&o&&!i.visible?(c[t].persistent||e.push(t),i.visible=!0,window.SS.Tracking.evalEventSent(c[t],i,{event:"elementInViewport"}),i.times_visible++):i&&!o&&!0===i.visible&&(i.visible=!1)}for(t=e.length-1;0<=t;t--)c.splice(e[t],1);s()}var t,r,i=(t=n,function(){null===e&&(e=setTimeout(function(){t(),e=null},r))}),o=!(r=100);function s(){var t=!1;o&&0===c.length?o=!(t="removeEventListener"):!o&&0<c.length&&(t="addEventListener",o=!0),t&&(["scroll","DOMContentLoaded","resize","load"].forEach(function(e){(0,window[t])(e,i)}),n())}return{newEvent:function(e){"element_in_view"===e.track&&(e.times_visible=0,e.visible=!1,c.push(e),s())}}}),window.SS.Tracking.addModule("bubble-fix",function(){var t=100,n=[];var r=null,i=function(e,t){clearTimeout(r),r=setTimeout(e,t)};function o(){n.forEach(function(e){var t,n,r,i=(e.selector?e.selector:e.form)+":not([listenerSet])";document.querySelector(i)&&(t=e,n=document.querySelectorAll(i),r="click",t.form&&(r="submit"),t.track&&(r=t.track),n.forEach(function(t){t.addEventListener(r,function(e){window.SS.Tracking.checkEventSend(r,t,e)})}),document.querySelector(i).setAttribute("listenerSet",!0))})}var c=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver,a=!1;return{newEvent:function(e){e["bubble-fix"]&&(n.push(e),a||(new c(function(){i(o,t)}).observe(document,{attributes:!0,childList:!0,characterData:!0,subtree:!0}),a=!0))}}}),window.SS.Tracking.addModule("request",function(){var r=[],i=!1;function o(t,n){r.forEach(function(e){t.match(e.url_match)&&window.SS.Tracking.evalEventSent(e,!1,n)})}return{newEvent:function(e){"request"===e.track&&e.url_match&&(r.push(e),function(){if(!i){if(i=!0,window.fetch){var e=window.fetch;window.fetch=function(t){return e.apply(this,arguments).then(function(e){try{o(t,e.clone())}catch(e){console.log("error in fetch monkeypatch",e)}return e})}}var t=XMLHttpRequest.prototype.send;if(XMLHttpRequest.prototype.send=function(e){return this.onprogress=function(){o(this.responseURL,this)},t.apply(this,arguments)},navigator&&navigator.sendBeacon){var n=navigator.sendBeacon;navigator.sendBeacon=function(e){return o(e,this),n.apply(this,arguments)}}}}())}}}),function(n){function r(){for(var e=0;e<_stsp.length;e++){var t=_stsp[e];!t.match&&!t.filter||t.form||t.selector||t.track||n.process(t)}}var i;i=window.history,["pushState","replaceState","back","go"].forEach(function(e){var t=i[e];i[e]=function(e){return setTimeout(r,200),t.apply(i,arguments)}})}(window.SS.Tracking),window.SS.Tracking.aet_dl_key="dataLayer",window.SS.Tracking.addModule("datalayer",function(){var n=window.SS.Tracking.aet_dl_key,r=[],i=!1;function o(e){for(var t=0;t<r.length;t++){var n=r[t];n.selector=!0,window.SS.Tracking.evalEventSent(n,null,e)}}return{newEvent:function(e){if("datalayer"===e.track){r.push(e),i||(window.origDatalayer=window[n].push,window[n].push=function(e){return o(e),window.origDatalayer.apply(window[n],arguments)},i=!0);for(var t=0;t<window[n].length;t++)o(window[n][t])}}}});