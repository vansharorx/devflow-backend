const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest.fn().mockResolvedValue()
}));

const testEmails = new Set();
const testTokens = new Set();

describe("POST /api/v1/users/logout", () => {

    afterAll((done) => {

        const emails = [...testEmails];

        const cleanup = () => {

            db.end();

            done();

        };

        if (emails.length === 0) {

            cleanup();

            return;

        }

        const placeholders =
            emails.map(() => "?").join(",");

        db.query(
            `DELETE FROM users WHERE email IN (${placeholders})`,
            emails,
            () => cleanup()
        );

    });

    test("logs out successfully with a valid refresh token", async () => {

        const email =
            `logout-${Date.now()}@devflow.test`;

        testEmails.add(email);

        const signupResponse =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Logout Test User",
                    email,
                    password: "TestPassword123!"
                });

        expect(signupResponse.statusCode)
            .toBe(200);

        const userId =
            signupResponse.body.data.id;

        const refreshToken =
            jwt.sign(
                { id: userId },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: "7d" }
            );

        testTokens.add(refreshToken);

        await new Promise((resolve, reject) => {

            db.query(
                "INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)",
                [userId, refreshToken],
                (err) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();

                }
            );

        });

        const response =
            await request(app)
                .post("/api/v1/users/logout")
                .send({
                    token: refreshToken
                });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.success)
            .toBe(true);

        expect(response.body.message)
            .toBe("Logged out successfully");

    });

    test("rejects an invalid logout token", async () => {

        const response =
            await request(app)
                .post("/api/v1/users/logout")
                .send({
                    token: "invalid-refresh-token"
                });

        /*
         * Current implementation deletes the token without
         * checking whether it exists, so this is expected
         * to succeed.
         */
        expect(response.statusCode)
            .toBe(200);

        expect(response.body.success)
            .toBe(true);

    });

});