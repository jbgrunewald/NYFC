import fs from 'fs';
import path from 'path';
import request from 'request';
import getSitemapUrls from './getSitemapUrls';
import expectedUrlsFromXmlSitemap from './testData/expectedUrlsFromXmlSitemap';

jest.mock('request');

describe('#siteMapParser', () => {
  it('should extract urls from xml sitemap', async () => {
    const filePath = path.join(__dirname, 'testData', 'exampleXmlSitemap.xml');
    request.mockReturnValue(fs.createReadStream(filePath));
    const result = await getSitemapUrls('www.starbucks.co.jp');
    expect(result).toEqual(expect.arrayContaining(expectedUrlsFromXmlSitemap));
  });
});
