const db = require('../db');

/**
 * List users with skills
 */
async function getUsers(req, res) {
    try {
        const { role } = req.query;
        let queryStr = `SELECT * FROM users WHERE 1=1`;
        const params = [];
        if (role) {
            queryStr += ` AND role = $1`;
            params.push(role.toLowerCase());
        }
        queryStr += ` ORDER BY id ASC`;

        const uRes = await db.query(queryStr, params);
        const users = uRes.rows;

        for (const u of users) {
            const sRes = await db.query(`
                SELECT s.name, s.category, us.proficiency
                FROM user_skills us
                JOIN skills s ON us.skill_id = s.id
                WHERE us.user_id = $1
            `, [u.id]);
            u.skills = sRes.rows;
        }

        return res.json({ users });
    } catch (err) {
        console.error('Get Users Error:', err);
        return res.status(500).json({ error: 'Failed to retrieve users.' });
    }
}

/**
 * Get single user profile with teams and assigned tasks
 */
async function getUserProfile(req, res) {
    try {
        const { id } = req.params;
        const uRes = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
        if (uRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const user = uRes.rows[0];

        // Skills
        const sRes = await db.query(`
            SELECT s.id, s.name, s.category, us.proficiency
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = $1
        `, [id]);
        user.skills = sRes.rows;

        // Active Teams
        const tRes = await db.query(`
            SELECT t.id, t.name, t.status, tm.role as member_role, c.id as challenge_id, c.title as challenge_title, c.location
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            JOIN challenges c ON t.challenge_id = c.id
            WHERE tm.user_id = $1
        `, [id]);
        user.teams = tRes.rows;

        // Assigned Tasks
        const taskRes = await db.query(`
            SELECT t.*, tm.name as team_name
            FROM tasks t
            JOIN teams tm ON t.team_id = tm.id
            WHERE t.assigned_to = $1
            ORDER BY t.id ASC
        `, [id]);
        user.assigned_tasks = taskRes.rows;

        return res.json({ user });
    } catch (err) {
        console.error('Get User Profile Error:', err);
        return res.status(500).json({ error: 'Failed to retrieve user profile.' });
    }
}

/**
 * Reverse Matching: Get recommended problems for a specific student/expert
 */
async function getUserRecommendations(req, res) {
    try {
        const { id } = req.params;
        const uRes = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
        if (uRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const user = uRes.rows[0];

        // Fetch user skills
        const sRes = await db.query(`
            SELECT s.name, us.proficiency
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = $1
        `, [id]);
        const userSkillNames = sRes.rows.map(s => s.name.toLowerCase());

        // Fetch all challenges
        const cRes = await db.query(`SELECT * FROM challenges ORDER BY id ASC`);
        const challenges = cRes.rows;

        const recommendations = [];

        for (const c of challenges) {
            const csRes = await db.query(`
                SELECT s.name FROM challenge_skills cs
                JOIN skills s ON cs.skill_id = s.id
                WHERE cs.challenge_id = $1
            `, [c.id]);
            const reqSkills = csRes.rows.map(s => s.name);

            // Compute reverse match score
            let skillHits = 0;
            const matchedSkills = [];
            reqSkills.forEach(req => {
                const rLow = req.toLowerCase();
                if (userSkillNames.some(us => us.includes(rLow) || rLow.includes(us))) {
                    skillHits++;
                    matchedSkills.push(req);
                }
            });

            let matchScore = 55;
            if (reqSkills.length > 0) {
                const ratio = skillHits / reqSkills.length;
                if (ratio >= 0.5) matchScore = Math.round(75 + ratio * 20);
                else if (skillHits > 0) matchScore = Math.round(65 + ratio * 15);
                else matchScore = 48;
            }

            // Location bonus
            if (user.location && c.location && user.location.toLowerCase() === c.location.toLowerCase()) {
                matchScore += 4;
            }

            matchScore = Math.min(96, Math.max(45, matchScore));

            recommendations.push({
                challenge_id: c.id,
                title: c.title,
                category: c.category,
                location: c.location,
                severity: c.severity,
                status: c.status,
                required_skills: reqSkills,
                matched_skills: matchedSkills,
                match_score: matchScore,
                reason: `${matchedSkills.length} overlapping skill${matchedSkills.length === 1 ? '' : 's'} with your expertise profile in ${user.location}.`
            });
        }

        recommendations.sort((a, b) => b.match_score - a.match_score);

        return res.json({
            user: { id: user.id, name: user.name, role: user.role, location: user.location },
            recommendations
        });
    } catch (err) {
        console.error('Get Recommendations Error:', err);
        return res.status(500).json({ error: 'Failed to compute challenge recommendations.' });
    }
}

module.exports = {
    getUsers,
    getUserProfile,
    getUserRecommendations
};
