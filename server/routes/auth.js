const express = require('express');
const router = express.Router();
const pool = require('../db'); // Make sure you have this file set up with your database connection

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, studentId, pin } = req.body;
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, student_id, pin_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [firstName, lastName, studentId, pin] // Note: In a real app, you should hash the PIN
    );
    res.json({ success: true, userId: result.rows[0].id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { studentId, pin } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE student_id = $1 AND pin_hash = $2',
      [studentId, pin] // Note: In a real app, you should compare hashed PINs
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    res.json({ success: true, user: { id: user.id, firstName: user.first_name, lastName: user.last_name, studentId: user.student_id } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
