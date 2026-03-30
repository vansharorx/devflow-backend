const { validationResult } = require('express-validator');

exports.getUsers = (req, res) => {
    res.json({ message: "Get all users" });
};

exports.createUser = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { name, email } = req.body;

    res.json({
        message: "User created successfully",
        data: { name, email }
    });
};