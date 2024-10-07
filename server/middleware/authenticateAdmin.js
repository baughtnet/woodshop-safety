const { pool } = require('../index');

const authenticateAdmin = async (req, res, next) => {
    const userId = req.session.userId; // Assuming you're using session-based authentication

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
        if (result.rows.length > 0 && result.rows[0].is_admin) {
            next();
        } else {
            res.status(403).json({ error: 'Access forbidden. Admin rights required.' });
        }
    } catch (error) {
        console.error('Admin authentication error:', error);
        res.status(500).json({ error: 'An error occurred while authenticating.' });
    }
};

module.exports = authenticateAdmin;
