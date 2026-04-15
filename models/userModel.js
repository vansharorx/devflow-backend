let users = [];
const newUser = {
    id: Date.now(),
    name,
    email,
    role: "DEVELOPER", // default role
    createdAt: new Date(),
    updatedAt: new Date()
};

const addUser = (user) => {
    users.push(user);
};

const getAllUsers = () => {
    return users;
};

const findUserById = (id) => {
    return users.find(user => user.id == id);
};

const updateUser = (id, updatedData) => {
    const index = users.findIndex(user => user.id == id);

    if (index === -1) return null;

    users[index] = {
        ...users[index],
        ...updatedData,
        updatedAt: new Date()
    };

    return users[index];
};

const deleteUser = (id) => {
    const index = users.findIndex(user => user.id == id);

    if (index === -1) return null;

    const deletedUser = users[index];
    users.splice(index, 1);

    return deletedUser;
};

module.exports = {
    newUser,
    addUser,
    getAllUsers,
    updateUser,
    deleteUser,
    findUserById
};