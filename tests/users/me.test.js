const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest.fn().mockResolvedValue(),
}));

const testEmails = new Set();

describe("GET /api/v1/users/me", () => {
    let user;
    let accessToken;

    beforeAll(async () => {
        const email = `me-${Date.now()}@devflow.test`;

        testEmails.add(email);

        const signupResponse = await request(app).post("/api/v1/users").send({
            name: "Current User Test",
            email,
            password: "TestPassword123!",
        });

        expect(signupResponse.statusCode).toBe(200);

        user = signupResponse.body.data;

        await new Promise((resolve, reject) => {
            db.query("UPDATE users SET is_verified = TRUE WHERE id = ?", [user.id], (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });

        accessToken = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m",
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

        const placeholders = emails.map(() => "?").join(",");

        db.query(`DELETE FROM users WHERE email IN (${placeholders})`, emails, () => {
            db.end();

            done();
        });
    });

    test("returns the currently authenticated user", async () => {
        const response = await request(app)
            .get("/api/v1/users/me")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data).toBeDefined();

        expect(response.body.data.id).toBe(user.id);

        expect(response.body.data.name).toBe("Current User Test");

        expect(response.body.data.email).toBe(user.email);

        expect(response.body.data.role).toBe("DEVELOPER");

        expect(response.body.data.password).toBeUndefined();
    });

    test("rejects request without authentication", async () => {
        const response = await request(app).get("/api/v1/users/me");

        expect(response.statusCode).toBe(401);

        expect(response.body.success).toBe(false);
    });

    test("rejects request with an invalid access token", async () => {
        const response = await request(app)
            .get("/api/v1/users/me")
            .set("Authorization", "Bearer invalid-access-token");

        expect(response.statusCode).toBe(401);

        expect(response.body.success).toBe(false);
    });
});
