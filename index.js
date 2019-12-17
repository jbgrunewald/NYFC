import puppeteer from 'puppeteer';
import logger from './logger';
import domainCrawler from './domainCrawler';

const rootDomain = 'https://www.google.com';

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
  const browser = await puppeteer.launch({ headless: false, slowMo: 250 });
  logger.info(`starting crawl for domain ${rootDomain}`);
  const page = await browser.newPage();
  const crawler = domainCrawler({ page, domain: rootDomain });
  await crawler.crawlDomain();
  crawler.domainPaths.values().forEach((value) => console.log(JSON.stringify(value)));
  logger.info(`crawl completed for the domain ${rootDomain}`);
  // Here's where we'll want to put them into a queue
})();
