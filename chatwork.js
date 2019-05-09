const request = require('request');

module.exports = class ChatWorkClient {
    constructor(token) {
        this.accessToken = token;
    }

    postMessage(room_id, message) {
        request.post(
            {
                "url": `https://api.chatwork.com/v2/rooms/${room_id}/messages`,
                "headers": {"X-ChatWorkToken": this.accessToken},
                "form": {"body": message}
            },
            (error, response, body) => {
                console.log(error);
                // console.log(response);
                //console.log(body);
            }
        );
    }
}