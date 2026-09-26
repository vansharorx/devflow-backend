const asyncHandler = require("../middleware/asyncHandler");

const {
    forgotPasswordService,
    resetPasswordService,
} = require("../services/passwordService");

exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    await forgotPasswordService(email);

    res.json({
        success: true,
        message: "Password reset link sent successfully.",
    });
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    await resetPasswordService(token, password);

    res.json({
        success: true,
        message: "Password reset successful.",
    });
});