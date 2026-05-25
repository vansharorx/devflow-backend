const http = require('http');

const { Server } = require('socket.io');

const app = require('./app');

const startCleanupJob = require('./jobs/cleanupJob');

const PORT = process.env.PORT || 2005;

const server = http.createServer(app);

/* Socket.IO */
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

/* Socket Events */
io.on('connection', (socket) => {

    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

});

/* Make io available globally */
app.set('io', io);

/* Start Cron Jobs */
startCleanupJob();

server.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});