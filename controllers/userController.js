const jwt = require('jsonwebtoken');

const {
    createUserService,
    getUsersService,
    loginUserService,
    refreshTokenService
} = require('../services/userService');

exports.getUsers = async (req, res) => {
    try {
        const users = await getUsersService();

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
        const user = await createUserService(req.body);

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
        res.json({
            success: true,
            message: "updateUser working"
        });
    } catch (err) {
        res.status(500).json({
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
        const { user, accessToken, refreshToken } = await loginUserService(req.body);

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

exports.refreshToken = (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Refresh token required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (err) {
        res.status(403).json({
            success: false,
            message: "Invalid refresh token"
        });
    }
};