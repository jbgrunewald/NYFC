import request from 'request';
import XmlStream from 'xml-stream';
import logger from '../logger';
/**
 * Try to retrieve a sitemap and extract the urls
 * Works on nested sitemaps
 *
 * @param {string} url the url for the sitemap
 * @param {Set<string>} urlSet used to track urls found and for recursive calls
 * @return {Set<string>} all urls found from the sitemap
 */
const getSitemapUrls = async (url, urlSet = new Set()) => {
  logger.info(`getting sitemap urls for ${url}, currently found ${urlSet.size} urls`);
  const promises = [];
  const response = request(url);
  const parser = new XmlStream(response);
  parser.on('endElement: url', (data) => {
    const { loc: siteUrl } = data;
    if (siteUrl) {
      urlSet.add(siteUrl);
    }
  });

  parser.on('endElement: sitemap', async (data) => {
    const { loc: siteUrl } = data;
    if (siteUrl) {
      promises.push(getSitemapUrls(siteUrl, urlSet));
    }
  });

  await new Promise((res) => parser.on('end', res));
  await Promise.all(promises);

  return urlSet;
};

export default getSitemapUrls;
