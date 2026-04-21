const {
    addUser,
    getAllUsers
} = require('../models/userModel');

const createUserService = async (data) => {
    const newUser = {
        id: Date.now(),
        ...data,
        role: "DEVELOPER"
    };

    await addUser(newUser);
    return newUser;
};

const getUsersService = async () => {
    return await getAllUsers();
};

module.exports = {
    createUserService,
    getUsersService
};