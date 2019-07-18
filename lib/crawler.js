'use strict';

const rp = require('request-promise');
const cheerio = require('cheerio');
const UrlUtils = require('./urlutils');
const jschardet = require('jschardet');
const iconv = require("iconv-lite");


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
    let response = await _fetch(url, 'news-crawler-bot');
    if (response.isOk()) return response;
    response = await _fetch(url, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0');
    if (response.isOk()) return response;
    response = await _fetch(url, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0');
    return response;
}


const encodeDetectedCharCode = (body) => {
    const enc = jschardet.detect(body);
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
                UrlUtils.isPdf(red_url) ? parsePdfTitle(body) : parseHtmlTitle(body),
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
    const $ = cheerio.load(encodeDetectedCharCode(body));
    const title = $('title').text().trim().replace(/\s+/g, " ").replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
    return title.length > 1 ? title : null;
}


const parsePdfTitle = (body) => {
    // TODO::
    return null;
}


class PageResult {
    constructor(url, title, redirected_url) {
        this.url = url;
        this.title = title;
        this.redirected_url = redirected_url;
    }

    isOk() {
        return true;
    }
}


class ErrorPageResult {
    constructor(url, title) {
        this.url = url;
        this.title = title;
        this.redirected_url = url;
    }

    isOk() {
        return false;
    }
}