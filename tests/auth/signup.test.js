const request = require("supertest");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest
        .fn()
        .mockResolvedValue()
}));

const testEmails = new Set();

describe("POST /api/v1/users", () => {

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

    test("creates a new user successfully", async () => {

        const email =
            `test-${Date.now()}@devflow.test`;

        testEmails.add(email);

        const response =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "DevFlow Test User",
                    email,
                    password: "TestPassword123!"
                });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.success)
            .toBe(true);

        expect(response.body.message)
            .toBe("User created");

        expect(response.body.data)
            .toBeDefined();

        expect(response.body.data.email)
            .toBe(email);

        expect(response.body.data.role)
            .toBe("DEVELOPER");
        
        expect(response.body.data.password)
            .toBeUndefined();

    });

    test("rejects signup when name is missing", async () => {

        const email =
            `missing-name-${Date.now()}@devflow.test`;

        const response =
            await request(app)
                .post("/api/v1/users")
                .send({
                    email,
                    password: "TestPassword123!"
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.success)
            .toBe(false);

    });

    test("rejects signup when email is invalid", async () => {

        const response =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "DevFlow Test User",
                    email: "invalid-email",
                    password: "TestPassword123!"
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.success)
            .toBe(false);

    });

    test("rejects signup when password is missing", async () => {

        const email =
            `missing-password-${Date.now()}@devflow.test`;

        const response =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "DevFlow Test User",
                    email
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe("Password is required");

    });

    test("rejects signup with an existing email", async () => {

        const email =
            `duplicate-${Date.now()}@devflow.test`;

        testEmails.add(email);

        const firstResponse =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "First User",
                    email,
                    password: "TestPassword123!"
                });

        expect(firstResponse.statusCode)
            .toBe(200);

        const secondResponse =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Second User",
                    email,
                    password: "TestPassword123!"
                });

        expect(secondResponse.statusCode)
            .toBe(500);

        expect(secondResponse.body.success)
            .toBe(false);

    });

});