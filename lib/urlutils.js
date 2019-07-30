'use strict';

const u = require('url');
const qs = require('querystring');
const UnusedQuerySet = new Set([
    "utm_source", "utm_content", "utm_campaign", "utm_medium", "utm_term", "cmpid", "feedType", "feedName", "n_cid",
    "cmpid=", "feature", "body", "from", "ref", "cid", "share", "fbclid", "pagefrom", "hss_channel", "rss",
    // AWS event
    "sc_channel", "sc_campaign", "sc_publisher", "sc_country", "sc_geo", "sc_outcome", "trk", "sc_content", "linkId"
]);
const path = require('path');


module.exports.regularize = (url) => {
    const x = u.parse(url);
    switch (x.host) {
        case "www.amazon.co.jp":
            return regularizeAmazonUrl(x);
        case "b.hatena.ne.jp":
            return regularizeHatenaBookmarkUrl(x);
        default:
            const pathname = (x.pathname === "/") ? "" : x.pathname;
            return `${x.protocol}//${x.hostname}${pathname}${removeUnusedQuery(x.query)}`;
    }
}

module.exports.isPdf = (url) => {
    return path.extname(url).startsWith('.pdf');
}

module.exports.IgnoreDomains = class IgnoreDomains {
    constructor(domains) {
        this.ignores = new Set(domains);
    }

    has(url) {
        const hostname = u.parse(url).hostname;
        console.log(hostname);
        return this.ignores.has(hostname);
    }
}

const removeUnusedQuery = (query) => {
    const q = qs.parse(query);
    if (!query) return "";
    const qlist = Object.keys(q).reduce((acc, k) => {
        if (UnusedQuerySet.has(k)) return acc;
        return acc.concat([`${k}=${q[k]}`]);
    }, []);
    return (qlist.length === 0) ? "" : "?" + qlist.join("&");
}

const regularizeAmazonUrl = (x) => {
    const pathname = (x.pathname === "/") ? "" : x.pathname;
    const regexp = /[\s\S\-]*(\/dp\/\w+\/?)[\s\S]*/g;
    const r = regexp.exec(pathname);
    if (!r) {
        return `${x.protocol}//www.amazon.co.jp${pathname}?tag=take1103-22`
    }
    return `${x.protocol}//www.amazon.co.jp${r[1]}?tag=take1103-22`;
}

const regularizeHatenaBookmarkUrl = (x) => {
    const pathname = (x.pathname === "/") ? "" : x.pathname;
    for (let x of [new RegexpWrapper(/\/entry\/s\/(.+)/, "https"), new RegexpWrapper(/\/entry\/(.+)/, "http")]) {
        const r = x.regexp.exec(pathname);
        if (r) {
            return module.exports.regularize(`${x.protocol}://${r[1]}`);
        }
    }
    return `${x.protocol}//b.hatena.ne.jp${pathname}`;
}

class RegexpWrapper {
    constructor(regexp, protocol) {
        this.regexp = regexp;
        this.protocol = protocol;
    }
}
