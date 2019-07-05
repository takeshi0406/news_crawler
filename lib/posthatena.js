'use strict';

const Blog = require('hatena-blog-api2').Blog;
const ejs = require('ejs');
const fs = require('fs');


module.exports = class HatenaBlogClient {
    constructor(token, tokenSecret, consumerKey, consumerSecret, blogId, hatenaId) {
        this.client = new Blog({
            type: 'oauth',// 認証方式
            userName: hatenaId,
            blogId: blogId,
            consumerKey: consumerKey,
            consumerSecret: consumerSecret,
            accessToken: token,
            accessTokenSecret: tokenSecret,
            apiKey: "unused"
          });
    }

    async postNews(title, news) {
        return await this.client.postEntry({
            content: buildArticle(news),
            draft: true,
            title: title,
            categories: ['自動投稿']
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
