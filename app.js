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
  const news_urls = intersept(
    await twclient.getNewsUrls("takeshi0406", "fudosan", 10),
    await cwclient.getPostedUrls()
  );
  const results = await Crawler.crawlAllPages(Array.from(news_urls));
  console.log(results);
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

/*
app.use(async (req, res) => {
  const client = new ChatWorkClient(process.env.CHATWORK_TOKEN);
  client.postMessage("31958529", "test");
  res.send("test");
});


const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err);
  const port = server.address().port;
  console.info(`App listening on port ${port}`);
});
*/