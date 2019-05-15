const rp = require('request-promise');
const cheerio = require('cheerio');
const UrlUtils = require('./urlutils');


module.exports.crawlAllPages = async (urls) => {
    return fetchUrls(urls);
}


const fetchUrls = async (urls) => {
    const promises = urls.map((url) => {
        return (async () => {
            return fetchPage(url).catch(() => new PageResult(url, null, url));
        })();
    });
    return Promise.all(promises);
}


const fetchPage = async (url) => {
    return await rp.get({
        "uri": url,
        "followAllRedirects": true,
        "transform": (body, response, _) => {
            const $ = cheerio.load(body);
            return new PageResult(
                url,
                $('title').text(),
                UrlUtils.removeUtmParams(response.request.uri.href)
                );
        }
    });
}


class PageResult {
    constructor(url, title, redirected_url) {
        this.url = url;
        this.title = title || "[タイトルが取得できませんでした]";
        this.redirected_url = redirected_url;
    }
}
