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


exports.getUsers = async (req, res) => {

    try {

        const users =
            await getUsersService();

        res.json({

            success: true,

            data: users

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

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

        res.status(500).json({

            success: false,

            message: err.message

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

        res.status(400).json({

            success: false,

            message: err.message

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

        res.status(500).json({

            success: false,

            message: err.message

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

        res.json({

            success: true,

            message: "Login successful",

            accessToken,

            refreshToken,

            data: user

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};


exports.refreshToken = async (req, res) => {

    const {
        token
    } = req.body;

    if (!token) {

        return res.status(401).json({

            success: false,

            message: "Refresh token required"

        });

    }

    try {

        const stored =
            await findToken(
                token
            );

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

        res.status(403).json({

            success: false,

            message:
                "Invalid refresh token"

        });

    }

};


exports.logoutUser = async (req, res) => {

    const {
        token
    } = req.body;

    try {

        await deleteToken(
            token
        );

        res.json({

            success: true,

            message:
                "Logged out successfully"

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

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

            message:
                "Password changed successfully"

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

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

        res.status(400).json({

            success: false,

            message: err.message

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

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};