const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest.fn().mockResolvedValue(),
}));

const testEmails = new Set();

describe("DELETE /api/v1/users/:id", () => {
    let adminToken;
    let developerToken;
    let userId;
    let developerId;

    beforeAll(async () => {
        const timestamp = Date.now();

        const adminEmail = `delete-admin-${timestamp}@devflow.test`;
        const developerEmail = `delete-developer-${timestamp}@devflow.test`;
        const targetEmail = `delete-target-${timestamp}@devflow.test`;

        testEmails.add(adminEmail);
        testEmails.add(developerEmail);
        testEmails.add(targetEmail);

        // Create admin
        const adminResponse = await request(app).post("/api/v1/users").send({
            name: "Delete Admin Test User",
            email: adminEmail,
            password: "TestPassword123!",
        });

        expect(adminResponse.statusCode).toBe(200);

        const adminUser = adminResponse.body.data;

        await new Promise((resolve, reject) => {
            db.query(
                "UPDATE users SET role = 'ADMIN' WHERE email = ?",
                [adminEmail],
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                }
            );
        });

        adminToken = jwt.sign(
            {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: "ADMIN",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m",
            }
        );

        // Create active developer who will test the 403 case
        const developerResponse = await request(app)
            .post("/api/v1/users")
            .send({
                name: "Delete Developer Test User",
                email: developerEmail,
                password: "TestPassword123!",
            });

        expect(developerResponse.statusCode).toBe(200);

        const developerUser = developerResponse.body.data;

        developerId = developerUser.id;

        developerToken = jwt.sign(
            {
                id: developerUser.id,
                name: developerUser.name,
                email: developerUser.email,
                role: "DEVELOPER",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m",
            }
        );

        // Create separate target user that admin will delete
        const targetResponse = await request(app)
            .post("/api/v1/users")
            .send({
                name: "Delete Target Test User",
                email: targetEmail,
                password: "TestPassword123!",
            });

        expect(targetResponse.statusCode).toBe(200);

        const targetUser = targetResponse.body.data;

        userId = targetUser.id;
    });

    afterAll((done) => {
        const emails = [...testEmails];

        if (emails.length === 0) {
            db.end();
            done();
            return;
        }

        const placeholders = emails.map(() => "?").join(",");

        db.query(
            `DELETE FROM users WHERE email IN (${placeholders})`,
            emails,
            () => {
                db.end();
                done();
            }
        );
    });

    test("allows an admin to soft-delete a user", async () => {
        const response = await request(app)
            .delete(`/api/v1/users/${userId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("User deleted successfully");

        const databaseUser = await new Promise((resolve, reject) => {
            db.query(
                "SELECT id, is_deleted FROM users WHERE id = ?",
                [userId],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(results[0]);
                }
            );
        });

        expect(databaseUser).toBeDefined();
        expect(databaseUser.is_deleted).toBe(1);
    });

    test("deleted user is no longer returned by the current-user endpoint", async () => {
        const deletedUserToken = jwt.sign(
            {
                id: userId,
                name: "Delete Target Test User",
                email: "deleted-target@devflow.test",
                role: "DEVELOPER",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m",
            }
        );

        const response = await request(app)
            .get("/api/v1/users/me")
            .set("Authorization", `Bearer ${deletedUserToken}`);

        expect(response.statusCode).toBe(401);

        expect(response.body.success).toBe(false);
    });

    test("rejects a developer from deleting a user", async () => {
        const response = await request(app)
            .delete(`/api/v1/users/${developerId}`)
            .set("Authorization", `Bearer ${developerToken}`);

        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe("Access denied");
    });

    test("rejects delete without authentication", async () => {
        const response = await request(app).delete(`/api/v1/users/${userId}`);

        expect(response.statusCode).toBe(401);

        expect(response.body.success).toBe(false);
    });

    test("rejects delete with an invalid access token", async () => {
        const response = await request(app)
            .delete(`/api/v1/users/${userId}`)
            .set("Authorization", "Bearer invalid-access-token");

        expect(response.statusCode).toBe(401);

        expect(response.body.success).toBe(false);
    });

    test("returns 404 when deleting a user that does not exist", async () => {
        const response = await request(app)
            .delete("/api/v1/users/999999999999999")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(404);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe("User not found");
    });
});