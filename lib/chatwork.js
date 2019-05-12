const request = require('request-promise');


module.exports = class ChatWorkRoomManager {
    constructor(token, room_id) {
        this.room_id = room_id;
        this.client =  new ChatWorkClient(token);
        this.regex = /https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-@]+/gi;
    }

    postMessages(message) {
        return this.client.postMessages(this.room_id, message);
    }

    getPostedUrls() {
        return this.client.getMessages(this.room_id).then((response) => {
            return new Set(
                response.reduce((acc, message) => {
                    return acc.concat(message["body"].match(this.regex) || []);
                }, [])
            );
        });
    }
}


class ChatWorkClient {
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
        );
    }
}