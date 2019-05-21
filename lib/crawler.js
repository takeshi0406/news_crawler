const rp = require('request-promise');
const cheerio = require('cheerio');
const UrlUtils = require('./urlutils');


module.exports.crawlAllPages = async (urls) => {
    return fetchUrls(urls);
}


const fetchUrls = async (urls) => {
    const promises = urls.map((url) => {
        return (async () => {
            return await fetchPage(url);
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
                $('title').text().trim().replace(/\s+/g, " ").replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
                    return String.fromCharCode(s.charCodeAt(0) - 65248);
                }),
                UrlUtils.removeUtmParams(response.request.uri.href)
                );
        },
        "headers": {
            'User-Agent': 'Node-Crawler'
        }
    }).catch(_ => {
        // リトライ処理とロギング
        return new PageResult(url, null, url);
    });
}


class PageResult {
    constructor(url, title, redirected_url) {
        this.url = url;
        this.title = title;
        this.redirected_url = redirected_url;
    }
}
