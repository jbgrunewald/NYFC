import Deque from 'collections/deque';
import getSitemapUrls from './sitemap/getSitemapUrls';

export default class DomainDetails {
  constructor(domain) {
    this.domain = domain;
    this.queue = new Deque();
    this.visited = new Set();
    this.sitemapUrls = getSitemapUrls(`https://${domain}/sitemap.xml`);
  }
}
