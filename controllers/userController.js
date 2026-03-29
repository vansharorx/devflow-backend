exports.getUsers = (req, res) => {
    res.json({
        message: "Get all users"
    });
};

exports.createUser = (req, res) => {
    const { name, email } = req.body;

    res.json({
        message: "User created",
        data: { name, email }
    });
};