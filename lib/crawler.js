'use strict';

const rp = require('request-promise').defaults({maxRedirects: 20});
const cheerio = require('cheerio');
const UrlUtils = require('./urlutils');
const jschardet = require('jschardet');
const iconv = require("iconv-lite");
const pdf = require('pdf-parse');

const USER_AGENTS = [
    'news-crawler-bot',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0',
    'news-crawler-bot',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0'
]


module.exports.crawlAllPages = async (urls) => {
    let result = [];
    for (let each_urls of eachSlice(urls, 10)) {
        result.push(await fetchUrls(each_urls));
    }
    return result.reduce((acc, val) => acc.concat(val), []);
}


const eachSlice = (arr, num)  => {
    let result = [];
    for (let i = 0; i < arr.length; i += num) {
        result.push(arr.slice(i, i + num));
    }
    return result;
}


const fetchUrls = async (urls) => {
    const promises = urls.map((url) => {
        return (async () => {
            return await fetchPage(url);
        })();
    });
    return await Promise.all(promises);
}


const fetchPage = async (url) => {
    console.log(`fetch ${url}`);
    let result = new CrawlerResult(url, null, url);
    let response;
    for (let ua of USER_AGENTS) {
        response = await _fetch(url, ua);
        if (!response.isOk()) continue;
        result = await response.fetchTitle();
        if (result.isOk()) return result;
    }
    return result;
}


const encodeDetectedCharCode = (body) => {
    const enc = jschardet.detect(body);
    // amazonの場合は不正なユーザーエージェントの場合はバイナリが返ってくる
    if (!enc.encoding) {
        return null;
    }
    return iconv.decode(
        body,
        enc.encoding
    );
}

const _fetch = async (url, ua) => {
    return await rp.get({
        "uri": url,
        "followAllRedirects": true,
        "encoding": null,
        "transform": (body, response, _) => {
            const red_url = UrlUtils.regularize(response.request.uri.href);
            return new PageResult(
                url,
                body,
                red_url
                );
        },
        "headers": {
            'User-Agent': ua
        },
        "timeout": 20000
    }).catch(error => {
        console.error(error);
        // リトライ処理とロギング
        return new ErrorPageResult(url);
    });
}


const parseHtmlTitle = (body) => {
    // TODO:: parse pdf
    const sbody = encodeDetectedCharCode(body);
    if (!sbody) {
        return null;
    }
    const $ = cheerio.load(sbody);
    const title = $('head > title').text().trim().replace(/\s+/g, " ").replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
    return title.length > 1 ? title : null;
}


const parsePdfTitle = async (body) => {
    const data = await pdf(body);
    const metadata = data.metadata;
    if (!metadata) {
        return null;
    }
    return metadata._metadata["dc:title"];
}


class PageResult {
    constructor(url, body, redirected_url) {
        this.url = url;
        this.body = body;
        this.redirected_url = redirected_url;
    }

    async fetchTitle() {
        return new CrawlerResult(
            this.url,
            UrlUtils.isPdf(this.redirected_url) ? await parsePdfTitle(this.body) : parseHtmlTitle(this.body),
            this.redirected_url
        );
    }

    isOk() {
        return true;
    }
}


class ErrorPageResult {
    constructor(url) {
        this.url = url;
    }

    async fetchTitle() {
        return new CrawlerResult(this.url, null, this.url);
    }

    isOk() {
        return false;
    }
}

class CrawlerResult {
    constructor(url, title, redirected_url) {
        this.url = url;
        this.title = title;
        this.redirected_url = redirected_url;
    }

    isOk() {
        return !!this.title;
    }
}
