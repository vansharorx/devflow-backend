const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest
        .fn()
        .mockResolvedValue()
}));

const testEmails = new Set();

describe("PUT /api/v1/users/:id", () => {

    let adminToken;
    let developerToken;
    let userId;

    beforeAll(async () => {

        const adminEmail =
            `update-admin-${Date.now()}@devflow.test`;

        const developerEmail =
            `update-developer-${Date.now()}@devflow.test`;

        testEmails.add(adminEmail);
        testEmails.add(developerEmail);

        const adminResponse =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Update Admin Test User",
                    email: adminEmail,
                    password: "TestPassword123!"
                });

        expect(adminResponse.statusCode)
            .toBe(200);

        const adminUser =
            adminResponse.body.data;

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

        adminToken =
            jwt.sign(
                {
                    id: adminUser.id,
                    name: adminUser.name,
                    email: adminUser.email,
                    role: "ADMIN"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "15m"
                }
            );

        const developerResponse =
            await request(app)
                .post("/api/v1/users")
                .send({
                    name: "Update Developer Test User",
                    email: developerEmail,
                    password: "TestPassword123!"
                });

        expect(developerResponse.statusCode)
            .toBe(200);

        const developerUser =
            developerResponse.body.data;

        userId =
            developerUser.id;

        developerToken =
            jwt.sign(
                {
                    id: developerUser.id,
                    name: developerUser.name,
                    email: developerUser.email,
                    role: "DEVELOPER"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "15m"
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

        const placeholders =
            emails.map(() => "?").join(",");

        db.query(
            `DELETE FROM users WHERE email IN (${placeholders})`,
            emails,
            () => {

                db.end();

                done();

            }
        );

    });

    test("allows an admin to update a user", async () => {

        const response =
            await request(app)
                .put(`/api/v1/users/${userId}`)
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                )
                .send({
                    name: "Updated User"
                });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.success)
            .toBe(true);

    });

    test("rejects a developer from updating a user", async () => {

        const response =
            await request(app)
                .put(`/api/v1/users/${userId}`)
                .set(
                    "Authorization",
                    `Bearer ${developerToken}`
                )
                .send({
                    name: "Unauthorized Update"
                });

        expect(response.statusCode)
            .toBe(403);

        expect(response.body.success)
            .toBe(false);

        expect(response.body.message)
            .toBe("Access denied");

    });

    test("rejects update without authentication", async () => {

        const response =
            await request(app)
                .put(`/api/v1/users/${userId}`)
                .send({
                    name: "Unauthorized Update"
                });

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.success)
            .toBe(false);

    });

    test("rejects update with an invalid access token", async () => {

        const response =
            await request(app)
                .put(`/api/v1/users/${userId}`)
                .set(
                    "Authorization",
                    "Bearer invalid-access-token"
                )
                .send({
                    name: "Unauthorized Update"
                });

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.success)
            .toBe(false);

    });

});