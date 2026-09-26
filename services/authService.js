const { saveRefreshToken } = require("../models/tokenModel");

const saveRefreshTokenService = async (userId, refreshToken) => {
    await saveRefreshToken(userId, refreshToken);
};

module.exports = {
    saveRefreshTokenService,
};