const {
    forgotPasswordService,
    resetPasswordService
} = require("../services/passwordService");

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        await forgotPasswordService(email);

        res.json({
            success: true,
            message: "Password reset link sent successfully."
        });

    } catch (err) {
        console.error(
            "Failed to process forgot password request:",
            err
        );

        const safeMessages = [
            "No account found with this email."
        ];

        if (safeMessages.includes(err.message)) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        await resetPasswordService(
            token,
            password
        );

        res.json({
            success: true,
            message: "Password reset successful."
        });

    } catch (err) {
        console.error(
            "Failed to reset password:",
            err
        );

        const safeMessages = [
            "Invalid password reset link.",
            "Password reset link has expired."
        ];

        if (safeMessages.includes(err.message)) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};