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
    let response = await _fetch(url);
    if (response.isOk()) return response;
    response = await _fetch(url);
    if (response.isOk()) return response;
    response = await _fetch(url);
    return response;
}


const encodeDetectedCharCode = (body) => {
    const enc = jschardet.detect(body);
    return iconv.decode(
        body,
        enc.encoding
    );
}

const _fetch = async (url) => {
    return await rp.get({
        "uri": url,
        "followAllRedirects": true,
        "encoding": null,
        "transform": (body, response, _) => {
            const red_url = UrlUtils.regularize(response.request.uri.href);
            return new PageResult(
                url,
                UrlUtils.isPdf(red_url) ? null : parseHtmlTitle(url, body),
                red_url
                );
        },
        "headers": {
            'User-Agent': 'news-crawler-bot'
        },
        "timeout": 20000
    }).catch(error => {
        console.error(error);
        // リトライ処理とロギング
        return new PageResult(url, null, url);
    });
}


const parseHtmlTitle = (url, body) => {
    // TODO:: parse pdf
    const $ = cheerio.load(encodeDetectedCharCode(body));
    const title = $('title').text().trim().replace(/\s+/g, " ").replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
    return title.length > 1 ? title : null;
}


class PageResult {
    constructor(url, title, redirected_url) {
        this.url = url;
        this.title = title;
        this.redirected_url = redirected_url;
    }

    isOk() {
        return this.url;
    }
}
