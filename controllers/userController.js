const {
    createUserService,
    getUsersService
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