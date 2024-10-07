require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

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
  const { studentId, pin } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE student_id = $1 AND pin_hash = $2',
      [studentId, pin] // In production, compare hashed PINs
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
    res.json({ 
      success: true, 
      message: 'If a user with this student ID exists, they will receive instructions to reset their PIN.'
    });
  } catch (err) {
    console.error('Forgot PIN error:', err.message);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.get('/api/tests/available/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(`
      SELECT 
        t.id, 
        t.name, 
        t.description,
        COALESCE(ur.best_score, 0) as best_score,
        CASE WHEN ur.best_score >= 95 THEN TRUE ELSE FALSE END as completed,
        CASE 
          WHEN ur.last_attempt IS NULL THEN TRUE
          WHEN ur.best_score >= 95 THEN FALSE
          WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ur.last_attempt)) / 60 >= 5 THEN TRUE
          ELSE FALSE 
        END as is_available,
        CASE 
          WHEN ur.last_attempt IS NULL THEN 0
          WHEN ur.best_score >= 95 THEN 0
          ELSE GREATEST(0, 5 - EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ur.last_attempt)) / 60)
        END as timeout_remaining
      FROM tests t
      LEFT JOIN (
        SELECT test_id, MAX(score) as best_score, MAX(completed_at) as last_attempt
        FROM user_test_results
        WHERE user_id = $1
        GROUP BY test_id
      ) ur ON t.id = ur.test_id
      ORDER BY t.id
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching available tests:', error);
    res.status(500).json({ error: 'Failed to fetch available tests' });
  }
});

app.get('/api/tests/:testId/questions', async (req, res) => {
  const testId = req.params.testId;
  try {
    const result = await pool.query(`
      SELECT id, question_text, answers, correct_answer
      FROM questions
      WHERE test_id = $1
      ORDER BY RANDOM()
    `, [testId]);

    const questions = result.rows.map(q => ({
      id: q.id,
      question_text: q.question_text,
      answers: q.answers,
      correct_answer: q.correct_answer
    }));

    res.json(questions);
  } catch (error) {
    console.error('Error fetching test questions:', error);
    res.status(500).json({ error: 'Failed to fetch test questions' });
  }
});

app.post('/api/tests/:testId/submit', async (req, res) => {
  const { testId } = req.params;
  const { userId, answers, score } = req.body;

  try {
    await pool.query(
      'INSERT INTO user_test_results (user_id, test_id, score, completed_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
      [userId, testId, score]
    );

    res.json({ success: true, message: 'Test results submitted successfully' });
  } catch (error) {
    console.error('Error submitting test results:', error);
    res.status(500).json({ error: 'Failed to submit test results' });
  }
});

// Admin middleware
const authenticateAdmin = async (req, res, next) => {
  const userId = req.headers['user-id']; // Assume user ID is sent in headers
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
    res.status(500).json({ error: 'An error occurred while authenticating.' });
  }
};

// Admin routes
app.get('/api/admin/scores', authenticateAdmin, async (req, res) => {
  try {
    const scores = await pool.query(`
      SELECT u.first_name, u.last_name, t.title, utr.score, utr.completed_at
      FROM user_test_results utr
      JOIN users u ON utr.user_id = u.id
      JOIN tests t ON utr.test_id = t.id
      ORDER BY utr.completed_at DESC
    `);
    res.json(scores.rows);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching scores.' });
  }
});

app.get('/api/admin/tests', authenticateAdmin, async (req, res) => {
  try {
    const tests = await pool.query('SELECT * FROM tests ORDER BY created_at DESC');
    res.json(tests.rows);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching tests.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
