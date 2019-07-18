'use strict';

const u = require('url');
const qs = require('querystring');
const UnusedQuerySet = new Set([
    "utm_source", "utm_content", "utm_campaign", "utm_medium", "utm_term", "cmpid", "feedType", "feedName", "n_cid",
    "cmpid=", "feature", "body", "from", "ref", "cid", "share",
    // AWS event
    "sc_channel", "sc_campaign", "sc_publisher", "sc_country", "sc_geo", "sc_outcome", "trk", "sc_content", "linkId"
]);
const path = require('path');


module.exports.regularize = (url) => {
    const x = u.parse(url);
    if (x.host === "www.amazon.co.jp") {
        return regularizeAmazonUrl(x);
    }
    const pathname = (x.pathname === "/") ? "" : x.pathname;
    return `${x.protocol}//${x.hostname}${pathname}${removeUnusedQuery(x.query)}`;
}

module.exports.isPdf = (url) => {
    return path.extname(url).startsWith('.pdf');
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
    const regexp = /[\s\S]*(\/dp\/\w+\/)[\s\S]*/g;
    const r = regexp.exec(pathname);
    if (!r) {
        return `${x.protocol}//www.amazon.co.jp${pathname}?tag=take1103-22`
    }
    return `${x.protocol}//www.amazon.co.jp${r[1]}?tag=take1103-22`;
}
