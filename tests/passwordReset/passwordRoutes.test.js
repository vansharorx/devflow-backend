const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../utils/mailer", () => ({
    sendPasswordResetEmail: jest.fn().mockResolvedValue(),
}));

const { sendPasswordResetEmail } = require("../../utils/mailer");

describe("Password Reset Routes", () => {
    let testUser;
    let verifiedUser;

    beforeAll(async () => {
        testUser = {
            id: Date.now(),
            name: "Password Reset Test User",
            email: `password-reset-${Date.now()}@example.com`,
            password: await bcrypt.hash("OldPassword123", 10),
            role: "DEVELOPER",
            is_verified: true,
            is_deleted: false,
        };

        verifiedUser = {
            id: testUser.id + 1,
            name: "Verified Password User",
            email: `verified-password-${Date.now()}@example.com`,
            password: await bcrypt.hash("OldPassword123", 10),
            role: "DEVELOPER",
            is_verified: true,
            is_deleted: false,
        };

        await new Promise((resolve, reject) => {
            db.query(
                `
                INSERT INTO users
                (id, name, email, password, role, is_verified, is_deleted)
                VALUES (?, ?, ?, ?, ?, ?, ?),
                       (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    testUser.id,
                    testUser.name,
                    testUser.email,
                    testUser.password,
                    testUser.role,
                    testUser.is_verified,
                    testUser.is_deleted,

                    verifiedUser.id,
                    verifiedUser.name,
                    verifiedUser.email,
                    verifiedUser.password,
                    verifiedUser.role,
                    verifiedUser.is_verified,
                    verifiedUser.is_deleted,
                ],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    });

    afterEach(async () => {
        await new Promise((resolve, reject) => {
            db.query(
                "DELETE FROM password_reset_tokens WHERE user_id IN (?, ?)",
                [testUser.id, verifiedUser.id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        sendPasswordResetEmail.mockClear();
    });

    afterAll(async () => {
        await new Promise((resolve, reject) => {
            db.query(
                "DELETE FROM users WHERE id IN (?, ?)",
                [testUser.id, verifiedUser.id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    });

    test("valid email can request password reset", async () => {
        const response = await request(app)
            .post("/api/v1/password/forgot-password")
            .send({
                email: testUser.email,
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            message: "Password reset link sent successfully.",
        });

        expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(
            testUser.email,
            expect.stringContaining("/reset-password/")
        );

        const [rows] = await new Promise((resolve, reject) => {
            db.query(
                `
                SELECT *
                FROM password_reset_tokens
                WHERE user_id = ?
                `,
                [testUser.id],
                (err, results, fields) => {
                    if (err) reject(err);
                    else resolve([results, fields]);
                }
            );
        });

        expect(rows).toHaveLength(1);
        expect(rows[0].token).toBeTruthy();
        expect(new Date(rows[0].expires_at).getTime()).toBeGreaterThan(Date.now());
    });

    test("invalid email format is rejected", async () => {
        const response = await request(app)
            .post("/api/v1/password/forgot-password")
            .send({
                email: "invalid-email",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test("missing email is rejected", async () => {
        const response = await request(app)
            .post("/api/v1/password/forgot-password")
            .send({});

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test("non-existent email is rejected", async () => {
        const response = await request(app)
            .post("/api/v1/password/forgot-password")
            .send({
                email: "does-not-exist@example.com",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: "No account found with this email.",
        });

        expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test("valid reset token successfully changes password", async () => {
        const token = `valid-reset-token-${Date.now()}`;

        await new Promise((resolve, reject) => {
            db.query(
                `
                INSERT INTO password_reset_tokens
                (id, user_id, token, expires_at)
                VALUES (?, ?, ?, ?)
                `,
                [
                    Date.now(),
                    testUser.id,
                    token,
                    new Date(Date.now() + 15 * 60 * 1000),
                ],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        const response = await request(app)
            .post(`/api/v1/password/reset-password/${token}`)
            .send({
                password: "NewPassword123",
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            message: "Password reset successful.",
        });

        const [rows] = await new Promise((resolve, reject) => {
            db.query(
                "SELECT password FROM users WHERE id = ?",
                [testUser.id],
                (err, results, fields) => {
                    if (err) reject(err);
                    else resolve([results, fields]);
                }
            );
        });

        expect(rows).toHaveLength(1);

        expect(await bcrypt.compare("NewPassword123", rows[0].password)).toBe(true);
        expect(await bcrypt.compare("OldPassword123", rows[0].password)).toBe(false);
    });

    test("invalid reset token is rejected", async () => {
        const response = await request(app)
            .post("/api/v1/password/reset-password/invalid-token")
            .send({
                password: "NewPassword123",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: "Invalid password reset link.",
        });
    });

    test("expired reset token is rejected and deleted", async () => {
        const token = `expired-reset-token-${Date.now()}`;

        await new Promise((resolve, reject) => {
            db.query(
                `
                INSERT INTO password_reset_tokens
                (id, user_id, token, expires_at)
                VALUES (?, ?, ?, ?)
                `,
                [
                    Date.now(),
                    testUser.id,
                    token,
                    new Date(Date.now() - 60 * 1000),
                ],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        const response = await request(app)
            .post(`/api/v1/password/reset-password/${token}`)
            .send({
                password: "NewPassword123",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            success: false,
            message: "Password reset link has expired.",
        });

        const [rows] = await new Promise((resolve, reject) => {
            db.query(
                `
                SELECT *
                FROM password_reset_tokens
                WHERE token = ?
                `,
                [token],
                (err, results, fields) => {
                    if (err) reject(err);
                    else resolve([results, fields]);
                }
            );
        });

        expect(rows).toHaveLength(0);
    });

    test("reset token is deleted after successful password reset", async () => {
        const token = `single-use-token-${Date.now()}`;

        await new Promise((resolve, reject) => {
            db.query(
                `
                INSERT INTO password_reset_tokens
                (id, user_id, token, expires_at)
                VALUES (?, ?, ?, ?)
                `,
                [
                    Date.now(),
                    testUser.id,
                    token,
                    new Date(Date.now() + 15 * 60 * 1000),
                ],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        const response = await request(app)
            .post(`/api/v1/password/reset-password/${token}`)
            .send({
                password: "AnotherPassword123",
            });

        expect(response.statusCode).toBe(200);

        const [rows] = await new Promise((resolve, reject) => {
            db.query(
                `
                SELECT *
                FROM password_reset_tokens
                WHERE token = ?
                `,
                [token],
                (err, results, fields) => {
                    if (err) reject(err);
                    else resolve([results, fields]);
                }
            );
        });

        expect(rows).toHaveLength(0);
    });

    test("password shorter than 6 characters is rejected", async () => {
        const token = `short-password-token-${Date.now()}`;

        await new Promise((resolve, reject) => {
            db.query(
                `
                INSERT INTO password_reset_tokens
                (id, user_id, token, expires_at)
                VALUES (?, ?, ?, ?)
                `,
                [
                    Date.now(),
                    testUser.id,
                    token,
                    new Date(Date.now() + 15 * 60 * 1000),
                ],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        const response = await request(app)
            .post(`/api/v1/password/reset-password/${token}`)
            .send({
                password: "12345",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
    });

    test("missing password is rejected", async () => {
        const token = `missing-password-token-${Date.now()}`;

        await new Promise((resolve, reject) => {
            db.query(
                `
                INSERT INTO password_reset_tokens
                (id, user_id, token, expires_at)
                VALUES (?, ?, ?, ?)
                `,
                [
                    Date.now(),
                    testUser.id,
                    token,
                    new Date(Date.now() + 15 * 60 * 1000),
                ],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        const response = await request(app)
            .post(`/api/v1/password/reset-password/${token}`)
            .send({});

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
    });
});