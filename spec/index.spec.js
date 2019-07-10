const rewire = require('rewire');
const index = rewire('../index');


describe("", () => {
    it("", (done) => {
        const event = {};
        event.data = new Buffer(JSON.stringify({
            "title": "NewsCrawlerのテスト",
            "twlist": "takeshi0406/fintech",
            "chatroom": 31958529,
            "hatenaId":" takeshi0406",
            "blogId":"finnews.hatenablog.com"
        }));
        index.executeNewsCrawler(event, null);
    }, 10 * 60 * 1000);
});