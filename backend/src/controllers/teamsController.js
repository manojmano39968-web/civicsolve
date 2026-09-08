const db = require('../db');

/**
 * Form / Create a Team for a challenge
 */
async function createTeam(req, res) {
    try {
        const { challenge_id, name, members } = req.body;

        if (!challenge_id || !name) {
            return res.status(400).json({ error: 'Challenge ID and team name are required.' });
        }

        // Check if team already exists for this challenge
        const existing = await db.query(`SELECT id FROM teams WHERE challenge_id = $1`, [challenge_id]);
        let teamId;
        if (existing.rows.length > 0) {
            teamId = existing.rows[0].id;
            await db.query(`UPDATE teams SET name = $1, status = 'Active' WHERE id = $2`, [name, teamId]);
        } else {
            const teamRes = await db.query(
                `INSERT INTO teams (challenge_id, name, status) VALUES ($1, $2, 'Active') RETURNING id`,
                [challenge_id, name]
            );
            teamId = teamRes.rows[0].id;
        }

        // Add members
        if (Array.isArray(members) && members.length > 0) {
            for (const m of members) {
                const uId = typeof m === 'object' ? m.user_id : m;
                const role = typeof m === 'object' ? (m.role || 'Collaborator') : 'Collaborator';

                // Check if already in team
                const memCheck = await db.query(
                    `SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2`,
                    [teamId, uId]
                );
                if (memCheck.rows.length === 0) {
                    await db.query(
                        `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)`,
                        [teamId, uId, role]
                    );
                }
            }
        }

        // Update challenge status
        await db.query(`UPDATE challenges SET status = 'Team Formed' WHERE id = $1`, [challenge_id]);

        // Fetch populated team
        const fullTeam = await getTeamDetails(teamId);

        return res.status(201).json({
            team: fullTeam,
            message: `Team '${name}' successfully formed.`
        });
    } catch (err) {
        console.error('Create Team Error:', err);
        return res.status(500).json({ error: 'Failed to form team.' });
    }
}

/**
 * Get Team details with members, tasks, comments, and challenge info
 */
async function getTeamById(req, res) {
    try {
        const { id } = req.params;
        const team = await getTeamDetails(id);
        if (!team) {
            return res.status(404).json({ error: 'Team not found.' });
        }
        return res.json({ team });
    } catch (err) {
        console.error('Get Team Error:', err);
        return res.status(500).json({ error: 'Failed to fetch team details.' });
    }
}

async function getTeamDetails(teamId) {
    const tRes = await db.query(`SELECT * FROM teams WHERE id = $1`, [teamId]);
    if (tRes.rows.length === 0) return null;
    const team = tRes.rows[0];

    // Challenge info
    const cRes = await db.query(`SELECT * FROM challenges WHERE id = $1`, [team.challenge_id]);
    team.challenge = cRes.rows[0] || null;

    // Members
    const mRes = await db.query(`
        SELECT tm.role as team_role, u.id, u.name, u.role as user_role, u.institution, u.location
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = $1
    `, [teamId]);
    team.members = mRes.rows;

    // Tasks
    const tasksRes = await db.query(`
        SELECT t.*, u.name as assigned_to_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.team_id = $1
        ORDER BY t.id ASC
    `, [teamId]);
    team.tasks = tasksRes.rows;

    // Comments / Discussion
    const commRes = await db.query(`
        SELECT c.*, u.name as author_name, u.role as author_role, u.institution as author_institution
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.team_id = $1
        ORDER BY c.created_at ASC
    `, [teamId]);
    team.comments = commRes.rows;

    return team;
}

/**
 * Add member to team
 */
async function addTeamMember(req, res) {
    try {
        const { id } = req.params; // team_id
        const { user_id, role } = req.body;

        await db.query(`
            INSERT INTO team_members (team_id, user_id, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role
        `, [id, user_id, role || 'Collaborator']);

        const team = await getTeamDetails(id);
        return res.json({ team, message: 'Member added to team.' });
    } catch (err) {
        console.error('Add Member Error:', err);
        return res.status(500).json({ error: 'Failed to add team member.' });
    }
}

/**
 * Add discussion comment to team
 */
async function addComment(req, res) {
    try {
        const { id } = req.params; // team_id
        const { user_id, content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Comment content is required.' });
        }

        const insertRes = await db.query(`
            INSERT INTO comments (team_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [id, user_id || 2, content]);

        const comment = insertRes.rows[0];

        // Attach author info
        const uRes = await db.query(`SELECT name, role, institution FROM users WHERE id = $1`, [comment.user_id]);
        if (uRes.rows.length > 0) {
            comment.author_name = uRes.rows[0].name;
            comment.author_role = uRes.rows[0].role;
            comment.author_institution = uRes.rows[0].institution;
        }

        return res.status(201).json({ comment, message: 'Comment posted.' });
    } catch (err) {
        console.error('Add Comment Error:', err);
        return res.status(500).json({ error: 'Failed to post comment.' });
    }
}

module.exports = {
    createTeam,
    getTeamById,
    addTeamMember,
    addComment
};
