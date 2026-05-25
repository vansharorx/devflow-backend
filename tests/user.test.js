const request = require('supertest');

const app = require('../app');

describe('User API Tests', () => {

    it('should create a new user', async () => {

        const response = await request(app)
            .post('/api/v1/users')
            .send({
                name: 'Test User',
                email: `test${Date.now()}@mail.com`,
                password: '123456'
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success)
            .toBe(true);

    });

    it('should login user', async () => {

        const response = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: 'vansh@test.com',
                password: '123456'
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.accessToken)
            .toBeDefined();

    });

});