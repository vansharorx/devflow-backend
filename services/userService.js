const {
    addUser,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../models/userModel');

const createUserService = (data) => {
    const newUser = {
        id: Date.now(),
        ...data,
        role: "DEVELOPER",
        createdAt: new Date(),
        updatedAt: new Date()
    };

    addUser(newUser);
    return newUser;
};

const getUsersService = () => getAllUsers();

module.exports = {
    createUserService,
    getUsersService
};