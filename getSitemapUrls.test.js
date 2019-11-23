import fs from 'fs';
import path from 'path';
import getSitemapUrls from './getSitemapUrls';
import expectedUrlsFromXmlSitemap from './testData/expectedUrlsFromXmlSitemap';

const mockLoader = (filePath) => () => fs.createReadStream(filePath);

describe('#siteMapParser', () => {
  it('should extract urls from xml sitemap', async () => {
    const result = await getSitemapUrls('testDomain', { loader: mockLoader(path.join(__dirname, 'testData', 'exampleXmlSitemap.xml')) });
    expect(result).toEqual(expectedUrlsFromXmlSitemap);
  });
});
