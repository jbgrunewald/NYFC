import puppeteer from 'puppeteer';
import logger from './logger';
import domainCrawler from './domainCrawler';

const rootDomain = 'https://www.google.com/';

// TODO deploy this on cloud functions
/**
 * This function will accept a config and a domain to crawl.
 * We will first extract the urls for the domain from the sitemap
 * if possible. Then we will visit each page and extract the href
 * from any anchor <a> tags found, and the data for any forms found
 * on the page. Later we may decide to observe requests from the pages
 * as well.
 *
 * For each request path we find within the domain, we will save an object
 * containing details about inputs, query parameters, request methods, and
 * any other pertinent details. Once all pages discovered for a domain have
 * been visited, we will publish each path for further evaluation/testing.
 */
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  logger.info(`starting crawl for domain ${rootDomain}`);
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
  const crawler = domainCrawler({ page, domain: rootDomain });
  const startTime = Date.now();
  const pathsFound = await crawler.crawlDomain();
  logger.info(`we found ${pathsFound.length} paths for the domain ${rootDomain}`);
  const filteredPaths = pathsFound.filter((path) => {
    const { formInputs, paramsMap } = path.getDetails();
    return formInputs.length || paramsMap.size;
  });
  logger.info(`we found ${filteredPaths.length} potential attacks paths for the domain ${rootDomain}`);
  const endTime = Date.now();
  const elapsedTime = (endTime - startTime) / 1000;
  logger.info(`crawl completed for the domain ${rootDomain} and took ${elapsedTime} seconds`);
  browser.close();
  // Here's where we'll want to put them into a queue
})();
