const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',

        info: {
            title: 'DevFlow API',
            version: '1.0.0',
            description: 'Issue Tracking Backend API'
        },

        servers: [
            {
                url: 'http://localhost:2005'
            }
        ]
    },

    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;