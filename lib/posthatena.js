'use strict';

const Client = require('hatena-blog-api').Client;
const ejs = require('ejs');
const fs = require('fs');


module.exports = class HatenaBlogClient {
    constructor(token, tokenSecret, consumerKey, consumerSecret, blogId, hatenaId) {
        this.client = new Client({
            token: token,
            tokenSecret: tokenSecret,
            consumerKey: consumerKey,
            consumerSecret: consumerSecret,
            authType: 'oauth',
            blogId: blogId,
            hatenaId: hatenaId
        });
    }

    async postNews(title, news) {
        if (news.length <= 0) return;
        return await this.client.create({
            content: buildArticle(news),
            draft: true,
            title: title,
            categories: ['自動投稿'],
            contentType: 'text/plain',
        });
    }
}


const buildArticle = (latest_news) => {
    const templateString = fs.readFileSync('templates/hatenablog.ejs', 'utf-8');
    const grouped = latest_news.reduce((acc, obj) => {
        let spnews = acc.get(obj.news.popularity) || [];
        spnews.push({
            "title": obj.page.title || "[タイトルが取得できませんでした]",
            "url": obj.page.redirected_url
        });
        acc.set(obj.news.popularity, spnews);
        return acc;
    }, new Map());
    const arr = Array.from(grouped.entries()).map((x) => {
        return {popularity: x[0], entries: x[1]};
    }).sort((x, y) => {
        return y.popularity - x.popularity;
    });

    return ejs.render(templateString, {news: arr});
}
