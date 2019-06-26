'use strict';

const rp = require('request-promise');
const cheerio = require('cheerio');
const UrlUtils = require('./urlutils');
const jschardet = require('jschardet');
const iconv = require("iconv-lite");
const log4js = require('log4js')
const logger = log4js.getLogger();


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
            return new PageResult(
                url,
                parseTitle(url, body),
                UrlUtils.removeUtmParams(response.request.uri.href)
                );
        },
        "headers": {
            'User-Agent': 'Node-Crawler'
        }
    }).catch(error => {
        logger.error(error);
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
