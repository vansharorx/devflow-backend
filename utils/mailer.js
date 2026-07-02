const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS

    }

});

const sendAssignmentEmail = async (

    to,
    issueTitle

) => {

    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to,

        subject: "New Issue Assigned",

        html: `

            <h2>Issue Assigned</h2>

            <p>You have been assigned a new issue:</p>

            <strong>${issueTitle}</strong>

        `

    });

};

const sendPasswordResetEmail = async (

    to,
    resetLink

) => {

    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to,

        subject: "Reset Your DevFlow Password",

        html: `

            <div
                style="
                    font-family:Arial,sans-serif;
                    max-width:600px;
                    margin:auto;
                    padding:30px;
                "
            >

                <h2 style="color:#102C26;">
                    DevFlow Password Reset
                </h2>

                <p>
                    We received a request to reset your password.
                </p>

                <a
                    href="${resetLink}"
                    style="
                        display:inline-block;
                        margin-top:20px;
                        background:#102C26;
                        color:white;
                        padding:12px 24px;
                        text-decoration:none;
                        border-radius:8px;
                    "
                >
                    Reset Password
                </a>

                <p style="margin-top:25px;">
                    This link expires in <strong>15 minutes</strong>.
                </p>

            </div>

        `

    });

};

const sendVerificationEmail = async (

    to,
    verificationLink

) => {

    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to,

        subject: "Verify Your DevFlow Account",

        html: `

            <div
                style="
                    font-family:Arial,sans-serif;
                    max-width:600px;
                    margin:auto;
                    padding:30px;
                "
            >

                <h2 style="color:#102C26;">
                    Welcome to DevFlow 🎉
                </h2>

                <p>
                    Thank you for creating your DevFlow account.
                </p>

                <p>
                    Please verify your email to activate your account.
                </p>

                <a
                    href="${verificationLink}"
                    style="
                        display:inline-block;
                        margin-top:20px;
                        background:#102C26;
                        color:white;
                        padding:12px 24px;
                        text-decoration:none;
                        border-radius:8px;
                    "
                >
                    Verify Email
                </a>

                <p style="margin-top:25px;">
                    This verification link will expire in
                    <strong>24 hours</strong>.
                </p>

            </div>

        `

    });

};

module.exports = {

    sendAssignmentEmail,
    sendPasswordResetEmail,
    sendVerificationEmail

};