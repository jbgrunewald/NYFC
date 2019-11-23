import request from 'request';
import XmlStream from 'xml-stream';

const extractXmlSitemap = async (fileLoader, domain) => {
  const urls = [];
  const req = fileLoader(`${domain}/sitemap.xml`);
  const parser = new XmlStream(req);
  parser.on('endElement: url', (data) => {
    urls.push(data.loc);
  });

  await new Promise((res) => parser.on('end', res));
  return urls;
};

const extractTextSitemap = (fileLoader, domain) => {

};

/**
 * Try to retrieve a sitemap and extract the urls
 * @param {String} domain the domain to check for a sitemap
 * @param {Object} options
 * @param {Object} options.loader an alternative tool for loading the sitemap
 */
const getSitemapUrls = async (domain, options) => {
  const loader = options.loader || request;
  const urls = await extractXmlSitemap(loader, domain);

  if (urls.length === 0) {
    return extractTextSitemap(loader, domain);
  }

  return urls;
};

export default getSitemapUrls;
