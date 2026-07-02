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

        res.status(400).json({

            success: false,

            message: err.message

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

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};