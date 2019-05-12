const futm = require('futm');

module.exports.removeUtmParams = (url) => {
    return futm(url);
}