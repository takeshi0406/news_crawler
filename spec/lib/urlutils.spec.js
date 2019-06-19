const removeUtmParams = require('../../lib/urlutils').removeUtmParams;


describe('urlUtilsのテスト', () => {
  describe('utmパラメータがURLについていないとき', () => {
    it('URLをそのまま返すこと', () => {
        expect(removeUtmParams("https://google.com")).toBe("https://google.com");
    });
  });
});