const { validationResult } = require('express-validator');
const {
    addUser,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../models/userModel');

exports.getUsers = (req, res) => {
    res.json({
        message: "Users fetched successfully",
        data: getAllUsers()
    });
};

exports.createUser = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    const newUser = {
        id: Date.now(),
        name,
        email
    };

    addUser(newUser);

    res.json({
        message: "User created successfully",
        data: newUser
    });
};

exports.updateUser = (req, res) => {
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
};

exports.deleteUser = (req, res) => {
    const { id } = req.params;

    const deleted = deleteUser(id);

    if (!deleted) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({
        message: "User deleted successfully",
        data: deleted
    });
};