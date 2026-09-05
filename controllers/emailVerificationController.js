const {
    sendVerificationEmailService,
    verifyEmailService
} = require("../services/emailVerificationService");

exports.sendVerificationEmail = async (req, res) => {

    try {

        const { email } = req.body;

        await sendVerificationEmailService(email);

        res.json({
            success: true,
            message:
                "Verification email sent successfully."
        });

    } catch (err) {

        console.error(
            "Failed to send verification email:",
            err
        );

        const safeMessages = [
            "User not found.",
            "Email is already verified."
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

exports.verifyEmail = async (req, res) => {

    try {

        const { token } = req.params;

        await verifyEmailService(token);

        res.json({
            success: true,
            message:
                "Email verified successfully."
        });

    } catch (err) {

        console.error(
            "Failed to verify email:",
            err
        );

        const safeMessages = [
            "Invalid verification link.",
            "Verification link has expired."
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