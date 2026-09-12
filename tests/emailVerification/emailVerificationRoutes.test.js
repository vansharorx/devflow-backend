const request = require("supertest");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../utils/mailer", () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(),
}));

const { sendVerificationEmail } = require("../../utils/mailer");

describe("Email Verification Routes", () => {
    let user;
    let verifiedUser;
    let verificationToken;

    const query = (sql, values = []) =>
        new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

    beforeAll(async () => {
        const timestamp = Date.now();

        user = {
            id: timestamp,
            name: "Verification Test User",
            email: `verification-test-${timestamp}@example.com`,
        };

        verifiedUser = {
            id: timestamp + 1,
            name: "Verified Test User",
            email: `verified-test-${timestamp}@example.com`,
        };

        await query(
            `
                INSERT INTO users
                (id, name, email, password, role, is_verified, is_deleted)
                VALUES
                (?, ?, ?, ?, 'DEVELOPER', FALSE, FALSE),
                (?, ?, ?, ?, 'DEVELOPER', TRUE, FALSE)
            `,
            [
                user.id,
                user.name,
                user.email,
                "test-password",
                verifiedUser.id,
                verifiedUser.name,
                verifiedUser.email,
                "test-password",
            ]
        );
    });

    afterEach(async () => {
        await query(
            "DELETE FROM email_verification_tokens WHERE user_id IN (?, ?)",
            [user.id, verifiedUser.id]
        );

        sendVerificationEmail.mockClear();

        await query(
            "UPDATE users SET is_verified = FALSE WHERE id = ?",
            [user.id]
        );
    });

    afterAll(async () => {
        await query(
            "DELETE FROM email_verification_tokens WHERE user_id IN (?, ?)",
            [user.id, verifiedUser.id]
        );

        await query("DELETE FROM users WHERE id IN (?, ?)", [
            user.id,
            verifiedUser.id,
        ]);

        db.end();
    });

    test("valid email can request verification email", async () => {
        const response = await request(app)
            .post("/api/v1/email-verification/send")
            .send({
                email: user.email,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Verification email sent successfully."
        );

        expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
        expect(sendVerificationEmail).toHaveBeenCalledWith(
            user.email,
            expect.stringContaining("http://localhost:5173/verify-email/")
        );

        const tokens = await query(
            `
                SELECT *
                FROM email_verification_tokens
                WHERE user_id = ?
            `,
            [user.id]
        );

        expect(tokens).toHaveLength(1);
        expect(tokens[0].token).toBeTruthy();
        expect(new Date(tokens[0].expires_at).getTime()).toBeGreaterThan(
            Date.now()
        );
    });

    test("invalid email format is rejected", async () => {
        const response = await request(app)
            .post("/api/v1/email-verification/send")
            .send({
                email: "invalid-email",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(sendVerificationEmail).not.toHaveBeenCalled();
    });

    test("missing email is rejected", async () => {
        const response = await request(app)
            .post("/api/v1/email-verification/send")
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(sendVerificationEmail).not.toHaveBeenCalled();
    });

    test("non-existent user cannot request verification email", async () => {
        const response = await request(app)
            .post("/api/v1/email-verification/send")
            .send({
                email: "does-not-exist@example.com",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User not found.");
        expect(sendVerificationEmail).not.toHaveBeenCalled();
    });

    test("already verified user cannot request another verification email", async () => {
        const response = await request(app)
            .post("/api/v1/email-verification/send")
            .send({
                email: verifiedUser.email,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Email is already verified.");
        expect(sendVerificationEmail).not.toHaveBeenCalled();
    });

    test("valid verification token verifies the user's email", async () => {
        verificationToken = "valid-verification-token";

        await query(
            `
                INSERT INTO email_verification_tokens
                (id, user_id, token, expires_at)
                VALUES (?, ?, ?, ?)
            `,
            [
                Date.now(),
                user.id,
                verificationToken,
                new Date(Date.now() + 60 * 60 * 1000),
            ]
        );

        const response = await request(app).get(
            `/api/v1/email-verification/verify/${verificationToken}`
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Email verified successfully."
        );

        const users = await query(
            "SELECT is_verified FROM users WHERE id = ?",
            [user.id]
        );

        expect(users).toHaveLength(1);
        expect(users[0].is_verified).toBe(1);

        const tokens = await query(
            `
                SELECT *
                FROM email_verification_tokens
                WHERE token = ?
            `,
            [verificationToken]
        );

        expect(tokens).toHaveLength(0);
    });

    test("invalid verification token is rejected", async () => {
        const response = await request(app).get(
            "/api/v1/email-verification/verify/invalid-token"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid verification link.");
    });

    test("expired verification token is rejected and deleted", async () => {
        const expiredToken = "expired-verification-token";

        await query(
            `
                INSERT INTO email_verification_tokens
                (id, user_id, token, expires_at)
                VALUES (?, ?, ?, ?)
            `,
            [
                Date.now(),
                user.id,
                expiredToken,
                new Date(Date.now() - 60 * 1000),
            ]
        );

        const response = await request(app).get(
            `/api/v1/email-verification/verify/${expiredToken}`
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Verification link has expired."
        );

        const tokens = await query(
            `
                SELECT *
                FROM email_verification_tokens
                WHERE token = ?
            `,
            [expiredToken]
        );

        expect(tokens).toHaveLength(0);
    });

    test("requesting a new verification email replaces the previous token", async () => {
        const oldToken = "old-verification-token";

        await query(
            `
                INSERT INTO email_verification_tokens
                (id, user_id, token, expires_at)
                VALUES (?, ?, ?, ?)
            `,
            [
                Date.now(),
                user.id,
                oldToken,
                new Date(Date.now() + 60 * 60 * 1000),
            ]
        );

        const response = await request(app)
            .post("/api/v1/email-verification/send")
            .send({
                email: user.email,
            });

        expect(response.statusCode).toBe(200);

        const tokens = await query(
            `
                SELECT *
                FROM email_verification_tokens
                WHERE user_id = ?
            `,
            [user.id]
        );

        expect(tokens).toHaveLength(1);
        expect(tokens[0].token).not.toBe(oldToken);
    });
});