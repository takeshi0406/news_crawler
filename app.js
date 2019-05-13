const ChatWorkRoomManager = require('./lib/chatwork');
const TwitterClient = require('./lib/twitter')
const UrlUtils = require('./lib/urlutils')
const Crawler = require('./lib/crawler')

require('dotenv').config();


const main = () => {
    crawl().catch((error) => {
        throw error;
    })
}

const crawl = async () => {
    const twclient = new TwitterClient(
        process.env.TWITTER_CONSUMER_KEY,
        process.env.TWITTER_CONSUMER_SECRET,
        process.env.TWITTER_TOKEN,
        process.env.TWITTER_TOKEN_SECRET
    );
    const cwclient = new ChatWorkRoomManager(process.env.CHATWORK_TOKEN, 31958529);

    const known_urls = await cwclient.getPostedUrls();
    const news = await twclient.getNews("takeshi0406", "fudosan", 20);
    const news_urls = news.filter((x) => {
        return !known_urls.has(x.url);
    }).map(x => x.url);
    const results = await Crawler.crawlAllPages(Array.from(news_urls));
    console.log(results.filter((res) => {
        return !known_urls.has(res.redirected_url);
    }));
}

main();
