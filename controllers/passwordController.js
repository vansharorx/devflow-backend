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

            message:
                "Password reset link sent successfully."

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

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

            message:
                "Password reset successful."

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};