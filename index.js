
const lighthouse = require('lighthouse');
const chromeLauncher = require('lighthouse/chrome-launcher');
const log = require('lighthouse-logger');
const ReportGeneratorV2 = require('lighthouse/lighthouse-core/report/v2/report-generator');
const fs = require('fs');

const pages = [
	'homepage|https://www.bestbuy.com',
	'hottest-deals|https://www.bestbuy.com/site/clp/sale-page/pcmcat185700050011.c?id=pcmcat185700050011',
	'brands|https://www.bestbuy.com/site/electronics/brands/pcmcat128500050004.c?id=pcmcat128500050004',
	'brand-apple|https://www.bestbuy.com/site/brands/apple/pcmcat128500050005.c?id=pcmcat128500050005',
	'brand-samsung|https://www.bestbuy.com/site/brands/samsung-store/pcmcat140800050115.c?id=pcmcat140800050115',
	'brand-sony|https://www.bestbuy.com/site/brands/sony-store/cat15063.c?id=cat15063',
	'brand-microsoft|https://www.bestbuy.com/site/brands/microsoft/pcmcat135300050050.c?id=pcmcat135300050050',
	'brand-intel|https://www.bestbuy.com/site/brands/intel/pcmcat161100050004.c?id=pcmcat161100050004',
	'brand-magnolia|https://www.bestbuy.com/site/electronics/magnolia-home-theater/pcmcat139900050002.c?id=pcmcat139900050002',
	'brand-pacific-sales|https://www.bestbuy.com/site/brands/pacific-sales/pcmcat249300050012.c?id=pcmcat249300050012',
	'deal-of-the-day|https://www.bestbuy.com/site/misc/deal-of-the-day/pcmcat248000050016.c?id=pcmcat248000050016',
	'samsung-note8|https://www.bestbuy.com/site/samsung-store/samsung-note8/pcmcat1502135522036.c?id=pcmcat1502135522036',
	'gift-ideas|https://www.bestbuy.com/site/electronics/gift-ideas/abcat0010000.c?id=abcat0010000',
	'google-home|https://www.bestbuy.com/site/google/google-home/pcmcat748302047037.c?id=pcmcat748302047037',
	'student-hub|https://www.bestbuy.com/site/misc/back-to-school/pcmcat334100050000.c?id=pcmcat334100050000',
	'easy-replenish|https://www.bestbuy.com/site/clp/easy-replenish-ink/pcmcat1490655105296.c?id=pcmcat1490655105296',
	'garage-tech|https://www.bestbuy.com/site/home/garage/pcmcat1491248908587.c?id=pcmcat1491248908587',
	'price-match-guarentee|https://www.bestbuy.com/site/customer-service/price-match-guarantee/pcmcat290300050002.c?id=pcmcat290300050002'
];

function launchChromeAndRunLighthouse (url, flags = {}, config = null) {
  return chromeLauncher.launch().then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags, config).then(results =>
      chrome.kill().then(() => results));
  });
}

function audit (page) {
	const [name, url] = page.split('|');
	const flags = {
		logLevel: 'info'
	};
	log.setLevel(flags.logLevel);
	return launchChromeAndRunLighthouse(url, flags).then(results => {
		const html = new ReportGeneratorV2().generateReportHtml(results);
		fs.writeFileSync(`./results/${name}.html`, html);
	});
}

/*
 * promiseSerial resolves Promises sequentially.
 * const urls = ['/url1', '/url2', '/url3']
 * const funcs = urls.map(url => () => $.ajax(url))
 * promiseSerial(funcs).then(...)
 */
function promiseSerial (funcs) {
	return funcs.reduce((promise, func) => promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))
}

const audits = pages.map(page => () => audit(page)); // wrap every call in a function, so it is delayed

promiseSerial(audits).then( () => {
	console.log('all done');
})