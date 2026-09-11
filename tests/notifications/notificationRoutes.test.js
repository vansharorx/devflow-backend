const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

const mockIo = {
    emit: jest.fn(),
};

app.set("io", mockIo);

describe("Notification Routes", () => {
    let user;
    let otherUser;
    let token;
    let notificationId;

    const query = (sql, values = []) =>
        new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

    beforeAll(async () => {
        user = {
            id: Date.now(),
            name: "Notification Test User",
            email: `notification-test-${Date.now()}@example.com`,
        };

        otherUser = {
            id: user.id + 1,
            name: "Other Notification User",
            email: `notification-other-${Date.now()}@example.com`,
        };

        await query(
            `
                INSERT INTO users
                (id, name, email, password, role, is_verified, is_deleted)
                VALUES
                (?, ?, ?, ?, 'DEVELOPER', TRUE, FALSE),
                (?, ?, ?, ?, 'DEVELOPER', TRUE, FALSE)
            `,
            [
                user.id,
                user.name,
                user.email,
                "test-password",
                otherUser.id,
                otherUser.name,
                otherUser.email,
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

        notificationId = Date.now() + 2;

        await query(
            `
                INSERT INTO notifications
                (id, user_id, message, is_read)
                VALUES (?, ?, ?, FALSE)
            `,
            [notificationId, user.id, "Test notification"]
        );

        await query(
            `
                INSERT INTO notifications
                (id, user_id, message, is_read)
                VALUES (?, ?, ?, FALSE)
            `,
            [
                notificationId + 1,
                otherUser.id,
                "Other user's notification",
            ]
        );
    });

    afterAll(async () => {
        await query(
            "DELETE FROM notifications WHERE user_id IN (?, ?)",
            [user.id, otherUser.id]
        );

        await query("DELETE FROM users WHERE id IN (?, ?)", [
            user.id,
            otherUser.id,
        ]);

        db.end();
    });

    test("authenticated user can get their notifications", async () => {
        const response = await request(app)
            .get("/api/v1/notifications")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);

        const notification = response.body.data.find(
            (item) => item.id === notificationId
        );

        expect(notification).toBeDefined();
        expect(notification.message).toBe("Test notification");
        expect(notification.user_id).toBe(user.id);
    });

    test("notifications belong only to the authenticated user", async () => {
        const response = await request(app)
            .get("/api/v1/notifications")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        const otherUserNotification = response.body.data.find(
            (item) => item.message === "Other user's notification"
        );

        expect(otherUserNotification).toBeUndefined();
    });

    test("unauthenticated user cannot get notifications", async () => {
        const response = await request(app).get("/api/v1/notifications");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("authenticated user can mark a notification as read", async () => {
        const response = await request(app)
            .put(`/api/v1/notifications/${notificationId}/read`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Notification marked as read");

        const rows = await query(
            "SELECT is_read FROM notifications WHERE id = ?",
            [notificationId]
        );

        expect(rows).toHaveLength(1);
        expect(rows[0].is_read).toBe(1);
    });
});
