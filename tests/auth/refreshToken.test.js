const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest
        .fn()
        .mockResolvedValue()
}));

const testEmails = new Set();
const testTokens = new Set();

const createTestUser = async ({
    email,
    isVerified = 1
}) => {

    const password = await bcrypt.hash(
        "TestPassword123!",
        10
    );

    const userId = Date.now() + Math.floor(
        Math.random() * 100000
    );

    await new Promise((resolve, reject) => {

        db.query(
            `
            INSERT INTO users
            (
                id,
                name,
                email,
                password,
                role,
                is_verified
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                "Refresh Token Test User",
                email,
                password,
                "DEVELOPER",
                isVerified
            ],
            (err) => {

                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            }
        );

    });

    testEmails.add(email);

    return {
        id: userId,
        email
    };

};

const createRefreshToken = (userId) => {

    const token = jwt.sign(
        {
            id: userId
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d"
        }
    );

    testTokens.add(token);

    return token;

};

const saveToken = async (userId, token) => {

    await new Promise((resolve, reject) => {

        db.query(
            `
            INSERT INTO refresh_tokens
            (
                user_id,
                token
            )
            VALUES (?, ?)
            `,
            [
                userId,
                token
            ],
            (err) => {

                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            }
        );

    });

};

describe("POST /api/v1/users/refresh", () => {

    afterAll((done) => {

        const emails = [
            ...testEmails
        ];

        const tokens = [
            ...testTokens
        ];

        const cleanupUsers = () => {

            if (emails.length === 0) {

                db.end();
                done();

                return;
            }

            const placeholders =
                emails.map(() => "?").join(",");

            db.query(
                `
                DELETE FROM users
                WHERE email IN (${placeholders})
                `,
                emails,
                () => {

                    db.end();
                    done();

                }
            );

        };

        if (tokens.length > 0) {

            const placeholders =
                tokens.map(() => "?").join(",");

            db.query(
                `
                DELETE FROM refresh_tokens
                WHERE token IN (${placeholders})
                `,
                tokens,
                () => {

                    cleanupUsers();

                }
            );

        } else {

            cleanupUsers();

        }

    });

    test("returns a new access token for a valid refresh token", async () => {

        const email =
            `refresh-valid-${Date.now()}@devflow.test`;

        const user =
            await createTestUser({
                email
            });

        const refreshToken =
            createRefreshToken(user.id);
        

        await saveToken(
            user.id,
            refreshToken
        );

        const [rows] = await new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM refresh_tokens WHERE token = ?",
                [refreshToken],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve([results]);
                }
            );
        });

        const response =
            await request(app)
                .post("/api/v1/users/refresh")
                .send({
                    token: refreshToken
                });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.success)
            .toBe(true);

        expect(response.body.accessToken)
            .toBeDefined();

        const decoded =
            jwt.verify(
                response.body.accessToken,
                process.env.JWT_SECRET
            );

        expect(decoded.id)
            .toBe(user.id);

        expect(decoded.email)
            .toBe(email);

        expect(decoded.role)
            .toBe("DEVELOPER");

    });

    test("rejects refresh when token is missing", async () => {

        const response =
            await request(app)
                .post("/api/v1/users/refresh")
                .send({});

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe("Refresh token required");

    });

    test("rejects a refresh token that is not stored", async () => {

        const user =
            await createTestUser({
                email:
                    `refresh-not-stored-${Date.now()}@devflow.test`
            });

        const refreshToken =
            createRefreshToken(user.id);

        const response =
            await request(app)
                .post("/api/v1/users/refresh")
                .send({
                    token: refreshToken
                });

        expect(response.statusCode)
            .toBe(403);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe("Token not valid");

    });

    test("rejects an invalid refresh token", async () => {

        const response =
            await request(app)
                .post("/api/v1/users/refresh")
                .send({
                    token: "invalid-refresh-token"
                });

        expect(response.statusCode)
            .toBe(403);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe("Token not valid");

    });

    test("rejects an expired refresh token", async () => {

        const user =
            await createTestUser({
                email:
                    `refresh-expired-${Date.now()}@devflow.test`
            });

        const expiredToken =
            jwt.sign(
                {
                    id: user.id
                },
                process.env.JWT_REFRESH_SECRET,
                {
                    expiresIn: "-1s"
                }
            );

        testTokens.add(expiredToken);

        await saveToken(
            user.id,
            expiredToken
        );

        const response =
            await request(app)
                .post("/api/v1/users/refresh")
                .send({
                    token: expiredToken
                });

        expect(response.statusCode)
            .toBe(403);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe("Invalid refresh token");

    });

});