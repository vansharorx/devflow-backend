const NodeCache = require('node-cache');

/*
    stdTTL = cache expiry time in seconds
*/
const cache = new NodeCache({
    stdTTL: 60 // 1 minute
});

module.exports = cache;