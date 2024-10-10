require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/admin', adminRoutes);

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, timestamp: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the WoodShop Safety Site');
});

// User registration
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, studentId, pin } = req.body;

  // Basic validation
  if (!firstName || !lastName || !studentId || !pin) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (pin.length !== 4 || !/^\d+$/.test(pin)) {
    return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, student_id, pin_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [firstName, lastName, studentId, pin]
    );
    
    console.log('User registered successfully:', result.rows[0]);
    res.json({ success: true, userId: result.rows[0].id });
  } catch (err) {
    console.error('Registration error:', err.message);
    if (err.code === '23505') {
      res.status(409).json({ 
        error: 'User with this student ID already exists',
        message: 'A user with this student ID already exists. Please use a different ID or contact an administrator if you believe this is an error.',
        suggestForgotPin: true
      });
    } else {
      res.status(500).json({ error: 'Registration failed', details: err.message });
    }
  }
});
 
// User login
app.post('/api/login', async (req, res) => {
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
        isAdmin: user.is_admin 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/forgot-pin', async (req, res) => {
  const { studentId } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE student_id = $1', [studentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No user found with this student ID' });
    }

    // In a real application, you would generate a reset token and send an email here
    // For this example, we'll just return a success message
    res.json({ 
      success: true, 
      message: 'If a user with this student ID exists, they will receive instructions to reset their PIN.'
    });
  } catch (err) {
    console.error('Forgot PIN error:', err.message);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
