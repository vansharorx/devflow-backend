const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

let accessToken;
let testEmail;

describe("GET /api/v1/projects/analytics", () => {

    beforeAll(async () => {
        testEmail = `analytics-${Date.now()}@devflow.test`;
        
        const email =
            `analytics-${Date.now()}@devflow.test`;

        const response =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Analytics Test User",
                    email: testEmail,
                    password: "TestPassword123!"
                });

        expect(response.statusCode)
            .toBe(200);

        const user =
            response.body.data;

        accessToken =
            jwt.sign(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: "DEVELOPER"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "15m"
                }
            );
    });

    afterAll((done) => {

        db.query(
            "DELETE FROM users WHERE email = ?",
            [testEmail],
            (err) => {

                if (err) {
                    console.error(err);
                }

                db.end(done);
            }
        );

    });

    test("returns analytics for an authenticated user", async () => {

        const response =
            await request(app)
                .get("/api/v1/projects/analytics")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                );

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.success)
            .toBe(true);

        expect(response.body.message)
            .toBe("Analytics endpoint working");

    });

    test("rejects request without authentication", async () => {

        const response =
            await request(app)
                .get("/api/v1/projects/analytics");

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.success)
            .toBe(false);

    });

    test("rejects request with an invalid access token", async () => {

        const response =
            await request(app)
                .get("/api/v1/projects/analytics")
                .set(
                    "Authorization",
                    "Bearer invalid-access-token"
                );

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.success)
            .toBe(false);

    });

});