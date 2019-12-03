import fs from 'fs';
import path from 'path';
import request from 'request';
import getSitemapUrls from './getSitemapUrls';
import expectedUrlsFromXmlSitemap from './testData/expectedUrlsFromXmlSitemap';
import expectedUrlsFromXmlNestedSitemap from './testData/expectedUrlsFromXmlNestedSitemap';

jest.mock('request');

describe('#siteMapParser', () => {
  it('should extract urls from xml sitemap', async () => {
    const filePath = path.join(__dirname, 'testData', 'exampleXmlSitemap.xml');
    request.mockReturnValue(fs.createReadStream(filePath));
    const result = await getSitemapUrls('www.starbucks.co.jp');
    expect(Array.from(result)).toEqual(expect.arrayContaining(expectedUrlsFromXmlSitemap));
  });

  it('handles nested sitemaps', async () => {
    request.mockReturnValueOnce(fs.createReadStream(path.join(__dirname, 'testData', 'exampleXmlNestedSitemap.xml')));
    request.mockReturnValueOnce(fs.createReadStream(path.join(__dirname, 'testData', 'exampleXmlNestedSitemap1.xml')));
    const result = await getSitemapUrls('www.starbucks.co.jp');
    expect(Array.from(result)).toEqual(expect.arrayContaining(expectedUrlsFromXmlNestedSitemap));
  });
});
