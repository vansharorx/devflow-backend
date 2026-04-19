const {
    createUserService,
    getUsersService
} = require('../services/userService');

exports.getUsers = (req, res, next) => {
    try {
        const users = getUsersService();

        res.json({
            success: true,
            message: "Users fetched",
            data: users
        });
    } catch (err) {
        next(err);
    }
};

exports.createUser = (req, res, next) => {
    try {
        const user = createUserService(req.body);

        res.json({
            success: true,
            message: "User created",
            data: user
        });
    } catch (err) {
        next(err);
    }
};
exports.updateUser = (req, res, next) => {
    res.send("Update user not implemented yet");
};

exports.deleteUser = (req, res, next) => {
    res.send("Delete user not implemented yet");
};