const ChatWorkRoomManager = require('./lib/chatwork');
const TwitterClient = require('./lib/twitter')
const Crawler = require('./lib/crawler')

require('dotenv').config();


const main = () => {
    async_main().catch((error) => {
        throw error;
    })
}

const async_main = async () => {
    const twclient = new TwitterClient(
        process.env.TWITTER_CONSUMER_KEY,
        process.env.TWITTER_CONSUMER_SECRET,
        process.env.TWITTER_TOKEN,
        process.env.TWITTER_TOKEN_SECRET
    );
    const cwclient = new ChatWorkRoomManager(process.env.CHATWORK_TOKEN, 31958529);

    const known_urls = await cwclient.getPostedUrls();
    const news = (await twclient.getNews("takeshi0406", "fudosan", 100)).filter((x) => {
        return x.popularity >= 1 && !known_urls.has(x.url);
    });
    const results = await crawl(news);
    
    const latest_news = results.filter((res) => {
        return !known_urls.has(res.page.redirected_url);
    });

    await cwclient.postMessages(buildMessage(latest_news));
}


const crawl = async (news) => {
    const pages = await Crawler.crawlAllPages(news.map(x => x.url));
    const results = news.map((x, i) => {
        return new LatestNewsResult(x, pages[i]);
    });
    const grouped = results.reduce((acc, x) => {
        const y = acc.get(x.page.redirected_url);
        if (!y || x.news.popularity > y.news.popularity)
            acc.set(x.page.redirected_url, x);
        return acc;
    }, new Map());
    return Array.from(grouped.values());
}

const buildMessage = (latest_news) => {
    const body = latest_news.sort((x, y) => {
        return y.news.popularity - x.news.popularity;
    }).map(x => {
        const stars = x.news.popularity >= 10 ? `(*)×${x.news.popularity}` : "(*)".repeat(x.news.popularity);
        return `${stars}\n${x.page.title}\n${x.page.redirected_url}`;
    }).join("\n\n");
    return `[info][title]"タイトルです"[/title]${body}[/info]`
}


class LatestNewsResult {
    constructor(news, page) {
        this.news = news;
        this.page = page;
    }
}

main();
