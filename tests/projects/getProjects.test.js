const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest
        .fn()
        .mockResolvedValue()
}));

const testEmails = new Set();

describe("GET /api/v1/projects", () => {

    let accessToken;

    beforeAll(async () => {

        const email =
            `get-projects-${Date.now()}@devflow.test`;

        testEmails.add(email);

        const response =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Get Projects Test User",
                    email,
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
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "15m"
                }
            );

    });

    afterAll((done) => {

        const emails = [...testEmails];

        if (emails.length === 0) {

            db.end();

            done();

            return;

        }

        const placeholders =
            emails.map(() => "?").join(",");

        db.query(
            `DELETE FROM users WHERE email IN (${placeholders})`,
            emails,
            () => {

                db.end();

                done();

            }
        );

    });

    test("returns projects for an authenticated user", async () => {

        const response =
            await request(app)
                .get("/api/v1/projects")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                );

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.success)
            .toBe(true);

        expect(response.body.data)
            .toBeDefined();

        expect(Array.isArray(response.body.data))
            .toBe(true);

    });

    test("rejects request without authentication", async () => {

        const response =
            await request(app)
                .get("/api/v1/projects");

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.success)
            .toBe(false);

    });

    test("rejects request with an invalid access token", async () => {

        const response =
            await request(app)
                .get("/api/v1/projects")
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