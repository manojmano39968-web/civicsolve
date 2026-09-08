const db = require('../db');

/**
 * Get tasks for a team
 */
async function getTasksByTeam(req, res) {
    try {
        const { id } = req.params; // team_id
        const result = await db.query(`
            SELECT t.*, u.name as assigned_to_name, u.role as assigned_to_role
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.team_id = $1
            ORDER BY t.id ASC
        `, [id]);
        return res.json({ tasks: result.rows });
    } catch (err) {
        console.error('Get Tasks Error:', err);
        return res.status(500).json({ error: 'Failed to retrieve tasks.' });
    }
}

/**
 * Create task in team
 */
async function createTask(req, res) {
    try {
        const { id } = req.params; // team_id
        const { title, description, assigned_to, due_date, status } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Task title is required.' });
        }

        const insertRes = await db.query(`
            INSERT INTO tasks (team_id, title, description, assigned_to, status, due_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [id, title, description || '', assigned_to || null, status || 'Pending', due_date || 'Upcoming']);

        const task = insertRes.rows[0];
        if (task.assigned_to) {
            const uRes = await db.query(`SELECT name, role FROM users WHERE id = $1`, [task.assigned_to]);
            if (uRes.rows.length > 0) {
                task.assigned_to_name = uRes.rows[0].name;
                task.assigned_to_role = uRes.rows[0].role;
            }
        }

        return res.status(201).json({ task, message: 'Task created.' });
    } catch (err) {
        console.error('Create Task Error:', err);
        return res.status(500).json({ error: 'Failed to create task.' });
    }
}

/**
 * Patch / update task status or details
 */
async function patchTask(req, res) {
    try {
        const { id } = req.params; // task_id
        const { status, title, description, assigned_to, due_date } = req.body;

        const currentRes = await db.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
        if (currentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }
        const current = currentRes.rows[0];

        const updatedStatus = status !== undefined ? status : current.status;
        const updatedTitle = title !== undefined ? title : current.title;
        const updatedDesc = description !== undefined ? description : current.description;
        const updatedAssigned = assigned_to !== undefined ? assigned_to : current.assigned_to;
        const updatedDue = due_date !== undefined ? due_date : current.due_date;

        await db.query(`
            UPDATE tasks
            SET status = $1, title = $2, description = $3, assigned_to = $4, due_date = $5
            WHERE id = $6
        `, [updatedStatus, updatedTitle, updatedDesc, updatedAssigned, updatedDue, id]);

        const finalRes = await db.query(`
            SELECT t.*, u.name as assigned_to_name, u.role as assigned_to_role
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.id = $1
        `, [id]);

        return res.json({ task: finalRes.rows[0], message: 'Task updated successfully.' });
    } catch (err) {
        console.error('Patch Task Error:', err);
        return res.status(500).json({ error: 'Failed to update task.' });
    }
}

module.exports = {
    getTasksByTeam,
    createTask,
    patchTask
};
