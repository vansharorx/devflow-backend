const { validationResult } = require('express-validator');
const {
    addUser,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../models/userModel');

const { successResponse, errorResponse } = require('../utils/responseHandler');

const {
    createUserService,
    getUsersService
} = require('../services/userService');

exports.getUsers = (req, res) => {
    const users = getUsersService();

    res.json({
        success: true,
        data: users
    });
};

exports.createUser = (req, res) => {
    const user = createUserService(req.body);

    res.json({
        success: true,
        message: "User created",
        data: user
    });
};

exports.updateUser = (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const updated = updateUser(id, {
            name,
            email,
            updatedAt: new Date()
        });

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = (req, res, next) => {
    try {
        const { id } = req.params;

        const deleted = deleteUser(id);

        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User deleted successfully",
            data: deleted
        });
    } catch (error) {
        next(error);
    }
};