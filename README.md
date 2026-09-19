# DevFlow Backend

Backend API for **DevFlow**, a full-stack issue tracking and project management platform.

Built with Node.js, Express.js and MySQL, the backend provides authentication, role-based authorization, project and issue management, collaboration features, notifications, real-time communication and email workflows.

---

## Features

- JWT Authentication
- Refresh Token Authentication
- HTTP-only Refresh Token Cookies
- Google OAuth
- Email Verification
- Password Reset
- Role-Based Access Control
- Project Membership Authorization
- Project Management
- Issue Tracking
- Issue Assignment
- Issue Status Management
- Issue Comments
- Activity Timeline
- Notifications
- Dashboard Analytics
- Soft Delete & Restore
- File Uploads
- Email Notifications
- Real-Time Updates with Socket.IO
- API Rate Limiting
- Input Validation
- Security Headers with Helmet
- Swagger API Documentation
- Docker Support
- GitHub Actions CI/CD
- Automated API Testing

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | REST API |
| MySQL | Database |
| JWT | Authentication |
| Passport.js | Google OAuth |
| bcrypt | Password hashing |
| Socket.IO | Real-time communication |
| Multer | File uploads |
| Nodemailer | Email services |
| Swagger | API documentation |
| Jest | Testing |
| Supertest | API testing |
| Docker | Containerization |
| GitHub Actions | CI/CD |
| Winston | Logging |
| Helmet | HTTP security |
| express-validator | Request validation |

---

## Architecture

```text
                    ┌──────────────────┐
                    │   React Frontend │
                    └────────┬─────────┘
                             │
                   REST API / Socket.IO
                             │
                             ▼
                    ┌──────────────────┐
                    │  Express Server  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │    Middleware    │
                    │                  │
                    │ Auth             │
                    │ Authorization    │
                    │ Validation       │
                    │ Rate Limiting    │
                    │ File Upload      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Controllers    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Services     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      Models      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      MySQL       │
                    └──────────────────┘
```

---

## Backend Structure

```text
devflow-backend/
│
├── config/
├── controllers/
├── database/
├── jobs/
├── middleware/
├── models/
├── routes/
│   └── v1/
├── services/
├── tests/
├── uploads/
├── logs/
│
├── app.js
├── server.js
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Authentication Flow

DevFlow uses short-lived access tokens together with refresh tokens.

```text
Login
  │
  ▼
Credentials / Google OAuth
  │
  ▼
Authentication
  │
  ├── Access Token
  │      └── Short-lived JWT
  │
  └── Refresh Token
         └── HTTP-only Cookie
```

Refresh tokens are stored server-side and can be invalidated during logout.

---

## Authorization

Protected resources use multiple authorization layers.

```text
Request
   │
   ▼
JWT Authentication
   │
   ▼
Role Authorization
   │
   ▼
Project Membership
   │
   ▼
Protected Resource
```

This allows DevFlow to restrict project and issue operations based on both the user's role and project membership.

---

## Database

The application uses MySQL with the following major entities:

```text
users
projects
project_members
issues
comments
activities
notifications
refresh_tokens
email_verification_tokens
password_reset_tokens
```

The database schema is available in:

```text
database/schema1.sql
```

---

## Local Setup

### Prerequisites

- Node.js
- npm
- MySQL

Docker can also be used for local development.

### 1. Clone the repository

```bash
git clone <YOUR_BACKEND_REPOSITORY_URL>
cd devflow-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.development` based on `.env.example`.

```env
NODE_ENV=development

PORT=2005

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=devflow

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:2005/api/v1/auth/google/callback

FRONTEND_URL=http://localhost:5173
```

Never commit files containing real credentials or secrets.

### 4. Create the database

Run:

```text
database/schema1.sql
```

against your MySQL server.

### 5. Start the server

```bash
node server.js
```

The backend runs at:

```text
http://localhost:2005
```

---

## Docker

Build and start the backend environment:

```bash
docker compose up --build
```

Stop the containers:

```bash
docker compose down
```

---

## API Documentation

Swagger documentation is available locally at:

```text
http://localhost:2005/api-docs
```

It provides an interactive interface for exploring the REST API.

---

## Testing

DevFlow uses Jest and Supertest for API testing.

Run the complete test suite:

```bash
npm test
```

Current test suite:

```text
19 test suites
124 tests
```

The tests cover:

- Authentication
- Login
- Logout
- Refresh tokens
- User management
- Password changes
- Password reset
- Email verification
- Projects
- Project analytics
- Project membership
- Issues
- Comments
- Notifications
- Activities
- Authorization
- Validation
- Error handling

---

## Security

DevFlow includes multiple security mechanisms:

- JWT authentication
- HTTP-only refresh-token cookies
- bcrypt password hashing
- Role-based authorization
- Project membership checks
- Request validation
- Rate limiting
- Helmet security headers
- Configurable CORS
- Server-side refresh-token storage
- Soft deletion of application resources

---

## Real-Time Communication

Socket.IO is used for real-time application events.

```text
React Client
     │
     │ Socket.IO
     ▼
Socket.IO Server
     │
     ▼
DevFlow Application
```

This allows the frontend to receive relevant updates without relying entirely on polling.

---

## Screenshots

Screenshots of the frontend application will be added here.

Suggested screenshots:

- Login
- Dashboard
- Projects
- Issues
- Issue details
- Notifications
- Analytics

---

## Architecture Diagram

A visual architecture diagram will be added to the repository under:

```text
docs/architecture.png
```

---

## Why I Built DevFlow

DevFlow was built to understand how a production-style full-stack application is designed beyond basic CRUD functionality.

The project focuses on authentication, authorization, relational database design, real-time communication, security, testing, Docker and CI/CD.

---

## What I Learned

Through DevFlow, I gained practical experience with:

- Designing layered backend architecture
- Building REST APIs
- Working with relational databases
- Implementing JWT authentication
- Managing refresh tokens
- Implementing OAuth
- Designing authorization middleware
- Protecting project-level resources
- Building email verification and password reset workflows
- Implementing real-time communication
- Writing API integration tests
- Containerizing applications with Docker
- Working with CI/CD
- Managing environment-specific configuration
- Applying security practices to backend APIs

---

## Future Improvements

- Production deployment
- Database migrations
- More granular permissions
- Advanced search and filtering
- Additional real-time events
- Improved observability
- Performance testing
- Expanded edge-case testing

---

## Project Status

DevFlow is an actively developed full-stack project.

The backend currently provides the core APIs for authentication, users, projects, issues, collaboration, notifications and analytics.

---

## License

MIT
