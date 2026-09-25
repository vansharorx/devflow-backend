const jwt = require("jsonwebtoken");

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/users",
};

exports.googleCallback = async (req, res) => {
    const user = req.user;

    const refreshToken = jwt.sign(
        {
            id: user.id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    );

    const { saveRefreshToken } = require("../models/tokenModel");

    await saveRefreshToken(user.id, refreshToken);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.redirect(`${process.env.FRONTEND_URL}/oauth-success`);
};