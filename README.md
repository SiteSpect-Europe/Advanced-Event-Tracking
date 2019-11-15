# Advanced-Event-Tracking
Flexible &amp; Advanced Event Tracking for SiteSpect

This functionality can be used to simple add event tracking to an experiment.

## Basic Usage:

In order to add click tracking to specific elements on the page, you can use the following javascript, which should be added right before the closing body tag (</body>).

```javascript
stspTracker.push({
	'selector':'button.lead-form__submit.btn--primary',
	'event':'clickOnMainCTA'
});
```

When the element is clicked, a request will be made to: /__ssobj/track?event=clickOnMainCTA


## Enumeration
If there are multiple elements that match the selector, you can enable enumeration to identify the elements sequence, as follows:

```javascript
stspTracker.push({
	'selector':'h2',
	'event':'header2Click',
	enumerate: true
});
```

When the element is clicked, a request will be made to: /__ssobj/track?event=header2Click&sequence=1


# Additional attributes
You can simply add multiple attributes by simply adding them as follows:

```javascript
stspTracker.push({
	'selector':'h2',
	'event':'header2Click',
	'some-attribute': 'some-value'
});
```

When the element is clicked, a request will be made to: /__ssobj/track?event=header2Click&some-attribute=some-value

# Dynamic Attributes
It is possible to use dynamic values in these attributes, in two ways:

By referencing a variable

```javascript
stspTracker.push({
	'selector':'h2',
	'event':'header2Click',
	'domain': document.location.hostname
});
```

When the element is clicked, a request will be made to: /__ssobj/track?domain=www.drivek.it&event=header2Click&

Or by adding a callback function

```javascript
stspTracker.push({
	'selector':'h2',
	'event':'header2Click',
	'test': function(element){
		return Math.floor(Math.random() * 99999999);
	}
});
```

When the element is clicked, a request will be made to: /__ssobj/track?event=header2Click&test=34141182


