const { validationResult } = require('express-validator');
const { addUser, getAllUsers } = require('../models/userModel');

exports.getUsers = (req, res) => {
    const users = getAllUsers();

    res.json({
        message: "Users fetched successfully",
        data: users
    });
};

exports.createUser = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
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