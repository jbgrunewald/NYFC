import puppeteer from 'puppeteer';
import Deque from 'collections/deque';
import brandConfig from './brandConfig';

const rootDomain = 'starbucks.com';
const pagesVisited = new Set();
const queue = new Deque();

const crawlPages = () => {

};

/**
 * Adds the valid domains from the config and domains found in the sitemap.
 * @param {Array} domains a array of domains to crawl.
 */
const setup = async (domains) => {
  await Promise.all(domains.map(async (domain) => {
    // try to get a sitemap
    // parse the sitemap
    // add the domains to the queue
  }));
};

// TODO deploy this on cloud functions
/**
 * This function will take a companies config as input with a
 * set of options and domains and a config. The config will contain
 * specific details about the website and login credentials if needed.
 * The options will communicate any necessary differences for this to operate.
 */
(async () => {
  // TODO make this take the input to seed the breadth first search for URLS
  // Add the sitemap url as the first attempt
  await setup(brandConfig.domains);

  const browser = await puppeteer.launch({ headless: false, slowMo: 250 });
  const page = await browser.newPage();
  const referrer = '';

  while (queue.length > 0) {
    try {
      const targetUrl = queue.pop();
      console.log(`processing ${targetUrl}`);
      pagesVisited.add(targetUrl);
      // eslint-disable-next-line no-await-in-loop
      await page.goto(targetUrl, { referrer, waitUntil: ['load', 'networkidle0'] });
      const elements = await page.$$('a');
      const urls = await Promise.all(elements.map(async (ele) => page.evaluate((elem) => elem.href, ele)));
      // publish urls found to a pub/sub queue to be picked up and processed
      // Before publishing we should group urls together to get information about each page
      const parsedUrls = urls.filter((url) => url !== '').map((url) => new URL(url));
      parsedUrls.forEach((pUrl) => {
        const urlWithNoParms = `${pUrl.protocol}//${pUrl.hostname}${pUrl.pathname}`;
        if (!pagesVisited.has(urlWithNoParms) && pUrl.hostname.includes(rootDomain)) {
          queue.push(urlWithNoParms);
        }
        // Do some other processing on the urls for threat evaluation
      });
    } catch (e) {
      console.log(e);
    }
  }
  console.log(pagesVisited);
  // Make sure we can handle sitemaps
})();
