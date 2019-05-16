const ChatWorkRoomManager = require('./lib/chatwork');
const TwitterClient = require('./lib/twitter')
const Crawler = require('./lib/crawler')

require('dotenv').config();


const main = () => {
    const main = new MainProcess();
    main.exec().catch((error) => {
        throw error;
    })
}


class MainProcess {
    constructor() {
        this.twclient = new TwitterClient(
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            process.env.TWITTER_TOKEN,
            process.env.TWITTER_TOKEN_SECRET
        );
        this.cwclient = new ChatWorkRoomManager(process.env.CHATWORK_TOKEN, 31958529);
    }

    async exec() {
        const known_urls = await this.cwclient.getPostedUrls();
        const news = (await this.twclient.getNews("takeshi0406", "fudosan", 100)).filter((x) => {
            return x.popularity >= 1 && !known_urls.has(x.url);
        });
        const results = await crawl(news);
        
        const latest_news = results.filter((res) => {
            return !known_urls.has(res.page.redirected_url);
        });
    
        await this.cwclient.postMessages(buildMessage(latest_news));

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
            if (!y || x.news.popularity > y.news.popularity)
                acc.set(x.page[key], x);
            return acc;
        }, new Map());
        return Array.from(grouped.values());
    }, results);
}

const buildMessage = (latest_news) => {
    const body = latest_news.sort((x, y) => {
        return y.news.popularity - x.news.popularity;
    }).map(x => {
        const stars = x.news.popularity >= 10 ? `(*)×${x.news.popularity}` : "(*)".repeat(x.news.popularity);
        return `${stars}\n${x.page.title || "[タイトルが取得できませんでした]"}\n${x.page.redirected_url}`;
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
