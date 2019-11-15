# Advanced-Event-Tracking
Flexible &amp; Advanced Event Tracking for SiteSpect

This functionality can be used to simple add event tracking to an experiment.

## Basic Usage:

In order to add click tracking to specific elements on the page, you can use the following javascript, which should be added right before the closing body tag (</body>).

```javascript
var _stsp = _stsp || [];
_stsp.push({
	'selector':'button.btn--primary',
	'event':'clickOnMainCTA'
});
```

When the element is clicked, a request will be made to: `/__ssobj/track?event=clickOnMainCTA`


## Enumeration
If there are multiple elements that match the selector, you can enable enumeration to identify the elements sequence, as follows:

```javascript
var _stsp = _stsp || [];
_stsp.push({
	'selector':'h2',
	'event':'header2Click',
	'enumerate': true
});
```

When the element is clicked, a request will be made to: `/__ssobj/track?event=header2Click&sequence=1`


# Additional attributes
You can simply add multiple attributes by simply adding them as follows:

```javascript
var _stsp = _stsp || [];
_stsp.push({
	'selector':'h2',
	'event':'header2Click',
	'some-attribute': 'some-value'
});
```

When the element is clicked, a request will be made to: `/__ssobj/track?event=header2Click&some-attribute=some-value`

# Dynamic Attributes
It is possible to use dynamic values in these attributes, in two ways:

By referencing a variable

```javascript
var _stsp = _stsp || [];
_stsp.push({
	'selector':'h2',
	'event':'header2Click',
	'domain': document.location.hostname
});
```

When the element is clicked, a request will be made to: `/__ssobj/track?domain=www.drivek.it&event=header2Click`

Or by adding a callback function

```javascript
var _stsp = _stsp || [];
_stsp.push({
	'selector':'h2',
	'event':'header2Click',
	'test': function(element){
		return Math.floor(Math.random() * 99999999);
	}
});
```

When the element is clicked, a request will be made to: `/__ssobj/track?event=header2Click&test=34141182`

## Matching
Using matching it's possible to filter when an event should be sent. You can use the cookie, and from the document.locaiton object you can use hostname, pathname, href, hash & search.

```javascript
var _stsp = _stsp || [];
_stsp.push({
	'selector':'h2',
	'event':'header2Click',
	'match': {
		hostname: '\.(nl|be)$'
	}
});
```

When the element is clicked, a request will be made to: `/__ssobj/track?event=header2Click&test=34141182`, but only when the current hostname matches the regular expression

## Filtering
You can provide an optional callback to filter events. When this function return true, the event will be sent.

```javascript
var _stsp = _stsp || [];
_stsp.push({
	'selector':'h3',
	'event':'header3-Click',
	'filter': function(element){
		return Math.floor(Math.random() * 100) > 50;
	}
});
```

When the element is clicked, a request will be made to: `/__ssobj/track?event=header2Click&test=34141182`, but only in 50% of the cases, since the function is using a random method.

## Direct Send
For convencience, we have added a method to immediately send an event. Filters are not allowed here.

```javascript
var _stsp = _stsp || [];
_stsp.push({
	'event':'sendImmediatly'
});

When the element is clicked, a request will be made to: `/__ssobj/track?event=sendImmediatly`

