const removeUtmParams = require('../../lib/urlutils').removeUtmParams;


describe('urlUtilsのテスト', () => {
  describe('パラメータがURLについていないとき', () => {
    it('URLをそのまま返すこと', () => {
        const google_url = "https://google.com";
        expect(removeUtmParams(google_url)).toEqual(google_url);
    });
  });

  describe('パラメータがURLについているとき', () => {
      it('取り除いて返すこと', ()=> {
          expect(removeUtmParams("https://google.com?a=b&utm_source=test")).toEqual("https://google.com?a=b");
      })
  });
});