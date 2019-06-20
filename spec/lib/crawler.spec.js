const rewire = require('rewire');
const crawler = rewire('../../lib/crawler');


describe("", () => {
    describe("", () => {
        fetchPage = crawler.__get__("fetchPage");
        it("", (done) => {
            fetchPage("https://kiito.hatenablog.com/").then(response => {
                expect(response.title).toEqual("歩いたら休め");
                done();
            })
        })
    })
})