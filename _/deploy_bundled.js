/** 
 * This file will run after source has been compressed & uglified to /tracking.ugly.js
 * Here we add a comment with the correct version number and copyright
*/
const fs = require('fs');
var UglifyJS = require("uglify-js");

const targetFile = 'dist/aet.combined.js';

const includedModules = [
	'element-in-view',
	'bubble-fix',
	'request-listener',
	'spa-adapter',
	'datalayer',
]

const files = [
	'tracking.js', 
]

includedModules.forEach(module => {
	files.push('optional_modules/'+module+'.js');
})

const packageJson = require('./../package.json');
const currentYear = new Date().getFullYear();

const comment = `/**
* SiteSpect Advanced Event Tracking
* Copyright ${currentYear}, SiteSpect Europe. All Rights Reserved.
* V${packageJson.version}
*
* Included modules: ${includedModules.join(',')}
*/`


var combinedCode = ''

function createCombined(){
	files.forEach(file => {
		const code = fs.readFileSync(file, 'utf8')
		combinedCode = combinedCode + code
	})
}

createCombined();

function UglifySource(){
	var usource = UglifyJS.minify(combinedCode.replace('%dev_version%', packageJson.version));
	if(usource.error){
		console.error(usource.error)
		return;
	}
	const newSource = `${comment}
${usource.code}`
	fs.writeFileSync(targetFile, newSource);
}

UglifySource()