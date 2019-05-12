const express = require('express');
const ChatWorkRoomManager = require('./lib/chatwork');
const TwitterClient = require('./lib/twitter')
const app = express();
require('dotenv').config();


const main = () => {
  const twclient = new TwitterClient(
    process.env.TWITTER_CONSUMER_KEY,
    process.env.TWITTER_CONSUMER_SECRET,
    process.env.TWITTER_TOKEN,
    process.env.TWITTER_TOKEN_SECRET
  );
  const cwclient = new ChatWorkRoomManager(process.env.CHATWORK_TOKEN, 31958529);

  twclient.getNewsUrls("takeshi0406", "fudosan", 100).
    then((tweet) => {
      return cwclient.getPostedUrls().then((response) => {
        // console.log(response);
        // return cwclient.postMessages(response[0]["body"]);
      })
    }).catch((error) => {
      // console.log("error");
      // console.log(error);
      throw error;
    })
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