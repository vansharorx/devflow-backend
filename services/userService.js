const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    addUser,
    getAllUsers,
    findUserByEmail
} = require('../models/userModel');

const loginUserService = async ({ email, password }) => {
    const user = await findUserByEmail(email);

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const accessToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { user, accessToken, refreshToken };
};

module.exports.loginUserService = loginUserService;
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
    getUsersService,
    loginUserService
};