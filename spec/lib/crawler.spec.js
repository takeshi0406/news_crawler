const rewire = require('rewire');
const crawler = rewire('../../lib/crawler');


describe("", () => {
    describe("", () => {
        fetchPage = crawler.__get__("fetchPage");
        it("UTF-8のページのとき", (done) => {
            fetchPage("https://kiito.hatenablog.com/").then(response => {
                expect(response.title).toEqual("歩いたら休め");
                done();
            });
        });

        it("", (done) => {
            fetchPage("https://monoist.atmarkit.co.jp/mn/articles/1806/12/news057.html").then(response => {
                expect(response.title).toEqual("日立は「カンパニー」から「ビジネスユニット」へ、成長のエンジンは「Lumada」 - MONOist（モノイスト）");
                done();
            });
        })
    })
})