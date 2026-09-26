const crypto = require("crypto");
const bcrypt = require("bcrypt");

const { findUserByEmail, updatePassword } = require("../models/userModel");

const {
    saveResetToken,
    findResetToken,
    deleteResetToken,
} = require("../models/passwordResetModel");

const { sendPasswordResetEmail } = require("../utils/mailer");
const AppError = require("../utils/AppError");

const forgotPasswordService = async (email) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new AppError("No account found with this email.", 400);
    }

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await saveResetToken({
        id: Date.now(),
        userId: user.id,
        token,
        expiresAt,
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await sendPasswordResetEmail(user.email, resetLink);
};

const resetPasswordService = async (token, password) => {
    const storedToken = await findResetToken(token);

    if (!storedToken) {
        throw new AppError("Invalid password reset link.", 400);
    }

    if (new Date(storedToken.expires_at) < new Date()) {
        await deleteResetToken(token);

        throw new AppError("Password reset link has expired.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await updatePassword(storedToken.user_id, hashedPassword);

    await deleteResetToken(token);
};

module.exports = {
    forgotPasswordService,
    resetPasswordService,
};