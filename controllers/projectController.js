const { addProject, getAllProjects } = require('../models/projectModel');

exports.getProjects = (req, res) => {
    res.json({
        message: "Projects fetched successfully",
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