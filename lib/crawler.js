const puppeteer = require('puppeteer');


module.exports.crawlAllPages = async (urls) => {
    let result = [];
    for (let list of eachSlice(urls, 10)) {
        result.push(await fetchPages(list));
    }
    return result.reduce((accum, pages) => accum.concat(pages), []);
}


const eachSlice = (arr, size) => {
    let result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}


const fetchPages = async (urls) => {
    const browser = await puppeteer.launch({headless: false});
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