const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    saveRefreshToken,
    findToken,
    deleteToken,
} = require("../models/tokenModel");

const {
    addUser,
    getAllUsers,
    findUserByEmail,
    findUserById,
    findUserWithPasswordById,
    updatePassword,
    updateProfileImage,
    getProfileImage,
    updateUser,
} = require("../models/userModel");

const { sendVerificationEmailService } = require("./emailVerificationService");

const AppError = require("../utils/AppError");

let lastGeneratedUserId = 0;

const generateUserId = () => {
    const now = Date.now();

    if (now <= lastGeneratedUserId) {
        lastGeneratedUserId += 1;
    } else {
        lastGeneratedUserId = now;
    }

    return lastGeneratedUserId;
};

const loginUserService = async ({ email, password }) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new AppError("Invalid email or password", 400);
    }

    if (!user.is_verified) {
        throw new AppError("Please verify your email before logging in.", 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Invalid email or password", 400);
    }

    const accessToken = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        }
    );

    const refreshToken = jwt.sign(
        {
            id: user.id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    );

    await saveRefreshToken(user.id, refreshToken);

    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    return {
        user: safeUser,
        accessToken,
        refreshToken,
    };
};

const createUserService = async (data) => {
    const { name, email, password } = data;

    if (!password) {
        throw new AppError("Password is required", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = generateUserId();

    const newUser = {
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: "DEVELOPER",
    };

    await addUser(newUser);

    await sendVerificationEmailService(email);

    const safeUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
    };

    return safeUser;
};

const getUsersService = async () => {
    return await getAllUsers();
};

const updateUserService = async (userId, name, email, role) => {
    const user = await findUserWithPasswordById(userId);

    if (!user) {
        throw new AppError("User not found", 400);
    }

    const updatedName = name !== undefined ? name : user.name;
    const updatedEmail = email !== undefined ? email : user.email;
    const updatedRole = role !== undefined ? role : user.role;

    await updateUser(userId, updatedName, updatedEmail, updatedRole);

    return {
        id: userId,
        name: updatedName,
        email: updatedEmail,
        role: updatedRole,
    };
};

const refreshTokenService = async (token) => {
    const stored = await findToken(token);

    if (!stored) {
        throw new AppError("Token not valid", 403);
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        throw new AppError("Invalid refresh token", 403);
    }

    const user = await findUserById(decoded.id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        }
    );
};

const logoutUserService = async (token) => {
    if (token) {
        await deleteToken(token);
    }
};

const getCurrentUserService = async (userId) => {
    const user = await findUserById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};

const changePasswordService = async (userId, currentPassword, newPassword) => {
    const user = await findUserWithPasswordById(userId);

    if (!user) {
        throw new AppError("User not found", 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        throw new AppError("Current password is incorrect", 400);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
        throw new AppError(
            "New password cannot be the same as the current password",
            400
        );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updatePassword(userId, hashedPassword);
};

const uploadProfileImageService = async (userId, file) => {
    if (!file) {
        throw new AppError("Please select an image.", 400);
    }

    const oldImage = await getProfileImage(userId);

    if (oldImage && oldImage.profile_image) {
        const oldPath = path.join(__dirname, "..", oldImage.profile_image);

        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
    }

    const imagePath = `uploads/profile/${file.filename}`;

    await updateProfileImage(userId, imagePath);

    return imagePath;
};

module.exports = {
    createUserService,
    getUsersService,
    loginUserService,
    updateUserService,
    changePasswordService,
    uploadProfileImageService,
    refreshTokenService,
    logoutUserService,
    getCurrentUserService,
};