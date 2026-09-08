const db = require('../db');
const aiService = require('../services/aiService');

/**
 * Get all challenges with skills and submitter info
 */
async function getChallenges(req, res) {
    try {
        const { category, location, status, submitted_by } = req.query;
        let queryStr = `
            SELECT c.*, u.name as submitter_name, u.role as submitter_role,
                   t.id as team_id, t.name as team_name
            FROM challenges c
            LEFT JOIN users u ON c.submitted_by = u.id
            LEFT JOIN teams t ON c.id = t.challenge_id
            WHERE 1=1
        `;
        const params = [];
        let pIndex = 1;

        if (category) {
            queryStr += ` AND c.category = $${pIndex++}`;
            params.push(category);
        }
        if (location) {
            queryStr += ` AND c.location LIKE $${pIndex++}`;
            params.push(`%${location}%`);
        }
        if (status) {
            queryStr += ` AND c.status = $${pIndex++}`;
            params.push(status);
        }
        if (submitted_by) {
            queryStr += ` AND c.submitted_by = $${pIndex++}`;
            params.push(submitted_by);
        }

        queryStr += ` ORDER BY c.id ASC`;

        const result = await db.query(queryStr, params);
        const challenges = result.rows;

        // Populate skills for each challenge
        for (const c of challenges) {
            const skillsRes = await db.query(`
                SELECT s.id, s.name, s.category
                FROM challenge_skills cs
                JOIN skills s ON cs.skill_id = s.id
                WHERE cs.challenge_id = $1
            `, [c.id]);
            c.required_skills = skillsRes.rows.map(s => s.name);
            c.skills_detail = skillsRes.rows;
        }

        return res.json({ challenges });
    } catch (err) {
        console.error('Get Challenges Error:', err);
        return res.status(500).json({ error: 'Failed to retrieve challenges.' });
    }
}

/**
 * Get single challenge details
 */
async function getChallengeById(req, res) {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT c.*, u.name as submitter_name, u.institution as submitter_institution, u.location as submitter_location
            FROM challenges c
            LEFT JOIN users u ON c.submitted_by = u.id
            WHERE c.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }

        const challenge = result.rows[0];

        // Skills
        const skillsRes = await db.query(`
            SELECT s.id, s.name, s.category
            FROM challenge_skills cs
            JOIN skills s ON cs.skill_id = s.id
            WHERE cs.challenge_id = $1
        `, [id]);
        challenge.required_skills = skillsRes.rows.map(s => s.name);
        challenge.skills_detail = skillsRes.rows;

        // Team
        const teamRes = await db.query(`SELECT * FROM teams WHERE challenge_id = $1 LIMIT 1`, [id]);
        if (teamRes.rows.length > 0) {
            const team = teamRes.rows[0];
            const membersRes = await db.query(`
                SELECT tm.role as team_role, u.id, u.name, u.role as user_role, u.institution, u.location
                FROM team_members tm
                JOIN users u ON tm.user_id = u.id
                WHERE tm.team_id = $1
            `, [team.id]);
            team.members = membersRes.rows;
            challenge.team = team;
        } else {
            challenge.team = null;
        }

        // Solution
        const solRes = await db.query(`SELECT * FROM solutions WHERE challenge_id = $1 LIMIT 1`, [id]);
        challenge.solution = solRes.rows[0] || null;

        // Impact metrics
        const impactRes = await db.query(`SELECT * FROM impact_metrics WHERE challenge_id = $1`, [id]);
        challenge.impact_metrics = impactRes.rows;

        return res.json({ challenge });
    } catch (err) {
        console.error('Get Challenge Error:', err);
        return res.status(500).json({ error: 'Failed to retrieve challenge details.' });
    }
}

/**
 * Submit a new civic challenge
 */
async function createChallenge(req, res) {
    try {
        const { title, description, location, category, severity, submitted_by } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required.' });
        }

        const insertRes = await db.query(`
            INSERT INTO challenges (title, description, category, location, severity, status, submitted_by)
            VALUES ($1, $2, $3, $4, $5, 'Submitted', $6)
            RETURNING *
        `, [
            title,
            description,
            category || 'General Civic Infrastructure',
            location || 'Chennai',
            severity || 'Medium',
            submitted_by || 1
        ]);

        const created = insertRes.rows[0];
        return res.status(201).json({
            challenge: created,
            message: 'Challenge submitted successfully. Proceeding to AI problem categorization.'
        });
    } catch (err) {
        console.error('Create Challenge Error:', err);
        return res.status(500).json({ error: 'Failed to create challenge.' });
    }
}

/**
 * Run AI Analysis on a challenge
 */
async function analyzeChallenge(req, res) {
    try {
        const { id } = req.params;
        const cRes = await db.query(`SELECT * FROM challenges WHERE id = $1`, [id]);

        if (cRes.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
        const challenge = cRes.rows[0];

        // Call AI Service
        const analysis = await aiService.analyzeProblem({
            title: challenge.title,
            description: challenge.description,
            location: challenge.location
        });

        // Update challenge in DB with categorized domain and severity
        await db.query(`
            UPDATE challenges
            SET category = $1, severity = $2, status = 'Analyzed'
            WHERE id = $3
        `, [analysis.category, analysis.severity, id]);

        // Link detected skills to challenge_skills
        for (const skillName of analysis.required_skills) {
            // Find or insert skill
            let sRes = await db.query(`SELECT id FROM skills WHERE LOWER(name) = LOWER($1)`, [skillName]);
            let skillId;
            if (sRes.rows.length === 0) {
                const insSkill = await db.query(
                    `INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING id`,
                    [skillName, analysis.domain]
                );
                skillId = insSkill.rows[0].id;
            } else {
                skillId = sRes.rows[0].id;
            }

            // Link to challenge
            const linkCheck = await db.query(
                `SELECT * FROM challenge_skills WHERE challenge_id = $1 AND skill_id = $2`,
                [id, skillId]
            );
            if (linkCheck.rows.length === 0) {
                await db.query(
                    `INSERT INTO challenge_skills (challenge_id, skill_id) VALUES ($1, $2)`,
                    [id, skillId]
                );
            }
        }

        return res.json({
            challenge_id: Number(id),
            category: analysis.category,
            domain: analysis.domain,
            required_skills: analysis.required_skills,
            severity: analysis.severity,
            keywords: analysis.keywords,
            confidence: analysis.confidence,
            reason: analysis.reason
        });
    } catch (err) {
        console.error('Analyze Challenge Error:', err);
        return res.status(500).json({ error: 'Failed to analyze challenge.' });
    }
}

/**
 * Get AI-assisted ranked candidate matches for challenge
 */
async function getChallengeMatches(req, res) {
    try {
        const { id } = req.params;
        const cRes = await db.query(`SELECT * FROM challenges WHERE id = $1`, [id]);
        if (cRes.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
        const challenge = cRes.rows[0];

        // Fetch required skills
        const reqSkillsRes = await db.query(`
            SELECT s.name FROM challenge_skills cs
            JOIN skills s ON cs.skill_id = s.id
            WHERE cs.challenge_id = $1
        `, [id]);
        challenge.required_skills = reqSkillsRes.rows.map(r => r.name);

        // Fetch candidate users (students, experts, industry partners)
        const candUsersRes = await db.query(`
            SELECT * FROM users
            WHERE role IN ('student', 'expert', 'industry')
            ORDER BY id ASC
        `);
        const candidates = candUsersRes.rows;

        // Fetch skills for each candidate
        for (const cand of candidates) {
            const sRes = await db.query(`
                SELECT s.name, us.proficiency
                FROM user_skills us
                JOIN skills s ON us.skill_id = s.id
                WHERE us.user_id = $1
            `, [cand.id]);
            cand.skills = sRes.rows;
        }

        // Call AI Service Matcher
        const matchResult = await aiService.matchCandidates({
            challenge: {
                id: challenge.id,
                title: challenge.title,
                description: challenge.description,
                category: challenge.category,
                location: challenge.location,
                required_skills: challenge.required_skills
            },
            candidates
        });

        // Persist/update matches in database
        for (const m of matchResult.matches) {
            const existing = await db.query(
                `SELECT id FROM matches WHERE challenge_id = $1 AND user_id = $2`,
                [id, m.user_id]
            );
            if (existing.rows.length > 0) {
                await db.query(
                    `UPDATE matches SET score = $1, reason = $2 WHERE id = $3`,
                    [m.score, m.reason, existing.rows[0].id]
                );
            } else {
                await db.query(
                    `INSERT INTO matches (challenge_id, user_id, score, reason, status) VALUES ($1, $2, $3, $4, 'Suggested')`,
                    [id, m.user_id, m.score, m.reason]
                );
            }
        }

        // Also update challenge status to 'Matching' if currently 'Analyzed'
        if (challenge.status === 'Analyzed') {
            await db.query(`UPDATE challenges SET status = 'Matching' WHERE id = $1`, [id]);
        }

        return res.json(matchResult);
    } catch (err) {
        console.error('Get Challenge Matches Error:', err);
        return res.status(500).json({ error: 'Failed to compute candidate matches.' });
    }
}

module.exports = {
    getChallenges,
    getChallengeById,
    createChallenge,
    analyzeChallenge,
    getChallengeMatches
};
