const puppeteer = require('puppeteer');


module.exports.crawlAllPages = async (urls) => {
    const browser = await puppeteer.launch();
    const results = await Promise.all(urls.map(async (url) => {
        const page = await browser.newPage();
        await page.goto(url);
        const result = new PageResult(
            url,
            await page.url(),
            await page.title()
        );
        await page.close();
        return result;
    }));
    await browser.close();
    return results;
}


class PageResult {
    constructor(raw_url, redirected_url, title) {
        this.raw_url = raw_url;
        this.redirected_url = redirected_url;
        this.title = title;
    }
}