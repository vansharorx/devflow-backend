const express = require("express");

const router = express.Router();

const {
    body
} = require("express-validator");

const validate =
    require("../../middleware/validationMiddleware");

const {
    forgotPassword,
    resetPassword
} = require("../../controllers/passwordController");

router.post(

    "/forgot-password",

    [

        body("email")
            .isEmail()
            .withMessage("Valid email is required")

    ],

    validate,

    forgotPassword

);

router.post(

    "/reset-password/:token",

    [

        body("password")
            .isLength({ min: 6 })
            .withMessage(
                "Password must be at least 6 characters"
            )

    ],

    validate,

    resetPassword

);

module.exports = router;