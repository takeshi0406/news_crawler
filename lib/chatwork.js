const request = require('request-promise');

module.exports = class ChatWorkClient {
    constructor(token) {
        this.accessToken = token;
    }

    postMessages(room_id, message) {
        return request.post(
            {
                "url": `https://api.chatwork.com/v2/rooms/${room_id}/messages`,
                "headers": {"X-ChatWorkToken": this.accessToken},
                "form": {"body": message},
                "json": true
            }
        );
    }

    getMessages(room_id) {
        return request.get(
            {
                "url": `https://api.chatwork.com/v2/rooms/${room_id}/messages?force=1`,
                "headers": {"X-ChatWorkToken": this.accessToken},
                "json": true
            }
        )
    }
}