const rewire = require('rewire');
const crawler = rewire('../../lib/crawler');


describe("正常系のテスト", () => {
    const fetchPage = crawler.__get__("fetchPage");
    let originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    });

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

    it("amazonの場合", (done) => {
        fetchPage("https://www.amazon.co.jp/dp/4881977350").then(response => {
            expect(response.title).toEqual("岡山孤児院物語―石井十次の足跡 | 横田賢一 |本 | 通販 | Amazon");
            done();
        });
    });

    it("pdfの場合", (done) => {
        fetchPage("http://www.reins.or.jp/pdf/trend/rt/rt_201907_3.pdf").then(response => {
            expect(response.title).toEqual("rt_201907_3.pdf");
            done();
        });
    });

    xit("pdfの場合", (done) => {
        fetchPage("https://arxiv.org/pdf/1707.04020.pdf").then(response => {
            expect(response.title).toEqual("");
            done();
        });
    });

    afterAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
});