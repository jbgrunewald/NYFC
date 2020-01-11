import puppeteer from 'puppeteer';
import logger from './logger';
import domainCrawler from './domainCrawler';

/**
 * The function will crawl the domain and store all information for
 * paths found on that domain.
 * @param {string} rootDomain the full root domain, including the protocal
 * @return {Promise<void>}
 */
const runCrawl = async (rootDomain) => {
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
};

export default runCrawl;
