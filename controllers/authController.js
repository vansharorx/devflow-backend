const jwt = require("jsonwebtoken");

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/users"
};

exports.googleCallback = async (req, res) => {

    const user = req.user;

    const accessToken = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );

    const refreshToken = jwt.sign(
        {
            id: user.id
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d"
        }
    );

    const { saveRefreshToken } =
        require("../models/tokenModel");

    await saveRefreshToken(
        user.id,
        refreshToken
    );

    res.cookie(
        "refreshToken",
        refreshToken,
        REFRESH_COOKIE_OPTIONS
    );

    res.redirect(
        `http://localhost:5173/oauth-success?accessToken=${accessToken}`
    );
};