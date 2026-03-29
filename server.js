const express = require('express');
const app = express();

app.use(express.json());

// import routes
const userRoutes = require('./routes/userRoutes');

// use routes
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
    res.json({ message: "Server running" });
});

const PORT = 2005;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});