import getSitemapUrls from './sitemap/getSitemapUrls';
import pathDetails from './pathDetails';
import { asyncRepeat } from './repeat';
import logger from './logger';

/**
 * This is the main entry point for crawling a domain
 * and aggregating the data we retrieve.
 * @param {Object} config
 * @param {Object} config.page the puppeteer page object
 * @param {string} config.domain
 */
const domainCrawler = (config) => {
  const { page, domain } = config;
  const urlQueue = [];
  const urlIterator = urlQueue[Symbol.iterator]();
  const pagesVisited = new Set();
  const domainPaths = {};

  const updateStateForUrl = (url) => {
    const parsedUrl = new URL(url);
    const urlWithoutParams = `${parsedUrl.protocol}${parsedUrl.host}${parsedUrl.path}`;
    if (domainPaths[urlWithoutParams]) {
      domainPaths[urlWithoutParams].mergePathDetails(parsedUrl);
    } else {
      domainPaths[urlWithoutParams] = pathDetails({ url: parsedUrl });
    }
    if (!pagesVisited.has(urlWithoutParams) && parsedUrl.hostname.includes(domain)) {
      urlQueue.push(urlWithoutParams);
    }
  };

  const processSitemapUrls = async () => {
    const urls = await getSitemapUrls(domain);
    urls.forEach((url) => updateStateForUrl(url));
  };

  const extractLinksFromUrl = async () => {
    const targetUrl = urlIterator.next().value;
    if (targetUrl === undefined) return targetUrl;
    try {
      logger.info(`processing ${targetUrl}`);
      pagesVisited.add(targetUrl);
      const referrer = domain;
      await page.goto(targetUrl, { referrer, waitUntil: ['load', 'networkidle0'] });
      const elements = await page.$$('a');
      const urls = await Promise.all(
        elements.map(async (ele) => page.evaluate((elem) => elem.href, ele)),
      );
      urls
        .filter((url) => url !== '')
        .forEach((url) => updateStateForUrl(url));
    } catch (e) {
      logger.error(`error processing page for url ${targetUrl} from page ${e}`);
    }

    return targetUrl;
  };

  return {
    domainPaths,
    crawlDomain: async () => {
      await processSitemapUrls();
      await asyncRepeat(extractLinksFromUrl);
    },
  };
};

export default domainCrawler;
