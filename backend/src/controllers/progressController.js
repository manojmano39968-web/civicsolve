const db = require('../db');

const LIFECYCLE_STAGES = [
    { id: 1, name: 'Problem Submitted', default_pct: 15 },
    { id: 2, name: 'AI Categorized', default_pct: 25 },
    { id: 3, name: 'Team Matched', default_pct: 40 },
    { id: 4, name: 'Team Formed', default_pct: 50 },
    { id: 5, name: 'Field Analysis', default_pct: 65 },
    { id: 6, name: 'Solution Developed', default_pct: 80 },
    { id: 7, name: 'Pilot Implementation', default_pct: 90 },
    { id: 8, name: 'Impact Measured', default_pct: 100 }
];

/**
 * Get progress history and current status for challenge
 */
async function getProgress(req, res) {
    try {
        const { id } = req.params; // challenge_id

        const cRes = await db.query(`SELECT * FROM challenges WHERE id = $1`, [id]);
        if (cRes.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }
        const challenge = cRes.rows[0];

        const updatesRes = await db.query(`
            SELECT pu.*, u.name as created_by_name, u.role as created_by_role
            FROM progress_updates pu
            LEFT JOIN users u ON pu.created_by = u.id
            WHERE pu.challenge_id = $1
            ORDER BY pu.created_at ASC
        `, [id]);

        const updates = updatesRes.rows;
        const currentPercentage = updates.length > 0 ? updates[updates.length - 1].percentage : 20;

        return res.json({
            challenge_id: Number(id),
            challenge_status: challenge.status,
            current_percentage: currentPercentage,
            stages: LIFECYCLE_STAGES,
            updates
        });
    } catch (err) {
        console.error('Get Progress Error:', err);
        return res.status(500).json({ error: 'Failed to retrieve progress.' });
    }
}

/**
 * Create a new progress update
 */
async function createProgressUpdate(req, res) {
    try {
        const { id } = req.params; // challenge_id
        const { title, description, percentage, team_id, created_by, new_status } = req.body;

        if (!title || percentage === undefined) {
            return res.status(400).json({ error: 'Title and percentage are required.' });
        }

        const insertRes = await db.query(`
            INSERT INTO progress_updates (challenge_id, team_id, title, description, percentage, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [id, team_id || 1, title, description || '', percentage, created_by || 2]);

        const update = insertRes.rows[0];

        if (new_status) {
            await db.query(`UPDATE challenges SET status = $1 WHERE id = $2`, [new_status, id]);
        }

        const uRes = await db.query(`SELECT name, role FROM users WHERE id = $1`, [update.created_by]);
        if (uRes.rows.length > 0) {
            update.created_by_name = uRes.rows[0].name;
            update.created_by_role = uRes.rows[0].role;
        }

        return res.status(201).json({
            update,
            message: 'Progress update recorded successfully.'
        });
    } catch (err) {
        console.error('Create Progress Error:', err);
        return res.status(500).json({ error: 'Failed to record progress update.' });
    }
}

module.exports = {
    getProgress,
    createProgressUpdate
};
