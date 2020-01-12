import logger from './logger';
import domainCrawler from './domainCrawler';

/**
 * The function will crawl the domain and store all information for
 * paths found on that domain. This CLI tool uses argv to get a fully
 * formed URL, ex. https://www.google.com
 */
(async () => {
  const rootDomain = process.argv[2];
  logger.info(`starting crawl for domain ${rootDomain}`);
  const crawler = await domainCrawler({ domain: rootDomain });
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
})();
