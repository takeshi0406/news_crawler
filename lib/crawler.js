const Apify = require('apify');
const rp = require('request-promise-native');


module.exports.crawlAllPages = async (urls) => {
    // Prepare a list of URLs to crawl
    const requestList = new Apify.RequestList({
        "sources":
            urls.map(((url) => {
                return {"url": url}
            }))
    });
    await requestList.initialize();

    // Crawl the URLs
    const crawler = new Apify.BasicCrawler({
        requestList,
        handleRequestFunction: async ({ request }) => {
            // 'request' contains an instance of the Request class
            // Here we simply fetch the HTML of the page and store it to a dataset
            await Apify.pushData({
                url: request.url,
                html: await rp(request.url),
            })
        },
    });

    return await crawler.run();
}
