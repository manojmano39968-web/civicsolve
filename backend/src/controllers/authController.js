const db = require('../db');

/**
 * Demo Login: Allows instant switching between demo roles without password friction
 */
async function demoLogin(req, res) {
    try {
        const { role, userId } = req.body;

        let queryStr = 'SELECT * FROM users WHERE ';
        let params = [];

        if (userId) {
            queryStr += 'id = $1';
            params = [userId];
        } else if (role) {
            queryStr += 'role = $1 LIMIT 1';
            params = [role.toLowerCase()];
        } else {
            // Default to Citizen (Kavitha Rajan)
            queryStr += 'role = $1 LIMIT 1';
            params = ['citizen'];
        }

        const result = await db.query(queryStr, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Demo user not found for specified role.' });
        }

        const user = result.rows[0];

        // Fetch user's skills
        const skillsRes = await db.query(`
            SELECT s.id, s.name, s.category, us.proficiency
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = $1
        `, [user.id]);

        user.skills = skillsRes.rows;

        return res.json({
            token: `demo-jwt-token-${user.id}-${user.role}`,
            user,
            message: `Logged in as ${user.name} (${user.role.toUpperCase()}) in Demo Mode`
        });
    } catch (err) {
        console.error('Demo Login Error:', err);
        return res.status(500).json({ error: 'Failed to complete demo login.' });
    }
}

/**
 * Get current authenticated user profile
 */
async function getCurrentUser(req, res) {
    try {
        const userId = req.query.userId || 1;
        const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = result.rows[0];
        const skillsRes = await db.query(`
            SELECT s.id, s.name, s.category, us.proficiency
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = $1
        `, [user.id]);
        user.skills = skillsRes.rows;

        return res.json({ user });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch user profile.' });
    }
}

module.exports = {
    demoLogin,
    getCurrentUser
};
