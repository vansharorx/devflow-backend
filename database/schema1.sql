CREATE DATABASE IF NOT EXISTS devflow;
USE devflow;


-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    role ENUM('ADMIN', 'MANAGER', 'DEVELOPER')
        NOT NULL DEFAULT 'DEVELOPER',

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    profile_image VARCHAR(255) DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================================
-- PROJECTS
-- =========================================================

CREATE TABLE projects (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,

    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_projects_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
);


-- =========================================================
-- PROJECT MEMBERS
-- =========================================================
-- A user can belong to multiple projects.
-- A project can contain multiple users.
-- Composite primary key prevents duplicate membership.

CREATE TABLE project_members (
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (project_id, user_id),

    CONSTRAINT fk_project_members_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_project_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- ISSUES
-- =========================================================

CREATE TABLE issues (
    id BIGINT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    project_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    assigned_to BIGINT DEFAULT NULL,

    status VARCHAR(20) DEFAULT 'OPEN',

    attachment VARCHAR(255) DEFAULT NULL,

    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_issues_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id),

    CONSTRAINT fk_issues_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT fk_issues_assigned_to
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
);


-- =========================================================
-- REFRESH TOKENS
-- =========================================================

CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL,

    token VARCHAR(500) NOT NULL UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- PASSWORD RESET TOKENS
-- =========================================================

CREATE TABLE password_reset_tokens (
    id BIGINT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    token VARCHAR(255) NOT NULL,

    expires_at DATETIME NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- EMAIL VERIFICATION TOKENS
-- =========================================================

CREATE TABLE email_verification_tokens (
    id BIGINT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    token VARCHAR(255) NOT NULL,

    expires_at DATETIME NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_email_verification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- ACTIVITIES
-- =========================================================

CREATE TABLE activities (
    id BIGINT PRIMARY KEY,

    action VARCHAR(255),

    entity_type VARCHAR(50),

    entity_id BIGINT,

    performed_by BIGINT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activities_performed_by
        FOREIGN KEY (performed_by)
        REFERENCES users(id)
);


-- =========================================================
-- COMMENTS
-- =========================================================

CREATE TABLE comments (
    id BIGINT PRIMARY KEY,

    issue_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    comment TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_issue
        FOREIGN KEY (issue_id)
        REFERENCES issues(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    message TEXT,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_users_email
    ON users(email);

CREATE INDEX idx_projects_created_by
    ON projects(created_by);

CREATE INDEX idx_project_members_user_id
    ON project_members(user_id);

CREATE INDEX idx_project_members_project_id
    ON project_members(project_id);

CREATE INDEX idx_issues_project_id
    ON issues(project_id);

CREATE INDEX idx_issues_created_by
    ON issues(created_by);

CREATE INDEX idx_issues_assigned_to
    ON issues(assigned_to);

CREATE INDEX idx_issues_status
    ON issues(status);

CREATE INDEX idx_issues_title
    ON issues(title);

CREATE INDEX idx_comments_issue_id
    ON comments(issue_id);

CREATE INDEX idx_comments_user_id
    ON comments(user_id);

CREATE INDEX idx_notifications_user_id
    ON notifications(user_id);

CREATE INDEX idx_activities_entity
    ON activities(entity_type, entity_id);

CREATE INDEX idx_activities_performed_by
    ON activities(performed_by);


-- =========================================================
-- VERIFICATION
-- =========================================================

SHOW TABLES;

DESCRIBE users;
DESCRIBE projects;
DESCRIBE project_members;
DESCRIBE issues;
DESCRIBE refresh_tokens;
DESCRIBE password_reset_tokens;
DESCRIBE email_verification_tokens;
DESCRIBE activities;
DESCRIBE comments;
DESCRIBE notifications;