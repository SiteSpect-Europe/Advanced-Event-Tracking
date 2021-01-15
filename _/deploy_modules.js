/** 
 * This file will run after source has been compressed & uglified to /tracking.ugly.js
 * Here we add a comment with the correct version number and copyright
*/
const fs = require('fs');
var UglifyJS = require("uglify-js");


const packageJson = require('./../package.json');
const currentYear = new Date().getFullYear();

const comment = `/**
* SiteSpect Advanced Event Tracking
* Copyright ${currentYear}, SiteSpect Europe. All Rights Reserved.
* V${packageJson.version}
*/`

fs.readdir('./optional_modules', function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
		console.log(file); 
		var path = './optional_modules/'+file;
		const code = fs.readFileSync(path, 'utf8')
		var usource = UglifyJS.minify(code);
		const targetFile = './dist/modules/tracking.module.'+file.replace('.js', '.min.js').replace(/-/gm, '_');
		if(usource.error){
			console.error('Error compiling:', file);
			console.error(usource.error)
			return;
		}
		const newSource = `${comment}
${usource.code}`
		fs.writeFileSync(targetFile, newSource);
    });
});

// function UglifySource(){
// 	var usource = UglifyJS.minify(combinedCode);
// 	if(usource.error){
// 		console.error(usource.error)
// 		return;
// 	}
// 	const newSource = `${comment}
// ${usource.code}`
// 	fs.writeFileSync(targetFile, newSource);
// }

// UglifySource()