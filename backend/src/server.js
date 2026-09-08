require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { seedDatabase } = require('./db/seed');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root diagnostic route
app.get('/', (req, res) => {
    const dbInfo = db.getActiveMode();
    res.json({
        name: 'CivicSolve API Backend',
        tagline: 'Connect People | Solve Problems | Create Impact',
        status: 'online',
        database: dbInfo,
        endpoints: {
            challenges: '/api/challenges',
            matches: '/api/challenges/1/matches',
            demo_login: '/api/auth/demo-login',
            summary: '/api/dashboard/summary',
            reset: '/api/demo/reset'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        error: 'An internal server error occurred.',
        message: err.message
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await db.initSchema();

        // Check if database needs initial seeding
        const check = await db.query('SELECT COUNT(*) as count FROM challenges');
        if (Number(check.rows[0].count) === 0) {
            console.log('Database empty, automatically running initial seed...');
            await seedDatabase();
        }

        const server = app.listen(PORT, '0.0.0.0', () => {
            const dbInfo = db.getActiveMode();
            console.log(`====================================================`);
            console.log(`🚀 CivicSolve Backend running on http://0.0.0.0:${PORT}`);
            console.log(`📁 Database Mode: ${dbInfo.mode.toUpperCase()}`);
            console.log(`📄 Database Source: ${dbInfo.databaseFile}`);
            console.log(`🤖 AI Service Target: ${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}`);
            console.log(`====================================================`);
        });

        return server;
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
