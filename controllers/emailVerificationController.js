const asyncHandler = require("../middleware/asyncHandler");

const {
    sendVerificationEmailService,
    verifyEmailService,
} = require("../services/emailVerificationService");

exports.sendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    await sendVerificationEmailService(email);

    res.json({
        success: true,
        message: "Verification email sent successfully.",
    });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    await verifyEmailService(token);

    res.json({
        success: true,
        message: "Email verified successfully.",
    });
});