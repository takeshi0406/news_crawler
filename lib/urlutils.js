'use strict';

const u = require('url');
const qs = require('querystring');
const UnusedQuerySet = new Set([
    "utm_source", "utm_content", "utm_campaign", "utm_medium", "cmpid", "feedType", "feedName", "n_cid",
    "cmpid=", "feature", "body", "from",
    // AWS event
    "sc_channel", "sc_campaign", "sc_publisher", "sc_country", "sc_geo", "sc_outcome", "trk", "sc_content", "linkId"
]);


module.exports.removeUtmParams = (url) => {
    const x = u.parse(url);
    const pathname = x.pathname === "/" ? "" : x.pathname;
    return `${x.protocol}//${x.hostname}${pathname}${removeUnusedQuery(x.query)}`;
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
