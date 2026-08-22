const express = require("express");
const passport = require("passport");

const {
    googleCallback
} = require("../../controllers/authController");

const router = express.Router();

const googleOAuthEnabled =
    Boolean(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_CALLBACK_URL
    );

router.get(
    "/google",
    (req, res, next) => {

        if (!googleOAuthEnabled) {
            return res.status(503).json({
                success: false,
                message: "Google OAuth is not configured"
            });
        }

        next();
    },
    passport.authenticate(
        "google",
        {
            scope: [
                "profile",
                "email"
            ]
        }
    )
);

router.get(
    "/google/callback",
    (req, res, next) => {

        if (!googleOAuthEnabled) {
            return res.status(503).json({
                success: false,
                message: "Google OAuth is not configured"
            });
        }

        next();
    },
    passport.authenticate(
        "google",
        {
            session: false,
            failureRedirect: "/login"
        }
    ),
    googleCallback
);

module.exports = router;