const Twitter = require('twitter');
const UrlUtils = require('./urlutils');
const extractDomain = require('extract-domain');
const TWITTER_DOMAIN = "twitter.com";


module.exports = class TwitterNewsReader {
    constructor(consumer_key, consumer_secret, access_token_key, access_token_secret) {
        this.client = new Twitter({
            "consumer_key": consumer_key,
            "consumer_secret": consumer_secret,
            "access_token_key": access_token_key,
            "access_token_secret": access_token_secret
        });
    }

    async getNews(owner_screen_name, slug, count) {
        const response = await this.client.get("lists/statuses", {
            "owner_screen_name": owner_screen_name,
            "slug": slug,
            "count": count
        });
        const results = response.reduce((acc, tweet) => {
            return acc.concat((tweet["entities"]["urls"] || []).map((urlinfo) => {
                return new TweetNewsResult(
                    UrlUtils.removeUtmParams(urlinfo["expanded_url"]),
                    tweet["favorite_count"],
                    tweet["retweet_count"]
                    );
            }));
        }, []).filter((news) => {
            return extractDomain(news.url) != TWITTER_DOMAIN;
        });
        const grouped = results.reduce((acc, x) => {
            const y = acc.get(x.url);
            if (!y || x.popularity > y.popularity)
                acc.set(x.url, x);
            return acc;
        }, new Map());
        return Array.from(grouped.values());
    }
}


class TweetNewsResult {
    constructor(url, favorite_count, retweet_count) {
        this.url = url;
        this.retweet_count = retweet_count;
        this.favotite_count = favorite_count;
        this.popularity = retweet_count + favorite_count;
    }
}