const express = require('express');
// const puppeteer = require('puppeteer');
const request = require('request');
const app = express();

app.use(async (req, res) => {
  postSlack("test");
  res.send("test");
});

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err);
  const port = server.address().port;
  console.info(`App listening on port ${port}`);
});


const postSlack = (message) => {
  const request = require('request');
  const options = {
    uri: process.env.SLACK_ENDPOINT,
    headers: {
      "Content-type": "application/json",
      },
      json: {
        "text": message,
        "unfurl_links": true
      }
    };
  request.post(options, (error, response, body) => {
    console.log(error);
    console.log(response);
    console.log(body);
  });
}