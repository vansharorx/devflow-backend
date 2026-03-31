let users = [];

const addUser = (user) => {
    users.push(user);
};

const getAllUsers = () => {
    return users;
};

module.exports = {
    addUser,
    getAllUsers
};