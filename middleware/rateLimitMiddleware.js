const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests
    message: {
        success: false,
        message: "Too many requests, try again later"
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // only 5 login attempts
    message: {
        success: false,
        message: "Too many login attempts"
    }
});

module.exports = {
    apiLimiter,
    authLimiter
};