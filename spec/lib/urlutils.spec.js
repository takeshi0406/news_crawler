const UrlUtils = require('../../lib/urlutils');


describe('urlUtilsのテスト', () => {
  describe('パラメータがURLについていないとき', () => {
    it('URLをそのまま返すこと', () => {
        const google_url = "https://google.com";
        expect(UrlUtils.regularize(google_url)).toEqual(google_url);
    });
  });

  describe('パラメータがURLについているとき', () => {
      it('取り除いて返すこと', ()=> {
          expect(UrlUtils.regularize("https://google.com?a=b&utm_source=test")).toEqual("https://google.com?a=b");
      });
  });

  describe('amazonのURLのとき', () => {
    it("余計なパラメータを削除すること", () => {
      expect(UrlUtils.regularize("https://www.amazon.co.jp/dp/B071F9G8JN/ref=cm_sw_r_tw_awdo_c_x_t3ZkDb594C7RB")).toEqual("https://www.amazon.co.jp/dp/B071F9G8JN/?tag=take1103-22");
    });
  });

  describe('amazonの商品のとき', () => {
    it("商品名を除外すること", () => {
      expect(UrlUtils.regularize("https://www.amazon.co.jp/%25E3%2582%25AB%25E3%2583%25BC%25E3%2583%25A9%25E3%2582%25A4%25E3%2583%25AB%25E6%25B5%2581-%25E6%2597%25A5%25E6%259C%25AC%25E4%25BC%2581%25E6%25A5%25AD%25E3%2581%25AE%25E6%2588%2590%25E9%2595%25B7%25E6%2588%25A6%25E7%2595%25A5-%25E4%25B8%2589%25E6%25B2%25B3-%25E4%25B8%25BB%25E9%2596%2580/dp/4532322782/ref=as_li_ss_tl?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&keywords=%E3%82%AB%E3%83%BC%E3%83%A9%E3%82%A4%E3%83%AB%E6%B5%81&qid=1563015017&s=gateway&sr=8-1&linkCode=sl1&tag=tosyokainoouz-22&language=ja_JP")).toEqual("https://www.amazon.co.jp/dp/4532322782/?tag=take1103-22");
    });
  });

  describe('amazonのとき', () => {
    it("パラメータを付与すること", () => {
      expect(UrlUtils.regularize("https://www.amazon.co.jp")).toEqual("https://www.amazon.co.jp?tag=take1103-22");
    });
  });

  describe("はてなブックマークのとき", () => {
    it("元のページを表示すること", () => {
      expect(UrlUtils.regularize("https://b.hatena.ne.jp/entry/s/www.hellocybernetics.tech/entry/2019/07/18/222317")).toEqual("https://www.hellocybernetics.tech/entry/2019/07/18/222317");
    });
  });
});