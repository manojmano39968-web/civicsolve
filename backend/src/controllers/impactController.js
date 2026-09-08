const db = require('../db');

/**
 * Get impact metrics for challenge (clearly labeled Demo / Pilot Data)
 */
async function getImpact(req, res) {
    try {
        const { id } = req.params; // challenge_id

        const cRes = await db.query(`SELECT id, title, location, status FROM challenges WHERE id = $1`, [id]);
        if (cRes.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }
        const challenge = cRes.rows[0];

        const metricsRes = await db.query(`SELECT * FROM impact_metrics WHERE challenge_id = $1 ORDER BY id ASC`, [id]);

        return res.json({
            challenge,
            data_type: 'Demo / Pilot Data',
            notice: 'Metrics represent simulated pilot benchmarks for evaluation purposes.',
            metrics: metricsRes.rows
        });
    } catch (err) {
        console.error('Get Impact Error:', err);
        return res.status(500).json({ error: 'Failed to retrieve impact metrics.' });
    }
}

/**
 * Add or update impact metric
 */
async function saveImpactMetric(req, res) {
    try {
        const { id } = req.params; // challenge_id
        const { metric_name, baseline_value, target_value, current_value, unit } = req.body;

        if (!metric_name || !baseline_value || !current_value) {
            return res.status(400).json({ error: 'Metric name, baseline, and current value are required.' });
        }

        const insertRes = await db.query(`
            INSERT INTO impact_metrics (challenge_id, metric_name, baseline_value, target_value, current_value, unit)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [id, metric_name, String(baseline_value), String(target_value || baseline_value), String(current_value), unit || '']);

        return res.status(201).json({
            metric: insertRes.rows[0],
            message: 'Impact metric recorded.'
        });
    } catch (err) {
        console.error('Save Impact Error:', err);
        return res.status(500).json({ error: 'Failed to save impact metric.' });
    }
}

module.exports = {
    getImpact,
    saveImpactMetric
};
