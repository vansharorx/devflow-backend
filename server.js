require('dotenv').config();
require('./config/db');
const express = require('express');
const app = express();
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api', apiLimiter);
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
const notificationRoutes = require('./routes/v1/notificationRoutes');
const userRoutes = require('./routes/v1/userRoutes');
const projectRoutes = require('./routes/v1/projectRoutes');
const issueRoutes = require('./routes/v1/issueRoutes');
const activityRoutes = require('./routes/v1/activityRoutes');
const commentRoutes = require('./routes/v1/commentRoutes');
const dashboardRoutes = require('./routes/v1/dashboardRoutes');
const errorHandler = require('./middleware/errorMiddleware');
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/issues', issueRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/comments', commentRoutes);
app.get('/health', (req, res) => {
    res.json({ message: "Server running" });
});
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
app.use(errorHandler);
const PORT = process.env.PORT || 2005;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});