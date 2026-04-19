require('dotenv').config();
require('./config/db');
const express = require('express');
const app = express();

app.use(express.json());


const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const issueRoutes = require('./routes/issueRoutes');
const errorHandler = require('./middleware/errorMiddleware');
app.use((req, res, next) => {
    // fake logged-in user (for testing)
    req.user = {
        id: 123,
        role: "ADMIN" // change to test roles
    };
    next();
});
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
app.get('/health', (req, res) => {
    res.json({ message: "Server running" });
});
app.use(errorHandler);
const PORT = process.env.PORT || 2005;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});