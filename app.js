require('dotenv').config();
const cors = require('cors');

require('./config/env/env');
require('./config/db');

const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const helmet = require('helmet');

const swaggerSpec = require('./config/swagger');

const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

/* Security */
app.disable('x-powered-by');

/* Middlewares */
app.use(cors());

app.use(express.json({
    limit: '1mb'
}));

app.use(helmet());

app.use(morgan('combined'));

app.use('/uploads', express.static('uploads'));

app.use('/api', apiLimiter);

/* Routes */
const notificationRoutes = require('./routes/v1/notificationRoutes');
const userRoutes = require('./routes/v1/userRoutes');
const projectRoutes = require('./routes/v1/projectRoutes');
const issueRoutes = require('./routes/v1/issueRoutes');
const activityRoutes = require('./routes/v1/activityRoutes');
const commentRoutes = require('./routes/v1/commentRoutes');
const dashboardRoutes = require('./routes/v1/dashboardRoutes');
const healthRoutes = require('./routes/v1/healthRoutes');
const passwordRoutes = require('./routes/v1/passwordRoutes');

app.use('/api/v1/users', userRoutes);

app.use('/api/v1/password', passwordRoutes);

app.use('/api/v1/projects', projectRoutes);

app.use('/api/v1/issues', issueRoutes);

app.use('/api/v1/dashboard', dashboardRoutes);

app.use('/api/v1/notifications', notificationRoutes);

app.use('/api/v1/activities', activityRoutes);

app.use('/api/v1/comments', commentRoutes);

app.use('/api/v1/health', healthRoutes);

/* Health Route */
app.get('/health', (req, res) => {
res.json({
message: 'Server running'
});
});

/* Swagger */
app.use(
'/api-docs',
swaggerUi.serve,
swaggerUi.setup(swaggerSpec)
);

/* Error Handler */
app.use(errorHandler);

module.exports = app;
