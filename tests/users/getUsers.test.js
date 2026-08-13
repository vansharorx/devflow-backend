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

describe("GET /api/v1/users", () => {

    let accessToken;

    beforeAll(async () => {

        const email =
            `get-users-${Date.now()}@devflow.test`;

        testEmails.add(email);

        const response =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Get Users Test Admin",
                    email,
                    password: "TestPassword123!"
                });

        expect(response.statusCode)
            .toBe(200);

        const user =
            response.body.data;

        await new Promise((resolve, reject) => {

            db.query(
                "UPDATE users SET role = 'ADMIN' WHERE email = ?",
                [email],
                (err) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();

                }
            );

        });

        accessToken =
            jwt.sign(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: "ADMIN"
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

    test("returns users for an authenticated admin", async () => {

        const response =
            await request(app)
                .get("/api/v1/users")
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

        expect(response.body.data.length)
            .toBeGreaterThan(0);

    });

    test("rejects request without authentication", async () => {

        const response =
            await request(app)
                .get("/api/v1/users");

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.success)
            .toBe(false);

    });

    test("rejects request with an invalid access token", async () => {

        const response =
            await request(app)
                .get("/api/v1/users")
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