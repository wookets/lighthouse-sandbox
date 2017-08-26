
const lighthouse = require('lighthouse');
const chromeLauncher = require('lighthouse/chrome-launcher');
const log = require('lighthouse-logger');

const pages = [
	'ghp|https://www.bestbuy.com',
	//'hottest-deals|https://www.bestbuy.com/site/clp/sale-page/pcmcat185700050011.c?id=pcmcat185700050011'
];

function launchChromeAndRunLighthouse (url, flags = {}, config = null) {
  return chromeLauncher.launch().then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags, config).then(results =>
      chrome.kill().then(() => results));
  });
}

pages.forEach( page => {
	const [name, url] = page.split('|');
	const flags = {
		logLevel: 'info',
		output: 'html',
		outputPath: `./results/${name}.html`
	};
	log.setLevel(flags.logLevel);
	return launchChromeAndRunLighthouse(url, flags).then(results => {
		//console.log(results);
		// Use results!
	});
});
