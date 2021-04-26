/** 
 * This file will run after source has been compressed & uglified to /tracking.ugly.js
 * Here we add a comment with the correct version number and copyright
 * 
 * usage:
 * node _/deploy.js tracking.js
*/
const fs = require('fs');

const targetFile = process.argv[2]; // should be a 2nd param

const packageJson = require('./../package.json');
const currentYear = new Date().getFullYear();

const comment = `/**
* SiteSpect Advanced Event Tracking
* Copyright ${currentYear}, SiteSpect Europe. All Rights Reserved.
* V${packageJson.version}
*/`

const uglySource = './tracking.ugly.js';

const usource = fs.readFileSync(uglySource, 'utf8')

const newSource = `${comment}
${usource.replace('%dev_version%', packageJson.version)}`

fs.writeFileSync(targetFile, newSource);

fs.unlinkSync(uglySource);