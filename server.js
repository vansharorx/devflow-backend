const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const app = require("./app");
const startCleanupJob = require("./jobs/cleanupJob");

const PORT = process.env.PORT || 2005;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});

// Reject connections without a valid access token.
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token || !process.env.JWT_SECRET) {
            return next(new Error("unauthorized"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id) {
            return next(new Error("unauthorized"));
        }

        socket.userId = String(decoded.id);
        next();
    } catch {
        next(new Error("unauthorized"));
    }
});

// Each socket joins only its authenticated user's room.
io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    console.log(`Authenticated socket connected: ${socket.userId}`);

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.userId}`);
    });
});

// Make Socket.IO available to controllers.
app.set("io", io);

startCleanupJob();

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});