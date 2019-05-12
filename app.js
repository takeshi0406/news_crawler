const express = require('express');
const ChatWorkClient = require('./lib/chatwork');
const TwitterClient = require('./lib/twitter')
const app = express();
require('dotenv').config();

const twclient = new TwitterClient(
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  process.env.TWITTER_TOKEN,
  process.env.TWITTER_TOKEN_SECRET
)
console.log(twclient.requestUrls("takeshi0406", "fudosan", 1));


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
