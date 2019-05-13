const rp = require('request-promise');
const cheerio = require('cheerio');


module.exports.crawlAllPages = async (urls) => {
    return fetchUrls(urls);
}


const fetchUrls = async (urls) => {
    const promises = urls.map((url) => {
        return (async () => {
            return await rp.get({
                "uri": url,
                "followAllRedirects": true,
                "transform": (body, response, _) => {
                    const $ = cheerio.load(body);
                    return new PageResult(url, $('title').text(), response.request.uri.href);
                }
            });
        })();
    });
    return Promise.all(promises);
}


class PageResult {
    constructor(url, title, redirected_url) {
        this.url = url;
        this.title = title;
        this.redirected_url = redirected_url;
    }
}