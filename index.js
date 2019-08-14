'use strict';

const ChatWorkRoomManager = require('./lib/chatwork');
const TwitterClient = require('./lib/twitter');
const Crawler = require('./lib/crawler');
const HatenaBlogClient = require('./lib/posthatena');
const UrlUtils = require('./lib/urlutils');
require('date-utils');
const TWEET_COUNT = 500;
require('dotenv').config();
const IGNORE_DOMAINS = [
    "hobbyistnews.hatenablog.com",
    "seculog.hatenablog.com",
    "devs.hatenablog.com",
    "finnews.hatenablog.com",
    "fudosaninfo.hatenablog.com",
    "7news.hatenablog.com",
    "webacqs.hatenablog.com",
    "www.instagram.com",
    "peing.net",
    "twilog.org"
];


/**
 * Background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.executeNewsCrawler = async (event, callback) => {
    const opt = JSON.parse(Buffer.from(event.data, 'base64').toString());
    console.log(`start ${opt.title}...`);
    const main = new MainProcess(
        opt.title,
        opt.twlist,
        opt.chatroom,
        opt.tweet_count || TWEET_COUNT,
        opt.blogId,
        opt.hatenaId,
        (typeof opt.draft === 'boolean') ? opt.draft : true
        );
    await main.exec();
};


class MainProcess {
    constructor(title, twlist, chatroom, tweet_count, blog_id, hatena_id, draft) {
        this.twclient = new TwitterClient(
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            process.env.TWITTER_TOKEN,
            process.env.TWITTER_TOKEN_SECRET
        );
        this.cwclient = new ChatWorkRoomManager(process.env.CHATWORK_TOKEN, chatroom);
        this.title = `${(new Date()).toFormat("YYYY-MM-DD")}の${title}`;
        this.tweet_count = tweet_count;
        [this.twuser, this.slug] = twlist.split("/");
        if (!blog_id || !hatena_id) return;
        this.hbclient = new HatenaBlogClient(
            process.env.HATENA_TOKEN,
            process.env.HATENA_TOKEN_SECRET,
            process.env.HATENA_CONSUMER_KEY,
            process.env.HATENA_CONSUMER_SECRET,
            blog_id,
            hatena_id
        );
        this.draft = draft;
    }

    async exec() {
        const knownUrls = await this.cwclient.getPostedUrls();
        const ignoreDomains = new UrlUtils.IgnoreDomains(IGNORE_DOMAINS);
        const news = (await this.twclient.getNews(this.twuser, this.slug, this.tweet_count)).filter((x) => {
            return x.popularity >= 1 && !knownUrls.has(x.url);
        });
        const results = await crawl(news);
        
        const latest_news = results.filter((res) => {
            return !(knownUrls.has(UrlUtils.encode(res.page.redirected_url)) || ignoreDomains.has(res.page.redirected_url));
        });
 
        await this.cwclient.postMessages(this.buildMessage(latest_news));

        if (this.hbclient) {
            await this.hbclient.postNews(this.title, latest_news, this.draft);
        }
    }

    buildMessage(latest_news) {
        if (!latest_news.length) {
            return `[info][title]${this.title}[/title]ニュースがありません[/info]`
        }
        // TODO:: ニュースの数をうまく制限する
        const body = latest_news.sort((x, y) => {
            return y.news.popularity - x.news.popularity;
        }).slice(0, 25).map(x => {
            const stars = x.news.popularity >= 10 ? `(*)×${x.news.popularity}` : "(*)".repeat(x.news.popularity);
            return `${stars}\n${x.page.title || "[タイトルが取得できませんでした]"}\n${UrlUtils.encode(x.page.redirected_url)}`;
        }).join("\n\n");
        return `[info][title]${this.title}[/title]${body}[/info]`
    }
}


const crawl = async (news) => {
    const pages = await Crawler.crawlAllPages(news.map(x => x.url));

    // in Ruby
    // results = news.zip(pages);
    const results = news.map((x, i) => {
        return new LatestNewsResult(x, pages[i]);
    });

    // in Ruby
    // return results.group_by { |x| x.pages.redirected_url }.
    //    map { |_, v| v.max_by { |x| x.news.popularity } }
    const grouped = results.reduce((acc, x) => {
        const y = acc.get(x.page.redirected_url);
        if (!y || x.news.popularity > y.news.popularity)
            acc.set(x.page.redirected_url, x);
        return acc;
    }, new Map());

    return Array.from(grouped.values());
}


class LatestNewsResult {
    constructor(news, page) {
        this.news = news;
        this.page = page;
    }
}
