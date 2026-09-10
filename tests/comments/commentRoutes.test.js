const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const db = require("../../config/db");

describe("Comment Routes", () => {
    let user;
    let project;
    let issue;
    let token;

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
            name: "Comment Test User",
            email: `comment-test-${Date.now()}@example.com`,
            password: "test-password",
        };

        await query(
            `
                INSERT INTO users
                (id, name, email, password, role, is_verified, is_deleted)
                VALUES (?, ?, ?, ?, 'DEVELOPER', TRUE, FALSE)
            `,
            [user.id, user.name, user.email, user.password]
        );

        project = {
            id: Date.now() + 1,
            name: "Comment Test Project",
        };

        await query(
            `
                INSERT INTO projects
                (id, name, description, created_by, is_deleted)
                VALUES (?, ?, ?, ?, FALSE)
            `,
            [
                project.id,
                project.name,
                "Project for comment route tests",
                user.id,
            ]
        );

        await query(
            `
                INSERT INTO project_members
                (project_id, user_id)
                VALUES (?, ?)
            `,
            [project.id, user.id]
        );

        issue = {
            id: Date.now() + 2,
            title: "Comment Test Issue",
        };

        await query(
            `
                INSERT INTO issues
                (id, title, description, project_id, created_by, status, is_deleted)
                VALUES (?, ?, ?, ?, ?, 'OPEN', FALSE)
            `,
            [
                issue.id,
                issue.title,
                "Issue for comment route tests",
                project.id,
                user.id,
            ]
        );

        token = jwt.sign(
            {
                id: user.id,
                role: "DEVELOPER",
            },
            process.env.JWT_SECRET
        );
    });

    afterAll(async () => {
        await query("DELETE FROM comments WHERE issue_id = ?", [issue.id]);
        await query("DELETE FROM issues WHERE id = ?", [issue.id]);

        await query("DELETE FROM project_members WHERE project_id = ?", [
            project.id,
        ]);

        await query("DELETE FROM projects WHERE id = ?", [project.id]);
        await query("DELETE FROM users WHERE id = ?", [user.id]);

        db.end();
    });

    test("authenticated user can create a comment", async () => {
        const response = await request(app)
            .post("/api/v1/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({
                issueId: issue.id,
                comment: "This is a test comment",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Comment added");
        expect(response.body.data.issueId).toBe(issue.id);
        expect(response.body.data.userId).toBe(user.id);
        expect(response.body.data.comment).toBe("This is a test comment");
    });

    test("unauthenticated user cannot create a comment", async () => {
        const response = await request(app)
            .post("/api/v1/comments")
            .send({
                issueId: issue.id,
                comment: "Unauthorized comment",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("authenticated user can get comments for an issue", async () => {
        await query(
            `
                INSERT INTO comments
                (id, issue_id, user_id, comment)
                VALUES (?, ?, ?, ?)
            `,
            [
                Date.now() + 3,
                issue.id,
                user.id,
                "Existing test comment",
            ]
        );

        const response = await request(app)
            .get(`/api/v1/comments/${issue.id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);

        const comment = response.body.data.find(
            (item) => item.comment === "Existing test comment"
        );

        expect(comment).toBeDefined();
        expect(comment.commented_by).toBe(user.name);
    });

    test("unauthenticated user cannot get comments", async () => {
        const response = await request(app).get(
            `/api/v1/comments/${issue.id}`
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });
});