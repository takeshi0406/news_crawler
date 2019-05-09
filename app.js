const express = require('express');
const ChatWorkClient = require('./chatwork');
const app = express();
require('dotenv').config();


app.use(async (req, res) => {
  const client = new ChatWorkClient("test");
  client.postMessage("test", "test");
  res.send("test");
});


const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err);
  const port = server.address().port;
  console.info(`App listening on port ${port}`);
});
