import request from 'request';
import XmlStream from 'xml-stream';

/**
 * Try to retrieve a sitemap and extract the urls
 * @param {String} url the url for the sitemap
 */
const getSitemapUrls = async (url) => {
  const urls = new Set();
  const req = request(url);
  const parser = new XmlStream(req);
  parser.on('endElement: url', (data) => {
    // check if the url is another sitemap
    urls.add(data.loc);
  });

  await new Promise((res) => parser.on('end', res));

  return urls;
};

export default getSitemapUrls;
