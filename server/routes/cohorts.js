const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all cohorts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cohorts ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cohorts:', error);
    res.status(500).json({ error: 'An error occurred while fetching cohorts.' });
  }
});

// Create a new cohort
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cohorts (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating cohort:', error);
    res.status(500).json({ error: 'An error occurred while creating the cohort.' });
  }
});

// Update a cohort
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cohorts SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cohort not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating cohort:', error);
    res.status(500).json({ error: 'An error occurred while updating the cohort.' });
  }
});

// Delete a cohort
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cohorts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cohort not found.' });
    }
    res.json({ message: 'Cohort deleted successfully.' });
  } catch (error) {
    console.error('Error deleting cohort:', error);
    res.status(500).json({ error: 'An error occurred while deleting the cohort.' });
  }
});

router.get('/:id/users', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT users.id, users.first_name, users.last_name, users.student_id FROM users WHERE shop_class = $1',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cohort users:', error);
    res.status(500).json({ error: 'An error occurred while fetching cohort users.' });
  }
});

// Update users for a specific cohort
router.put('/:id/users', async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;
  try {
    // First, remove all users from this cohort
    await pool.query('UPDATE users SET shop_class = NULL WHERE shop_class = $1', [id]);
    
    // Then, add the selected users to this cohort
    if (userIds && userIds.length > 0) {
      await pool.query('UPDATE users SET shop_class = $1 WHERE id = ANY($2::int[])', [id, userIds]);
    }
    
    res.json({ message: 'Cohort users updated successfully.' });
  } catch (error) {
    console.error('Error updating cohort users:', error);
    res.status(500).json({ error: 'An error occurred while updating cohort users.' });
  }
});

module.exports = router;
