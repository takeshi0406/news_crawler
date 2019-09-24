const rewire = require('rewire');
const index = rewire('../index');


xdescribe("クローリングのテスト", () => {
    it("エラーが起きないこと", (done) => {
        const event = {};
        event.data = new Buffer(JSON.stringify({
            "title": "NewsCrawlerのテスト",
            "twlist": "takeshi0406/fudosan",
            "chatroom": 31958529,
            "hatenaId": "takeshi0406",
            "blogId": "finnews.hatenablog.com"
        }));
        index.executeNewsCrawler(event, null).then(() => {
            done();
        });
    }, 10 * 60 * 1000);
});