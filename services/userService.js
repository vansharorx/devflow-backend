const bcrypt = require('bcrypt');

const {
    addUser,
    getAllUsers
} = require('../models/userModel');

const createUserService = async (data) => {
    const { name, email, password } = data;

    if (!password) {
        throw new Error("Password is required");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: Date.now(),
        name,
        email,
        password: hashedPassword,
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