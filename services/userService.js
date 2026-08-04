const fs = require("fs");
const path = require("path");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { saveRefreshToken } = require('../models/tokenModel');

const {
    sendVerificationEmailService
} = require("./emailVerificationService");

const {
    addUser,
    getAllUsers,
    findUserByEmail,
    findUserWithPasswordById,
    updatePassword,
    updateProfileImage,
    getProfileImage
} = require("../models/userModel");

const loginUserService = async ({ email, password }) => {
    const user = await findUserByEmail(email);

    if (!user) {

        throw new Error(
            "User not found"
        );

    }

    if (!user.is_verified) {

        throw new Error(
            "Please verify your email before logging in."
        );

    }

    const isMatch =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!isMatch) {

        throw new Error(
            "Invalid credentials"
        );

    }

    const accessToken = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    await saveRefreshToken(user.id, refreshToken);

    return { user, accessToken, refreshToken };
};

module.exports.loginUserService = loginUserService;

const createUserService = async (data) => {

    const {

        name,
        email,
        password

    } = data;

    if (!password) {

        throw new Error(
            "Password is required"
        );

    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    const userId = Date.now();

    const newUser = {

        id: userId,

        name,

        email,

        password: hashedPassword,

        role: "DEVELOPER"

    };

    await addUser(newUser);

    await sendVerificationEmailService(email);

    return newUser;

};

const getUsersService = async () => {
    return await getAllUsers();
};

const changePasswordService = async (
    userId,
    currentPassword,
    newPassword
) => {

    const user = await findUserWithPasswordById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        throw new Error(
            "New password cannot be the same as the current password"
        );
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    await updatePassword(
        userId,
        hashedPassword
    );

};

const uploadProfileImageService = async (

    userId,
    file

) => {

    if (!file) {

        throw new Error(
            "Please select an image."
        );

    }

    const oldImage = await getProfileImage(userId);

    if (

        oldImage &&
        oldImage.profile_image

    ) {

        const oldPath = path.join(

            __dirname,
            "..",
            oldImage.profile_image

        );

        if (

            fs.existsSync(oldPath)

        ) {

            fs.unlinkSync(oldPath);

        }

    }

    const imagePath =
        `uploads/profile/${file.filename}`;

    await updateProfileImage(

        userId,
        imagePath

    );

    return imagePath;

};

module.exports = {
    createUserService,
    getUsersService,
    loginUserService,
    changePasswordService,
    uploadProfileImageService
};