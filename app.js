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
    const news_urls = intersept(
        await twclient.getNewsUrls("takeshi0406", "fudosan", 20),
        known_urls
    );
    const results = await Crawler.crawlAllPages(Array.from(news_urls));
    console.log(results.filter((res) => {
        return !known_urls.has(res.redirected_url);
    }));
}

const intersept = (news_urls, known_urls) => {
    let result = new Set();
    news_urls.forEach((url) => {
        const uniq_url = UrlUtils.removeUtmParams(url);
        if (!known_urls.has(uniq_url)) result.add(uniq_url);
    });
    return result;
}


main();
