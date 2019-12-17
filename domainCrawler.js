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
  const domainHostName = new URL(domain).host;
  const urlQueue = [];
  const urlIterator = urlQueue[Symbol.iterator]();
  const pagesVisited = new Set();
  const domainPaths = new Map();

  const isRelativeUrl = (urlToTest) => urlToTest.charAt(0) === '/';

  const updateStateForUrl = (url) => {
    const parsedUrl = new URL(url);
    const urlWithoutParams = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
    if (!domainPaths.has(urlWithoutParams)) {
      domainPaths.set(urlWithoutParams, pathDetails());
    }
    domainPaths.get(urlWithoutParams).mergePathDetails(parsedUrl);
    if (!pagesVisited.has(urlWithoutParams) && parsedUrl.hostname === domainHostName) {
      logger.info(`[domainCrawler][updateStateForUrl] adding ${urlWithoutParams} to queue`);
      urlQueue.push(urlWithoutParams);
    }
  };

  const updateStateForForm = (formDetails) => {
    const fullUrl = isRelativeUrl(formDetails.action) ? `${domain}${formDetails.action}` : formDetails.action;
    if (!domainPaths.has(fullUrl)) {
      domainPaths.set(fullUrl, pathDetails());
    }
    domainPaths.get(fullUrl).mergeFormDetails(formDetails, fullUrl);
  };

  const processSitemapUrls = async () => {
    const urls = await getSitemapUrls(`${domain}/sitemap.xml`);
    urls.forEach((url) => updateStateForUrl(url));
    return urls;
  };

  const extractElementAttributes = (ele) => {
    ele.evaluate((node) => {
      const attributeMap = {};

      node.getAttributeNames()
        .forEach((attr) => {
          attributeMap[attr] = node.getAttribute(attr);
        });
      return attributeMap;
    });
  };

  const extractFormsFromPage = async () => {
    const forms = await page.$$('form');
    return Promise.all(forms.map(async (form) => {
      const formDetails = await extractElementAttributes(form);
      const inputs = await form.$$('input');
      formDetails.inputs = await Promise.all(
        inputs.map((input) => extractElementAttributes(input)),
      );
      return formDetails;
    }));
  };

  const extractDetailsFromUrl = async () => {
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
      const forms = await extractFormsFromPage();
      forms.forEach((form) => updateStateForForm(form));
    } catch (e) {
      logger.error(`error processing page for url ${targetUrl} from page ${e}`);
    }

    return targetUrl;
  };

  return {
    domainPaths,
    crawlDomain: async () => {
      const sitemapResults = await processSitemapUrls();
      logger.info(`found the following sitemap urls: ${JSON.stringify(sitemapResults.size)}`);
      await asyncRepeat(extractDetailsFromUrl);
    },
  };
};

export default domainCrawler;
