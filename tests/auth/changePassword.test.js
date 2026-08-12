const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest
        .fn()
        .mockResolvedValue()
}));

const testEmails = new Set();

describe("PUT /api/v1/users/change-password", () => {

    let user;
    let accessToken;

    beforeAll(async () => {

        const email =
            `change-password-${Date.now()}@devflow.test`;

        testEmails.add(email);

        const response =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Change Password Test User",
                    email,
                    password: "OldPassword123!"
                });

        expect(response.statusCode)
            .toBe(200);

        user =
            response.body.data;

        await new Promise((resolve, reject) => {

            db.query(
                "UPDATE users SET is_verified = TRUE WHERE id = ?",
                [user.id],
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
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "15m"
                }
            );

    });

    afterAll((done) => {

        const emails =
            [...testEmails];

        if (emails.length === 0) {

            db.end();

            done();

            return;

        }

        const placeholders =
            emails
                .map(() => "?")
                .join(",");

        db.query(
            `DELETE FROM users WHERE email IN (${placeholders})`,
            emails,
            () => {

                db.end();

                done();

            }
        );

    });

    test("changes password successfully", async () => {

        const response =
            await request(app)
                .put("/api/v1/users/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        "OldPassword123!",
                    newPassword:
                        "NewPassword123!"
                });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.success)
            .toBe(true);

        expect(response.body.message)
            .toBe("Password changed successfully");

    });

    test("rejects an incorrect current password", async () => {

        const response =
            await request(app)
                .put("/api/v1/users/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        "WrongPassword123!",
                    newPassword:
                        "AnotherPassword123!"
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe(
                "Current password is incorrect"
            );

    });

    test("rejects using the same password", async () => {

        const response =
            await request(app)
                .put("/api/v1/users/change-password")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send({
                    currentPassword:
                        "NewPassword123!",
                    newPassword:
                        "NewPassword123!"
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe(
                "New password cannot be the same as the current password"
            );

    });

    test("rejects request without authentication", async () => {

        const response =
            await request(app)
                .put("/api/v1/users/change-password")
                .send({
                    currentPassword:
                        "NewPassword123!",
                    newPassword:
                        "AnotherPassword123!"
                });

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.success)
            .toBe(false);

    });

});