const { seedDatabase } = require('../db/seed');

/**
 * Reset Demo Data endpoint
 * Allows judges and presenter to restore the clean state with one click
 */
async function resetDemo(req, res) {
    try {
        await seedDatabase();
        return res.json({
            success: true,
            message: 'CivicSolve demo state has been successfully reset to initial pristine data.',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Reset Demo Error:', err);
        return res.status(500).json({ error: 'Failed to reset demo state.' });
    }
}

module.exports = {
    resetDemo
};
