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
app.use(cors({
  origin: 'http://localhost:3000', // or whatever your frontend URL is
  credentials: true
}));
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
