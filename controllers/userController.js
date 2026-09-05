const jwt = require("jsonwebtoken");

const {
    findToken,
    deleteToken
} = require("../models/tokenModel");

const {
    createUserService,
    getUsersService,
    loginUserService,
    updateUserService,
    changePasswordService,
    uploadProfileImageService
} = require("../services/userService");

const {
    findUserById
} = require("../models/userModel");


const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/users"
};


exports.getUsers = async (req, res) => {
    try {
        const users =
            await getUsersService();

        res.json({
            success: true,
            data: users
        });

    } catch (err) {
        console.error(
            "Failed to fetch users:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.createUser = async (req, res) => {
    try {
        const user =
            await createUserService(
                req.body
            );

        res.json({
            success: true,
            message: "User created",
            data: user
        });

    } catch (err) {
        console.error(
            "Failed to create user:",
            err
        );

        if (err.message === "Password is required") {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const {
            name,
            email,
            role
        } = req.body;

        const user =
            await updateUserService(
                req.params.id,
                name,
                email,
                role
            );

        res.json({
            success: true,
            message: "User updated successfully",
            data: user
        });

    } catch (err) {
        console.error(
            "Failed to update user:",
            err
        );

        if (err.message === "User not found") {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "deleteUser working"
        });

    } catch (err) {
        console.error(
            "Failed to delete user:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.loginUser = async (req, res) => {
    try {
        const {
            user,
            accessToken,
            refreshToken
        } =
            await loginUserService(
                req.body
            );

        res.cookie(
            "refreshToken",
            refreshToken,
            REFRESH_COOKIE_OPTIONS
        );

        res.json({
            success: true,
            message: "Login successful",
            accessToken,
            data: user
        });

    } catch (err) {
        console.error(
            "Failed to login user:",
            err
        );

        if (
            err.message === "User not found" ||
            err.message === "Invalid credentials"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (
            err.message ===
            "Please verify your email before logging in."
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please verify your email before logging in."
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.refreshToken = async (req, res) => {
    const token =
        req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Refresh token required"
        });
    }

    try {
        const stored =
            await findToken(token);

        if (!stored) {
            return res.status(403).json({
                success: false,
                message: "Token not valid"
            });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_REFRESH_SECRET
            );

        const user =
            await findUserById(
                decoded.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const newAccessToken =
            jwt.sign(
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

        res.json({
            success: true,
            accessToken:
                newAccessToken
        });

    } catch (err) {
        console.error(
            "Failed to refresh access token:",
            err
        );

        res.status(403).json({
            success: false,
            message: "Invalid refresh token"
        });
    }
};


exports.logoutUser = async (req, res) => {
    const token =
        req.cookies.refreshToken;

    try {
        if (token) {
            await deleteToken(token);
        }

        res.clearCookie(
            "refreshToken",
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/api/v1/users"
            }
        );

        res.json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (err) {
        console.error(
            "Failed to logout user:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        await changePasswordService(
            req.user.id,
            currentPassword,
            newPassword
        );

        res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err) {
        console.error(
            "Failed to change password:",
            err
        );

        const safeMessages = [
            "User not found",
            "Current password is incorrect",
            "New password cannot be the same as the current password"
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


exports.uploadProfileImage = async (req, res) => {
    try {
        const imagePath =
            await uploadProfileImageService(
                req.user.id,
                req.file
            );

        res.status(200).json({
            success: true,
            message:
                "Profile image updated successfully.",
            profileImage:
                imagePath
        });

    } catch (err) {
        console.error(
            "Failed to upload profile image:",
            err
        );

        if (err.message === "Please select an image.") {
            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.getCurrentUser = async (req, res) => {
    try {
        const user =
            await findUserById(
                req.user.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (err) {
        console.error(
            "Failed to fetch current user:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};