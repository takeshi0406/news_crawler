'use strict';

const ChatWorkRoomManager = require('./lib/chatwork');
const TwitterClient = require('./lib/twitter');
const Crawler = require('./lib/crawler');
const HatenaBlogClient = require('./lib/posthatena');
require('date-utils');
const TWEET_COUNT = 200;
require('dotenv').config();


/**
 * Background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.executeNewsCrawler = (event, callback) => {
    const opt = JSON.parse(Buffer.from(event.data, 'base64').toString());
    const main = new MainProcess(
        opt.title,
        opt.twlist,
        opt.chatroom,
        opt.tweet_count || TWEET_COUNT,
        opt.blogId,
        opt.hatenaId
        );
    main.exec().catch((error) => {
        throw error;
    });
};


class MainProcess {
    constructor(title, twlist, chatroom, tweet_count, blog_id, hatena_id) {
        this.twclient = new TwitterClient(
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            process.env.TWITTER_TOKEN,
            process.env.TWITTER_TOKEN_SECRET
        );
        this.cwclient = new ChatWorkRoomManager(process.env.CHATWORK_TOKEN, chatroom);
        this.title = title;
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
        ); // TODO
        this.today = (new Date()).toFormat("YYYY-MM-DD");
    }

    async exec() {
        const known_urls = await this.cwclient.getPostedUrls();
        const news = (await this.twclient.getNews(this.twuser, this.slug, this.tweet_count)).filter((x) => {
            return x.popularity >= 1 && !known_urls.has(x.url);
        });
        const results = await crawl(news);
        
        const latest_news = results.filter((res) => {
            return !known_urls.has(res.page.redirected_url);
        });
 
        await this.cwclient.postMessages(this.buildMessage(latest_news));

        if (this.hbclient) {
            await this.hbclient.postNews(`${this.today}の${this.title}`, latest_news);
        }
    }

    buildMessage(latest_news) {
        if (!latest_news.length) {
            return `[info][title]${this.title}[/title]ニュースがありません[/info]`
        }
        const body = latest_news.sort((x, y) => {
            return y.news.popularity - x.news.popularity;
        }).map(x => {
            const stars = x.news.popularity >= 10 ? `(*)×${x.news.popularity}` : "(*)".repeat(x.news.popularity);
            return `${stars}\n${x.page.title || "[タイトルが取得できませんでした]"}\n${x.page.redirected_url}`;
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
