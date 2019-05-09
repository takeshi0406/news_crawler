const request = require('request');

module.exports = class ChatWorkClient {
    contructor (access_token) {
        this.access_token = access_token;
    }

    postMessage(room_id, message) {
        console.log(message);
    }
}