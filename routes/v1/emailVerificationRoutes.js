const express = require("express");

const router = express.Router();

const {

    body

} = require("express-validator");

const validate =
    require("../../middleware/validationMiddleware");

const {

    sendVerificationEmail,
    verifyEmail

} = require("../../controllers/emailVerificationController");

router.post(

    "/send",

    [

        body("email")
            .isEmail()
            .withMessage("Valid email is required")

    ],

    validate,

    sendVerificationEmail

);

router.get(

    "/verify/:token",

    verifyEmail

);

module.exports = router;