import runCrawl from '../runCrawl';

const program = require('commander');

const validateDomain = (domain) => (domain.includes('http') ? domain : `https://${domain}`);

program.version('0.0.0');

program
  .requiredOption('-t, --target <string>', 'the target domain to crawl', validateDomain);

program.parse(process.argv);

runCrawl(program.target);
