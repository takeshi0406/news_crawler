var Twitter = require('twitter');


module.exports = class TwitterNewsReader {
    constructor(consumer_key, consumer_secret, access_token_key, access_token_secret) {
        this.client = new Twitter({
            "consumer_key": consumer_key,
            "consumer_secret": consumer_secret,
            "access_token_key": access_token_key,
            "access_token_secret": access_token_secret
        });
    }

    getNewsUrls(owner_screen_name, slug, count) {
        return this.client.get(
            "lists/statuses",
            {
                "owner_screen_name": owner_screen_name,
                "slug": slug,
                "count": count
            }
        )
    }
}