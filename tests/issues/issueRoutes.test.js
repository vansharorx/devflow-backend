const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

jest.mock("../../services/emailVerificationService", () => ({
    sendVerificationEmailService: jest.fn().mockResolvedValue(),
}));

const testEmails = new Set();
const testProjectIds = new Set();
const testIssueIds = new Set();
const testUserIds = new Set();

const password = "TestPassword123!";

const createUser = async (name, email) => {
    const response = await request(app).post("/api/v1/users").send({
        name,
        email,
        password,
    });

    expect(response.statusCode).toBe(200);

    const user = response.body.data;

    testEmails.add(email);
    testUserIds.add(user.id);

    return user;
};

const setUserRole = async (userId, role) => {
    await new Promise((resolve, reject) => {
        db.query(
            "UPDATE users SET role = ? WHERE id = ?",
            [role, userId],
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

const createAccessToken = (user) => {
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

describe("Issue routes", () => {
    let manager;
    let outsiderManager;
    let developer;
    let project;
    let issue;
    let managerToken;
    let outsiderManagerToken;
    let developerToken;

    beforeAll(async () => {
        app.set("io", {
            emit: jest.fn(),
        });

        manager = await createUser(
            "Issue Manager",
            `issue-manager-${Date.now()}@devflow.test`
        );

        outsiderManager = await createUser(
            "Outsider Manager",
            `issue-outsider-${Date.now()}@devflow.test`
        );

        developer = await createUser(
            "Issue Developer",
            `issue-developer-${Date.now()}@devflow.test`
        );

        await setUserRole(manager.id, "MANAGER");
        await setUserRole(outsiderManager.id, "MANAGER");

        manager.role = "MANAGER";
        outsiderManager.role = "MANAGER";
        developer.role = "DEVELOPER";

        managerToken = createAccessToken(manager);
        outsiderManagerToken = createAccessToken(outsiderManager);
        developerToken = createAccessToken(developer);

        const projectResponse = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                name: `Issue Test Project ${Date.now()}`,
                description: "Project for issue route tests",
            });

        expect(projectResponse.statusCode).toBe(200);

        project = projectResponse.body.data;
        testProjectIds.add(project.id);

        await new Promise((resolve, reject) => {
            db.query(
                `
                INSERT INTO project_members
                (project_id, user_id)
                VALUES (?, ?)
                `,
                [project.id, developer.id],
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                }
            );
        });
    });

    afterAll((done) => {
        const userIds = [...testUserIds];
        const projectIds = [...testProjectIds];
        const issueIds = [...testIssueIds];

        const deleteActivities = () => {
            if (userIds.length === 0) {
                deleteIssues();
                return;
            }

            const placeholders = userIds.map(() => "?").join(",");

            db.query(
                `
                DELETE FROM activities
                WHERE performed_by IN (${placeholders})
                `,
                userIds,
                (err) => {
                    if (err) {
                        console.error(err);
                    }

                    deleteIssues();
                }
            );
        };

        const deleteNotifications = () => {
            if (userIds.length === 0) {
                deleteActivities();
                return;
            }

            const placeholders = userIds.map(() => "?").join(",");

            db.query(
                `
                DELETE FROM notifications
                WHERE user_id IN (${placeholders})
                `,
                userIds,
                (err) => {
                    if (err) {
                        console.error(err);
                    }

                    deleteActivities();
                }
            );
        };

        const deleteIssues = () => {
            if (issueIds.length === 0) {
                deleteProjects();
                return;
            }

            const placeholders = issueIds.map(() => "?").join(",");

            db.query(
                `
                DELETE FROM issues
                WHERE id IN (${placeholders})
                `,
                issueIds,
                (err) => {
                    if (err) {
                        console.error(err);
                    }

                    deleteProjects();
                }
            );
        };

        const deleteProjects = () => {
            if (projectIds.length === 0) {
                deleteUsers();
                return;
            }

            const placeholders = projectIds.map(() => "?").join(",");

            db.query(
                `
                DELETE FROM projects
                WHERE id IN (${placeholders})
                `,
                projectIds,
                (err) => {
                    if (err) {
                        console.error(err);
                    }

                    deleteUsers();
                }
            );
        };

        const deleteUsers = () => {
            if (userIds.length === 0) {
                db.end(done);
                return;
            }

            const placeholders = userIds.map(() => "?").join(",");

            db.query(
                `
                DELETE FROM users
                WHERE id IN (${placeholders})
                `,
                userIds,
                (err) => {
                    if (err) {
                        console.error(err);
                    }

                    db.end(done);
                }
            );
        };

        deleteNotifications();
    });

    test("creates an issue for an authenticated manager", async () => {
        const response = await request(app)
            .post("/api/v1/issues")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "Implement issue tracking tests",
                description: "Add meaningful coverage for issue endpoints",
                projectId: project.id,
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Issue created");

        expect(response.body.data).toBeDefined();

        expect(response.body.data.title).toBe("Implement issue tracking tests");

        expect(response.body.data.projectId).toBe(project.id);

        expect(response.body.data.createdBy).toBe(manager.id);

        expect(response.body.data.status).toBe("OPEN");

        issue = response.body.data;
        testIssueIds.add(issue.id);
    });

    test("rejects issue creation for a developer", async () => {
        const response = await request(app)
            .post("/api/v1/issues")
            .set("Authorization", `Bearer ${developerToken}`)
            .send({
                title: "Developer should not create issue",
                description: "Role authorization test",
                projectId: project.id,
            });

        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);
    });

    test("rejects issue creation when title is missing", async () => {
        const response = await request(app)
            .post("/api/v1/issues")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                description: "Missing title",
                projectId: project.id,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
    });

    test("returns issues for an authenticated project member", async () => {
        const response = await request(app)
            .get("/api/v1/issues")
            .set("Authorization", `Bearer ${developerToken}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(Array.isArray(response.body.data)).toBe(true);

        expect(
            response.body.data.some((item) => item.id === issue.id)
        ).toBe(true);
    });

    test("rejects issue listing without authentication", async () => {
        const response = await request(app).get("/api/v1/issues");

        expect(response.statusCode).toBe(401);

        expect(response.body.success).toBe(false);
    });

    test("allows a project member manager to update issue status", async () => {
        const response = await request(app)
            .put(`/api/v1/issues/${issue.id}/status`)
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                status: "IN_PROGRESS",
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Status updated");

        const databaseIssue = await new Promise((resolve, reject) => {
            db.query(
                "SELECT status FROM issues WHERE id = ?",
                [issue.id],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(results[0]);
                }
            );
        });

        expect(databaseIssue.status).toBe("IN_PROGRESS");
    });

    test("denies issue status update for a manager who is not a project member", async () => {
        const response = await request(app)
            .put(`/api/v1/issues/${issue.id}/status`)
            .set("Authorization", `Bearer ${outsiderManagerToken}`)
            .send({
                status: "CLOSED",
            });

        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(
            "You are not a member of this project"
        );
    });

    test("allows a project member manager to assign an issue", async () => {
        const response = await request(app)
            .put(`/api/v1/issues/${issue.id}/assign`)
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                userId: developer.id,
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Issue assigned successfully");

        const databaseIssue = await new Promise((resolve, reject) => {
            db.query(
                "SELECT assigned_to FROM issues WHERE id = ?",
                [issue.id],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(results[0]);
                }
            );
        });

        expect(databaseIssue.assigned_to).toBe(developer.id);
    });

    test("denies issue assignment for a manager who is not a project member", async () => {
        const response = await request(app)
            .put(`/api/v1/issues/${issue.id}/assign`)
            .set("Authorization", `Bearer ${outsiderManagerToken}`)
            .send({
                userId: developer.id,
            });

        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(
            "You are not a member of this project"
        );
    });

    test("denies issue deletion for a manager who is not a project member", async () => {
        const response = await request(app)
            .delete(`/api/v1/issues/${issue.id}`)
            .set("Authorization", `Bearer ${outsiderManagerToken}`);

        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(
            "You are not a member of this project"
        );
    });

    test("allows a project member manager to delete an issue", async () => {
        const response = await request(app)
            .delete(`/api/v1/issues/${issue.id}`)
            .set("Authorization", `Bearer ${managerToken}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Issue deleted successfully");

        const databaseIssue = await new Promise((resolve, reject) => {
            db.query(
                "SELECT is_deleted FROM issues WHERE id = ?",
                [issue.id],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(results[0]);
                }
            );
        });

        expect(databaseIssue.is_deleted).toBe(1);
    });
});