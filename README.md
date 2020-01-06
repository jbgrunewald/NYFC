# Not Your Friendly Crawler
An open source tool for crawling all websites using puppeteer. The purpose of using
puppeteer is to have a single tool that will work for both traditional and more
modern single page web applications.

## Problem as We See It
The current web crawlers available are geared towards traditional websites and for the
purposes of scraping data from mostly static web pages. This has certain implications we
built this tool specifically to work around. We don't assume static content and we
intentionally avoid honoring the robot.txt file. This is intended as a penetration testing
tool and attackers aren't going to honor those rules either. We also like packaging this as
an NPM package the can be consumed in code, or as a CLI tool. This gives the best flexibility
for using the results of this tool.

## Disclaimer
It needs to be mentioned that this tool is intentionally built with a focus towards
pentesting and thus does not honor all the traditional rules put in place on the net
for web crawlers. If you do not have the permission from the site you use this crawler on
you may be violating use agreements or perhaps even the law. We give no explicit guarantees
or assurances about when this tool may be used.

## Goals
- Build a universal tool for crawling all manner of websites (including modern web applications)
- Build a tool specifically geared toward route and api discovery
- Build a tool useful to the pentesting community

## Getting Started

Clone the repo and run NPM install. There's not much to it at the moment.

### Prerequisites

The project is built with Node.js LTS 10 and you will need to have an appropriate version Node.js installed to run.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/jbgrunewald/NYFC/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/jbgrunewald/NYFC/tags). 

## Authors

* **James Grunewald** 

See also the list of [contributors](https://github.com/jbgrunewald/NYFC/contributors) who participated in this project.

## License

This project is licensed under the  AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details
