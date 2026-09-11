const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

describe("Activity Routes", () => {
    let user;
    let token;
    let activityId;

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
        user = {
            id: Date.now(),
            name: "Activity Test User",
            email: `activity-test-${Date.now()}@example.com`,
        };

        await query(
            `
                INSERT INTO users
                (id, name, email, password, role, is_verified, is_deleted)
                VALUES (?, ?, ?, ?, 'DEVELOPER', TRUE, FALSE)
            `,
            [
                user.id,
                user.name,
                user.email,
                "test-password",
            ]
        );

        token = jwt.sign(
            {
                id: user.id,
                role: "DEVELOPER",
            },
            process.env.JWT_SECRET
        );

        activityId = Date.now() + 1;

        await query(
            `
                INSERT INTO activities
                (id, action, entity_type, entity_id, performed_by)
                VALUES (?, ?, ?, ?, ?)
            `,
            [
                activityId,
                "TEST_ACTIVITY",
                "ISSUE",
                123456,
                user.id,
            ]
        );
    });

    afterAll(async () => {
        await query("DELETE FROM activities WHERE performed_by = ?", [
            user.id,
        ]);

        await query("DELETE FROM users WHERE id = ?", [user.id]);

        db.end();
    });

    test("authenticated user can get activities", async () => {
        const response = await request(app)
            .get("/api/v1/activities")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);

        const activity = response.body.data.find(
            (item) => item.id === activityId
        );

        expect(activity).toBeDefined();
        expect(activity.action).toBe("TEST_ACTIVITY");
        expect(activity.entity_type).toBe("ISSUE");
        expect(activity.entity_id).toBe(123456);
        expect(activity.performed_by).toBe(user.id);
    });

    test("unauthenticated user cannot get activities", async () => {
        const response = await request(app).get("/api/v1/activities");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("invalid token cannot get activities", async () => {
        const response = await request(app)
            .get("/api/v1/activities")
            .set("Authorization", "Bearer invalid-token");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });
});