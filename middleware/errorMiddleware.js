const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    });

    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        success: false,
        message:
            statusCode >= 500
                ? "Something went wrong"
                : err.message || "Request failed",
    });
};

module.exports = errorHandler;