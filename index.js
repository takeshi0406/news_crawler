'use strict';

const ChatWorkRoomManager = require('./lib/chatwork');
const TwitterClient = require('./lib/twitter')
const Crawler = require('./lib/crawler')
const pdf = require('pdf-parse');
const TWEET_COUNT = 100;
require('dotenv').config();


/**
 * Background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.run = (event, callback) => {
    main();
};


const main = () => {
    const main = new MainProcess("本日のFintechニュース", "takeshi0406/seo", 31958529);
    main.exec().catch((error) => {
        throw error;
    })
}


class MainProcess {
    constructor(title, twlist, chatroom) {
        this.twclient = new TwitterClient(
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            process.env.TWITTER_TOKEN,
            process.env.TWITTER_TOKEN_SECRET
        );
        this.cwclient = new ChatWorkRoomManager(process.env.CHATWORK_TOKEN, chatroom);
        this.title = title;
        [this.twuser, this.slug] = twlist.split("/");
    }

    async exec() {
        const known_urls = await this.cwclient.getPostedUrls();
        const news = (await this.twclient.getNews(this.twuser, this.slug, TWEET_COUNT)).filter((x) => {
            return x.popularity >= 1 && !known_urls.has(x.url);
        });
        const results = await crawl(news);
        
        const latest_news = results.filter((res) => {
            return !known_urls.has(res.page.redirected_url);
        });
 
        await this.cwclient.postMessages(this.buildMessage(latest_news));
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
    const results = news.map((x, i) => {
        return new LatestNewsResult(x, pages[i]);
    });
    return ["redirected_url", "title"].reduce((acc, key) => {
        const grouped = acc.reduce((acc, x) => {
            const y = acc.get(x.page[key]);
            if (!y || (!x[key] && x.news.popularity > y.news.popularity))
                acc.set(x.page[key], x);
            return acc;
        }, new Map());
        const nulls = acc.filter((x) => x[key]);
        return Array.from(grouped.values()).concat(nulls);
    }, results);
}


class LatestNewsResult {
    constructor(news, page) {
        this.news = news;
        this.page = page;
    }
}

main();