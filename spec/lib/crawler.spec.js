const rewire = require('rewire');
const crawler = rewire('../../lib/crawler');


describe("正常系のテスト", () => {
    fetchPage = crawler.__get__("fetchPage");
    it("UTF-8のページのとき", (done) => {
        fetchPage("https://kiito.hatenablog.com/").then(response => {
            expect(response.title).toEqual("歩いたら休め");
            done();
        });
    });

    it("SHIFT_JISのページをレンダリングできること", (done) => {
        fetchPage("https://monoist.atmarkit.co.jp/mn/articles/1806/12/news057.html").then(response => {
            expect(response.title).toEqual("日立は「カンパニー」から「ビジネスユニット」へ、成長のエンジンは「Lumada」 - MONOist（モノイスト）");
            done();
        });
    });

    it("タイトルがきちんとパースできること", (done) => {
        fetchPage("https://japanese.engadget.com/2019/07/16/macbook-air-2019-ssd/").then(response => {
            expect(response.title).toEqual("MacBook Air(2019)のSSD、前年モデルより低速？ベンチマーク結果が公開 - Engadget 日本版");
            done();
        });
    });

    it("pdfの場合", (done) => {
        fetchPage("www.reins.or.jp/pdf/trend/rt/rt_201907_3.pdf").then(response => {
            expect(response.title).toEqual("首都圏中古マンション・中古戸建住宅 長期動向グラフ - 東日本不動産流通 ...");
            done();
        });
    });
});