const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest.fn().mockResolvedValue(),
}));

const {
    sendVerificationEmailService,
} = require("../../services/emailVerificationService");

const TEST_PASSWORD = "Password123";

let admin;
let manager;
let developer;
let adminToken;
let managerToken;
let developerToken;

const createTestUser = async ({ name, email, role }) => {
    const password = await bcrypt.hash(TEST_PASSWORD, 10);
    const id = Date.now() + Math.floor(Math.random() * 1000000);

    await new Promise((resolve, reject) => {
        db.query(
            `
            INSERT INTO users
            (id, name, email, password, role, is_verified, is_deleted)
            VALUES (?, ?, ?, ?, ?, TRUE, FALSE)
            `,
            [id, name, email, password, role],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });

    return {
        id,
        name,
        email,
        role,
    };
};

const createToken = (user) => {
    return jwt.sign(
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
};

describe("User Routes", () => {
    beforeAll(async () => {
        admin = await createTestUser({
            name: "Test Admin",
            email: `admin-${Date.now()}@example.com`,
            role: "ADMIN",
        });

        manager = await createTestUser({
            name: "Test Manager",
            email: `manager-${Date.now()}@example.com`,
            role: "MANAGER",
        });

        developer = await createTestUser({
            name: "Test Developer",
            email: `developer-${Date.now()}@example.com`,
            role: "DEVELOPER",
        });

        adminToken = createToken(admin);
        managerToken = createToken(manager);
        developerToken = createToken(developer);
    });

    afterAll(async () => {
        await new Promise((resolve, reject) => {
            db.query(
                `
                DELETE FROM refresh_tokens
                WHERE user_id IN (?, ?, ?)
                `,
                [admin.id, manager.id, developer.id],
                (err) => {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });

        await new Promise((resolve, reject) => {
            db.query(
                `
                DELETE FROM users
                WHERE id IN (?, ?, ?)
                `,
                [admin.id, manager.id, developer.id],
                (err) => {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });

        db.end();
    });

    describe("GET /api/v1/users/me", () => {
        test("authenticated user can get their current profile", async () => {
            const response = await request(app)
                .get("/api/v1/users/me")
                .set("Authorization", `Bearer ${developerToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                id: developer.id,
                name: developer.name,
                email: developer.email,
                role: developer.role,
            });

            expect(response.body.data.password).toBeUndefined();
        });

        test("unauthenticated user cannot get current profile", async () => {
            const response = await request(app).get("/api/v1/users/me");

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe("GET /api/v1/users", () => {
        test("admin can get all users", async () => {
            const response = await request(app)
                .get("/api/v1/users")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);

            const returnedUser = response.body.data.find((user) => user.id === developer.id);

            expect(returnedUser).toBeDefined();
            expect(returnedUser.password).toBeUndefined();
        });

        test("manager cannot get all users", async () => {
            const response = await request(app)
                .get("/api/v1/users")
                .set("Authorization", `Bearer ${managerToken}`);

            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
        });

        test("developer cannot get all users", async () => {
            const response = await request(app)
                .get("/api/v1/users")
                .set("Authorization", `Bearer ${developerToken}`);

            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
        });

        test("unauthenticated user cannot get all users", async () => {
            const response = await request(app).get("/api/v1/users");

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/v1/users", () => {
        test("can create a user with valid data", async () => {
            const email = `created-${Date.now()}@example.com`;

            const response = await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Created User",
                    email,
                    password: TEST_PASSWORD,
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User created");

            expect(response.body.data).toMatchObject({
                name: "Created User",
                email,
                role: "DEVELOPER",
            });

            expect(response.body.data.password).toBeUndefined();

            const createdUserId = response.body.data.id;

            const [rows] = await db.promise().query(
                `
                SELECT password, is_verified
                FROM users
                WHERE id = ?
                `,
                [createdUserId]
            );

            expect(rows).toHaveLength(1);
            expect(rows[0].password).not.toBe(TEST_PASSWORD);
            expect(await bcrypt.compare(TEST_PASSWORD, rows[0].password)).toBe(true);
            expect(rows[0].is_verified).toBe(0);

            await db.promise().query(
                "DELETE FROM email_verification_tokens WHERE user_id = ?",
                [createdUserId]
            );

            await db.promise().query("DELETE FROM users WHERE id = ?", [createdUserId]);
        });

        test("user creation requires a name", async () => {
            const response = await request(app)
                .post("/api/v1/users")
                .send({
                    email: `noname-${Date.now()}@example.com`,
                    password: TEST_PASSWORD,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test("user creation requires a valid email", async () => {
            const response = await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Invalid Email User",
                    email: "invalid-email",
                    password: TEST_PASSWORD,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test("user creation requires a password", async () => {
            const response = await request(app)
                .post("/api/v1/users")
                .send({
                    name: "No Password User",
                    email: `nopassword-${Date.now()}@example.com`,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Password is required");
        });

        test("user creation sends a verification email", async () => {
            const email = `verification-${Date.now()}@example.com`;

            const response = await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Verification User",
                    email,
                    password: TEST_PASSWORD,
                });

            expect(response.statusCode).toBe(200);
            expect(sendVerificationEmailService).toHaveBeenCalledWith(email);

            const userId = response.body.data.id;

            await db.promise().query(
                "DELETE FROM email_verification_tokens WHERE user_id = ?",
                [userId]
            );

            await db.promise().query("DELETE FROM users WHERE id = ?", [userId]);
        });
    });

    describe("POST /api/v1/users/login", () => {
        test("verified user can login with valid credentials", async () => {
            const response = await request(app).post("/api/v1/users/login").send({
                email: developer.email,
                password: TEST_PASSWORD,
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Login successful");
            expect(response.body.accessToken).toBeDefined();

            expect(response.body.data).toMatchObject({
                id: developer.id,
                name: developer.name,
                email: developer.email,
                role: developer.role,
            });

            expect(response.body.data.password).toBeUndefined();

            expect(response.headers["set-cookie"]).toEqual(
                expect.arrayContaining([expect.stringContaining("refreshToken=")])
            );

            await db.promise().query(
                "DELETE FROM refresh_tokens WHERE user_id = ?",
                [developer.id]
            );
        });

        test("invalid credentials are rejected", async () => {
            const response = await request(app).post("/api/v1/users/login").send({
                email: developer.email,
                password: "WrongPassword123",
            });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid email or password");
        });

        test("non-existent user cannot login", async () => {
            const response = await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: `does-not-exist-${Date.now()}@example.com`,
                    password: TEST_PASSWORD,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid email or password");
        });

        test("unverified user cannot login", async () => {
            const email = `unverified-${Date.now()}@example.com`;
            const password = await bcrypt.hash(TEST_PASSWORD, 10);
            const id = Date.now() + 2000000;

            await db.promise().query(
                `
                INSERT INTO users
                (id, name, email, password, role, is_verified, is_deleted)
                VALUES (?, ?, ?, ?, ?, FALSE, FALSE)
                `,
                [id, "Unverified User", email, password, "DEVELOPER"]
            );

            const response = await request(app).post("/api/v1/users/login").send({
                email,
                password: TEST_PASSWORD,
            });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "Please verify your email before logging in."
            );

            await db.promise().query("DELETE FROM users WHERE id = ?", [id]);
        });
    });

    describe("POST /api/v1/users/refresh", () => {
        test("refresh requires a refresh token cookie", async () => {
            const response = await request(app).post("/api/v1/users/refresh");

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Refresh token required");
        });

        test("invalid refresh token is rejected", async () => {
            const response = await request(app)
                .post("/api/v1/users/refresh")
                .set("Cookie", "refreshToken=invalid-refresh-token");

            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Token not valid");
        });

        test("valid refresh token returns a new access token", async () => {
            const refreshToken = jwt.sign(
                {
                    id: developer.id,
                },
                process.env.JWT_REFRESH_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            await db.promise().query(
                `
                INSERT INTO refresh_tokens (user_id, token)
                VALUES (?, ?)
                `,
                [developer.id, refreshToken]
            );

            const response = await request(app)
                .post("/api/v1/users/refresh")
                .set("Cookie", `refreshToken=${refreshToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.accessToken).toBeDefined();

            const decoded = jwt.verify(
                response.body.accessToken,
                process.env.JWT_SECRET
            );

            expect(decoded.id).toBe(developer.id);

            await db.promise().query(
                "DELETE FROM refresh_tokens WHERE token = ?",
                [refreshToken]
            );
        });
    });

    describe("POST /api/v1/users/logout", () => {
        test("logout succeeds without a refresh token", async () => {
            const response = await request(app).post("/api/v1/users/logout");

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Logged out successfully");
        });

        test("logout deletes the refresh token", async () => {
            const refreshToken = jwt.sign(
                {
                    id: developer.id,
                },
                process.env.JWT_REFRESH_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            await db.promise().query(
                `
                INSERT INTO refresh_tokens (user_id, token)
                VALUES (?, ?)
                `,
                [developer.id, refreshToken]
            );

            const response = await request(app)
                .post("/api/v1/users/logout")
                .set("Cookie", `refreshToken=${refreshToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            const [rows] = await db.promise().query(
                "SELECT * FROM refresh_tokens WHERE token = ?",
                [refreshToken]
            );

            expect(rows).toHaveLength(0);

            expect(response.headers["set-cookie"]).toEqual(
                expect.arrayContaining([expect.stringContaining("refreshToken=")])
            );
        });
    });

    describe("PUT /api/v1/users/change-password", () => {
        test("authenticated user can change their password", async () => {
            const response = await request(app)
                .put("/api/v1/users/change-password")
                .set("Authorization", `Bearer ${developerToken}`)
                .send({
                    currentPassword: TEST_PASSWORD,
                    newPassword: "NewPassword123",
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Password changed successfully");

            const [rows] = await db.promise().query(
                "SELECT password FROM users WHERE id = ?",
                [developer.id]
            );

            expect(rows).toHaveLength(1);
            expect(await bcrypt.compare("NewPassword123", rows[0].password)).toBe(true);

            await db.promise().query(
                "UPDATE users SET password = ? WHERE id = ?",
                [await bcrypt.hash(TEST_PASSWORD, 10), developer.id]
            );
        });

        test("unauthenticated user cannot change password", async () => {
            const response = await request(app)
                .put("/api/v1/users/change-password")
                .send({
                    currentPassword: TEST_PASSWORD,
                    newPassword: "NewPassword123",
                });

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test("incorrect current password is rejected", async () => {
            const response = await request(app)
                .put("/api/v1/users/change-password")
                .set("Authorization", `Bearer ${developerToken}`)
                .send({
                    currentPassword: "WrongPassword123",
                    newPassword: "NewPassword123",
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Current password is incorrect");
        });

        test("new password cannot be the same as current password", async () => {
            const response = await request(app)
                .put("/api/v1/users/change-password")
                .set("Authorization", `Bearer ${developerToken}`)
                .send({
                    currentPassword: TEST_PASSWORD,
                    newPassword: TEST_PASSWORD,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "New password cannot be the same as the current password"
            );
        });
    });

    describe("PUT /api/v1/users/:id", () => {
        test("admin can update a user", async () => {
            const target = await createTestUser({
                name: "Update Target",
                email: `update-target-${Date.now()}@example.com`,
                role: "DEVELOPER",
            });

            const response = await request(app)
                .put(`/api/v1/users/${target.id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Updated Target",
                    email: target.email,
                    role: "MANAGER",
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data).toMatchObject({
                id: String (target.id),
                name: "Updated Target",
                email: target.email,
                role: "MANAGER",
            });

            const [rows] = await db.promise().query(
                `
                SELECT name, email, role
                FROM users
                WHERE id = ?
                `,
                [target.id]
            );

            expect(rows[0]).toMatchObject({
                name: "Updated Target",
                email: target.email,
                role: "MANAGER",
            });

            await db.promise().query("DELETE FROM users WHERE id = ?", [target.id]);
        });

        test("manager cannot update a user", async () => {
            const response = await request(app)
                .put(`/api/v1/users/${developer.id}`)
                .set("Authorization", `Bearer ${managerToken}`)
                .send({
                    name: "Unauthorized Update",
                });

            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
        });

        test("developer cannot update a user", async () => {
            const response = await request(app)
                .put(`/api/v1/users/${manager.id}`)
                .set("Authorization", `Bearer ${developerToken}`)
                .send({
                    name: "Unauthorized Update",
                });

            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
        });

        test("admin cannot update a non-existent user", async () => {
            const response = await request(app)
                .put("/api/v1/users/999999999999")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Missing User",
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("User not found");
        });
    });

    describe("POST /api/v1/users/profile-image", () => {
        test("unauthenticated user cannot upload a profile image", async () => {
            const response = await request(app)
                .post("/api/v1/users/profile-image");

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test("authenticated user must provide an image", async () => {
            const response = await request(app)
                .post("/api/v1/users/profile-image")
                .set("Authorization", `Bearer ${developerToken}`);

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Please select an image.");
        });
    });
});