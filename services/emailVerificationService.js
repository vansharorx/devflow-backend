const crypto = require("crypto");

const { findUserByEmail, verifyUser } = require("../models/userModel");

const {
    saveVerificationToken,
    findVerificationToken,
    deleteVerificationToken,
    deleteVerificationTokensByUserId,
} = require("../models/emailVerificationModel");

const { sendVerificationEmail } = require("../utils/mailer");
const AppError = require("../utils/AppError");

const sendVerificationEmailService = async (email) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new AppError("User not found.", 400);
    }

    if (user.is_verified) {
        throw new AppError("Email is already verified.", 400);
    }

    await deleteVerificationTokensByUserId(user.id);

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await saveVerificationToken({
        id: Date.now(),
        userId: user.id,
        token,
        expiresAt,
    });

    const verificationLink = `http://localhost:5173/verify-email/${token}`;

    await sendVerificationEmail(user.email, verificationLink);
};

const verifyEmailService = async (token) => {
    const storedToken = await findVerificationToken(token);

    if (!storedToken) {
        throw new AppError("Invalid verification link.", 400);
    }

    if (new Date(storedToken.expires_at) < new Date()) {
        await deleteVerificationToken(token);

        throw new AppError("Verification link has expired.", 400);
    }

    await verifyUser(storedToken.user_id);

    await deleteVerificationToken(token);
};

module.exports = {
    sendVerificationEmailService,
    verifyEmailService,
};