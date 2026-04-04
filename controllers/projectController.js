const { addProject, getAllProjects } = require('../models/projectModel');
const { findUserById } = require('../models/userModel');

exports.getProjects = (req, res) => {
    res.json({
        data: getAllProjects()
    });
};

exports.createProject = (req, res) => {
    const { name, description, createdBy } = req.body;

    if (!name || !createdBy) {
        return res.status(400).json({
            message: "Name and createdBy are required"
        });
    }

    // 🔥 Validate user exists
    const user = findUserById(createdBy);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const newProject = {
        id: Date.now(),
        name,
        description,
        createdBy,
        createdAt: new Date()
    };

    addProject(newProject);

    res.json({
        message: "Project created successfully",
        data: newProject
    });
};