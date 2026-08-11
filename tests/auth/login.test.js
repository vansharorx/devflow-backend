const request = require("supertest");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest
        .fn()
        .mockResolvedValue()
}));

const verifiedEmail =
    `login-${Date.now()}@devflow.test`;

const unverifiedEmail =
    `unverified-${Date.now()}@devflow.test`;

const password =
    "TestPassword123!";

describe("POST /api/v1/users/login", () => {

    beforeAll(async () => {

        /*
         * Create a verified test user through
         * the real signup API.
         */

        const signupResponse =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Login Test User",
                    email: verifiedEmail,
                    password
                });

        expect(signupResponse.statusCode)
            .toBe(200);

        /*
         * Mark the test user as verified.
         */

        await new Promise((resolve, reject) => {

            db.query(
                `
                UPDATE users
                SET is_verified = TRUE
                WHERE email = ?
                `,
                [verifiedEmail],
                (err) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();

                }
            );

        });

        /*
         * Create an unverified test user.
         */

        const unverifiedResponse =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Unverified Test User",
                    email: unverifiedEmail,
                    password
                });

        expect(unverifiedResponse.statusCode)
            .toBe(200);

    });


    afterAll((done) => {

        db.query(
            `
            DELETE FROM users
            WHERE email IN (?, ?)
            `,
            [
                verifiedEmail,
                unverifiedEmail
            ],
            () => {

                db.end();

                done();

            }
        );

    });


    test("logs in a verified user successfully", async () => {

        const response =
            await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: verifiedEmail,
                    password
                });
        
        console.log("LOGIN RESPONSE:", response.body);
        
        expect(response.statusCode)
            .toBe(200);

        expect(response.body.success)
            .toBe(true);

        expect(response.body.message)
            .toBe("Login successful");

        expect(response.body.accessToken)
            .toBeDefined();

        expect(response.body.refreshToken)
            .toBeDefined();

        expect(response.body.data)
            .toBeDefined();

        expect(response.body.data.email)
            .toBe(verifiedEmail);

        expect(response.body.data.name)
            .toBe("Login Test User");

        expect(response.body.data.role)
            .toBe("DEVELOPER");

        /*
         * Password hash must never be
         * returned by the login API.
         */

        expect(response.body.data.password)
            .toBeUndefined();

    });


    test("rejects login with an incorrect password", async () => {

        const response =
            await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: verifiedEmail,
                    password: "WrongPassword123!"
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe("Invalid credentials");

    });


    test("rejects login for a non-existent user", async () => {

        const response =
            await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: "does-not-exist@devflow.test",
                    password
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe("User not found");

    });


    test("rejects login for an unverified user", async () => {

        const response =
            await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: unverifiedEmail,
                    password
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe(
                "Please verify your email before logging in."
            );

    });

});