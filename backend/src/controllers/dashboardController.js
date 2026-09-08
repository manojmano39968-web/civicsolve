const db = require('../db');

/**
 * Get dashboard summary metrics and system diagnostic state
 */
async function getSummary(req, res) {
    try {
        const totalChallengesRes = await db.query(`SELECT COUNT(*) as count FROM challenges`);
        const activeTeamsRes = await db.query(`SELECT COUNT(*) as count FROM teams WHERE status = 'Active'`);
        const solutionsRes = await db.query(`SELECT COUNT(*) as count FROM solutions`);
        const impactChallengesRes = await db.query(`SELECT COUNT(DISTINCT challenge_id) as count FROM impact_metrics`);
        const totalUsersRes = await db.query(`SELECT COUNT(*) as count FROM users`);

        const recentChallengesRes = await db.query(`
            SELECT c.id, c.title, c.category, c.location, c.severity, c.status, c.created_at,
                   u.name as submitter_name
            FROM challenges c
            LEFT JOIN users u ON c.submitted_by = u.id
            ORDER BY c.id DESC
            LIMIT 5
        `);

        // Category distribution
        const catRes = await db.query(`
            SELECT category, COUNT(*) as count
            FROM challenges
            GROUP BY category
            ORDER BY count DESC
        `);

        // Status distribution
        const statusRes = await db.query(`
            SELECT status, COUNT(*) as count
            FROM challenges
            GROUP BY status
        `);

        // Active DB mode
        const dbInfo = db.getActiveMode();

        return res.json({
            metrics: {
                total_challenges: Number(totalChallengesRes.rows[0].count),
                active_teams: Number(activeTeamsRes.rows[0].count),
                solutions_developed: Number(solutionsRes.rows[0].count),
                pilots_initiated: 1, // Hero pilot
                problems_with_impact: Number(impactChallengesRes.rows[0].count),
                registered_contributors: Number(totalUsersRes.rows[0].count)
            },
            status_distribution: statusRes.rows,
            category_distribution: catRes.rows,
            recent_challenges: recentChallengesRes.rows,
            system_diagnostics: {
                database_mode: dbInfo.mode.toUpperCase(),
                database_source: dbInfo.databaseFile,
                is_fallback: dbInfo.isFallback,
                backend_engine: 'Node.js Express + REST APIs',
                ai_engine: 'Python FastAPI (Hybrid NLP & Explainable Scoring)'
            }
        });
    } catch (err) {
        console.error('Dashboard Summary Error:', err);
        return res.status(500).json({ error: 'Failed to retrieve dashboard summary.' });
    }
}

module.exports = {
    getSummary
};
