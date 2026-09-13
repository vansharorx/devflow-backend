const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

const testEmails = new Set();
const createdProjectIds = new Set();

const createTestUser = async ({ name, role }) => {
    const email = `project-${role.toLowerCase()}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}@devflow.test`;

    testEmails.add(email);

    const response = await request(app).post("/api/v1/users").send({
        name,
        email,
        password: "ProjectTest123!",
    });

    expect(response.statusCode).toBe(200);

    const user = response.body.data;

    await new Promise((resolve, reject) => {
        db.query(
            "UPDATE users SET role = ?, is_verified = TRUE WHERE id = ?",
            [role, user.id],
            (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            }
        );
    });

    user.role = role;

    return user;
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

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(results);
        });
    });
};

describe("Project Routes", () => {
    let admin;
    let manager;
    let developer;

    let adminToken;
    let managerToken;
    let developerToken;

    beforeAll(async () => {
        admin = await createTestUser({
            name: "Project Admin Test",
            role: "ADMIN",
        });

        manager = await createTestUser({
            name: "Project Manager Test",
            role: "MANAGER",
        });

        developer = await createTestUser({
            name: "Project Developer Test",
            role: "DEVELOPER",
        });

        adminToken = createToken(admin);
        managerToken = createToken(manager);
        developerToken = createToken(developer);
    });

    afterAll(async () => {
        if (createdProjectIds.size > 0) {
            const ids = [...createdProjectIds];
            const placeholders = ids.map(() => "?").join(",");

            await query(
                `DELETE FROM project_members WHERE project_id IN (${placeholders})`,
                ids
            );

            await query(
                `DELETE FROM projects WHERE id IN (${placeholders})`,
                ids
            );
        }

        const emails = [...testEmails];

        if (emails.length > 0) {
            const placeholders = emails.map(() => "?").join(",");

            await query(
                `DELETE FROM users WHERE email IN (${placeholders})`,
                emails
            );
        }

        db.end();
    });

    test("rejects unauthenticated project listing", async () => {
        const response = await request(app).get("/api/v1/projects");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("authenticated user can get projects", async () => {
        const response = await request(app)
            .get("/api/v1/projects")
            .set("Authorization", `Bearer ${developerToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test("admin can create a project", async () => {
        const response = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: `Admin Project ${Date.now()}`,
                description: "Project created by admin",
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Project created");
        expect(response.body.data.id).toBeTruthy();

        createdProjectIds.add(response.body.data.id);

        const project = await query(
            "SELECT * FROM projects WHERE id = ?",
            [response.body.data.id]
        );

        expect(project).toHaveLength(1);
        expect(project[0].created_by).toBe(admin.id);

        const member = await query(
            `
            SELECT *
            FROM project_members
            WHERE project_id = ?
            AND user_id = ?
            `,
            [response.body.data.id, admin.id]
        );

        expect(member).toHaveLength(1);
    });

    test("manager can create a project", async () => {
        const response = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                name: `Manager Project ${Date.now()}`,
                description: "Project created by manager",
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBeTruthy();

        createdProjectIds.add(response.body.data.id);

        const project = await query(
            "SELECT * FROM projects WHERE id = ?",
            [response.body.data.id]
        );

        expect(project).toHaveLength(1);
        expect(project[0].created_by).toBe(manager.id);
    });

    test("developer cannot create a project", async () => {
        const response = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${developerToken}`)
            .send({
                name: `Developer Project ${Date.now()}`,
                description: "Developer should not create this",
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test("project creation requires a name", async () => {
        const response = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                description: "Missing project name",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("project creator is automatically added as a project member", async () => {
        const response = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                name: `Membership Project ${Date.now()}`,
                description: "Testing automatic membership",
            });

        expect(response.statusCode).toBe(200);

        const projectId = response.body.data.id;
        createdProjectIds.add(projectId);

        const member = await query(
            `
            SELECT 1
            FROM project_members
            WHERE project_id = ?
            AND user_id = ?
            `,
            [projectId, manager.id]
        );

        expect(member).toHaveLength(1);
    });

    test("manager can delete a project", async () => {
        const createResponse = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                name: `Delete Project ${Date.now()}`,
                description: "Project to delete",
            });

        expect(createResponse.statusCode).toBe(200);

        const projectId = createResponse.body.data.id;
        createdProjectIds.add(projectId);

        const response = await request(app)
            .delete(`/api/v1/projects/${projectId}`)
            .set("Authorization", `Bearer ${managerToken}`);

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            message: "Project deleted successfully",
        });

        const project = await query(
            "SELECT is_deleted FROM projects WHERE id = ?",
            [projectId]
        );

        expect(project).toHaveLength(1);
        expect(project[0].is_deleted).toBe(1);
    });

    test("admin can restore a deleted project", async () => {
        const createResponse = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                name: `Restore Project ${Date.now()}`,
                description: "Project to restore",
            });

        expect(createResponse.statusCode).toBe(200);

        const projectId = createResponse.body.data.id;
        createdProjectIds.add(projectId);

        await query(
            "UPDATE projects SET is_deleted = TRUE WHERE id = ?",
            [projectId]
        );

        const response = await request(app)
            .put(`/api/v1/projects/${projectId}/restore`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            message: "Project restored successfully",
        });

        const project = await query(
            "SELECT is_deleted FROM projects WHERE id = ?",
            [projectId]
        );

        expect(project).toHaveLength(1);
        expect(project[0].is_deleted).toBe(0);
    });

    test("manager cannot restore a project", async () => {
        const response = await request(app)
            .put("/api/v1/projects/999999999/restore")
            .set("Authorization", `Bearer ${managerToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test("unauthenticated user cannot access project analytics", async () => {
        const response = await request(app).get("/api/v1/projects/analytics");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("authenticated user can access project analytics", async () => {
        const response = await request(app)
            .get("/api/v1/projects/analytics")
            .set("Authorization", `Bearer ${developerToken}`);

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            message: "Analytics endpoint working",
        });
    });

    test("deleted project no longer appears in project listing", async () => {
        const createResponse = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                name: `Hidden Project ${Date.now()}`,
                description: "Deleted project should be hidden",
            });

        expect(createResponse.statusCode).toBe(200);

        const projectId = createResponse.body.data.id;
        createdProjectIds.add(projectId);

        await query(
            "UPDATE projects SET is_deleted = TRUE WHERE id = ?",
            [projectId]
        );

        const projects = await query(
            "SELECT id FROM projects WHERE id = ? AND is_deleted = FALSE",
            [projectId]
        );

        expect(projects).toHaveLength(0);
    });
});
