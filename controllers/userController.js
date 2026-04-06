const { validationResult } = require('express-validator');
const {
    addUser,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../models/userModel');

const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getUsers = (req, res, next) => {
    try {
        successResponse(res, "Users fetched", getAllUsers());
    } catch (error) {
        next(error);
    }
};

exports.createUser = (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, "Validation failed", 400);
        }

        const { name, email } = req.body;

        const newUser = {
            id: Date.now(),
            name,
            email
        };

        addUser(newUser);

        successResponse(res, "User created", newUser);
    } catch (error) {
        next(error);
    }
};

exports.updateUser = (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const updated = updateUser(id, { name, email });

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