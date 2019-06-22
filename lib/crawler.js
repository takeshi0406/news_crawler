'use strict';

const rp = require('request-promise');
const cheerio = require('cheerio');
const UrlUtils = require('./urlutils');
const Encoding = require('encoding-japanese');
const jschardet = require('jschardet');
const Iconv = require('iconv').Iconv;


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
    let response = await _fetch(url);
    if (response.isOk()) return response;
    response = await _fetch(url);
    if (response.isOk()) return response;
    response = await _fetch(url);
    return response;
}


const encodeDetectedCharCode = (body) => {
    return body;
    /*
    const enc = jschardet.detect(body).encoding;

    //判定した文字コードからUTF-8に変換
    const iconv = new Iconv("SHIFT-JIS", 'UTF-8');
    return iconv.convert(body).toString();
    */
}

const _fetch = async (url) => {
    return await rp.get({
        "uri": url,
        "followAllRedirects": true,
        "transform": (body, response, _) => {
            return new PageResult(
                url,
                parseTitle(url, body),
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


const parseTitle = (url, body) => {
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
