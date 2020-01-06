import puppeteer from 'puppeteer';
import pidusage from 'pidusage';
import getSitemapUrls from './sitemap/getSitemapUrls';
import pathDetails from './pathDetails';
import { sleep } from './repeat';
import logger from './logger';

const checkMemoryConsumption = (pid) => {
  const used = process.memoryUsage();
  Object.entries(used).forEach((entry) => {
    const [key, value] = entry;
    logger.info(`[${key}]: ${Math.round(value / 1024 / 1024 * 100) / 100} MB`);
  });

  pidusage(pid, (err, stats) => logger.info(`puppeteer is using ${JSON.stringify(stats)}`));
};

/**
 * This is the main entry point for crawling a domain
 * and aggregating the data we retrieve.
 * @param {Object} config
 * @param {Object} config.page the puppeteer page object
 * @param {string} config.domain
 */
const domainCrawler = async (config) => {
  const browser = await puppeteer.launch({ headless: true });
  const { domain = '', pageLimit = 1 } = config;
  const domainHostName = new URL(domain).host;
  const urlQueue = [];
  const pagesVisited = new Set();
  const domainPaths = new Map();

  const isRelativeUrl = (urlToTest) => urlToTest.charAt(0) === '/';

  const updateStateForUrl = (url) => {
    const parsedUrl = new URL(url);
    const urlWithoutParams = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
    if (parsedUrl.hostname === domainHostName) {
      if (!domainPaths.has(urlWithoutParams)) {
        domainPaths.set(urlWithoutParams, pathDetails());
      }
      domainPaths.get(urlWithoutParams).mergePathDetails(parsedUrl);

      if (!pagesVisited.has(urlWithoutParams)) {
        logger.info(`[domainCrawler][updateStateForUrl] adding ${urlWithoutParams} to queue`);
        urlQueue.push(urlWithoutParams);
      }
    }
  };

  const updateStateForForm = (formDetails, targetUrl) => {
    try {
      let fullUrl = targetUrl;
      if (formDetails.action) {
        fullUrl = isRelativeUrl(formDetails.action) ? `${domain}${formDetails.action}` : formDetails.action;
      }
      if (!domainPaths.has(fullUrl)) {
        domainPaths.set(fullUrl, pathDetails());
      }
      domainPaths.get(fullUrl).mergeFormDetails(formDetails, fullUrl);
    } catch (e) {
      logger.error(`[domainCrawler][updateStateForForm] unable to process form details ${JSON.stringify(formDetails)}: ${e.message} ${e.stack}`);
    }
  };

  const processSitemapUrls = async () => {
    const urls = await getSitemapUrls(`${domain}/sitemap.xml`);
    urls.forEach((url) => updateStateForUrl(url));
    return urls;
  };

  const extractElementAttributes = (ele) => ele.evaluate((node) => {
    const attributeMap = {};

    node.getAttributeNames()
      .forEach((attr) => {
        attributeMap[attr] = node.getAttribute(attr);
      });
    return attributeMap;
  });

  const extractFormsFromPage = async (page) => {
    const forms = await page.$$('form');
    return Promise.all(forms.map(async (form) => {
      const formDetails = await extractElementAttributes(form);
      const inputs = await form.$$('input');
      formDetails.inputs = await Promise.all(
        inputs.map((input) => extractElementAttributes(input)),
      );gi
      return formDetails;
    }));
  };

  const extractDetailsFromUrl = async (page) => {
    const targetUrl = urlQueue.pop();
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
      logger.info(`processing ${targetUrl} the queue currently has ${urlQueue.length} urls remaining`);
      pagesVisited.add(targetUrl);
      const referrer = domain;
      await page.goto(targetUrl, {
        referrer,
        waitUntil: ['networkidle0'],
        timeout: 60000,
      });
      const elements = await page.$$('a');
      const urls = await Promise.all(
        elements.map(async (ele) => page.evaluate((elem) => elem.href, ele)),
      );
      urls
        .filter((url) => url !== '')
        .forEach((url) => updateStateForUrl(url));
      const forms = await extractFormsFromPage(page);
      forms.forEach((form) => updateStateForForm(form, targetUrl));
    } catch (e) {
      logger.error(`error processing page for url ${targetUrl}: ${e.message} ${e.stack}`);
    }
    await page.close();
  };

  return {
    crawlDomain: async () => {
      updateStateForUrl(domain);
      const sitemapResults = await processSitemapUrls();
      logger.info(`found the following sitemap urls: ${JSON.stringify(sitemapResults.size)}`);
      const promises = [];

      while (urlQueue.length !== 0) {
        // eslint-disable-next-line no-await-in-loop
        const openPages = await browser.pages();
        logger.info(`there are currently ${openPages.length} open`);
        if (openPages.length >= pageLimit) {
          checkMemoryConsumption(browser.process().pid);
          // eslint-disable-next-line no-await-in-loop
          await sleep(1000);
        } else {
          // eslint-disable-next-line no-await-in-loop
          const page = await browser.newPage();
          promises.push(extractDetailsFromUrl(page));
        }
      }

      await Promise.all(promises);
      browser.close();
      return Array.from(domainPaths.values());
    },
  };
};

export default domainCrawler;
