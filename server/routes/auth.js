const express = require('express');
const router = express.Router();
const pool = require('../db');

// Registration route
router.post('/register', async (req, res) => {
  console.log('Registration route hit');
  console.log('Request body: ', req.body);
  try {
    const { firstName, lastName, studentId, pin, shopClass } = req.body;
    console.log('Destructured data: ', { firstName, lastName, studentId, pin, shopClass });
    const result = await pool.query('INSERT INTO users (first_name, last_name, student_id, pin_hash, shop_class) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [firstName, lastName, studentId, pin, shopClass]
    );
    
    res.json({ 
      success: true, 
      userId: result.rows[0].id, 
      insertedData: { firstName, lastName, studentId, pin, shopClass }
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === '23505') { // unique_violation error code
      res.status(400).json({ error: 'Student ID already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { studentId, pin } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE student_id = $1 AND pin_hash = $2',
      [studentId, pin]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        firstName: user.first_name, 
        lastName: user.last_name, 
        studentId: user.student_id,
        isAdmin: user.is_admin,
        shopClass: user.shop_class
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

//Logout route
router.post('/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
});
});

module.exports = router;
