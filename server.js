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
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const issueRoutes = require('./routes/issueRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/dashboard', dashboardRoutes);
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