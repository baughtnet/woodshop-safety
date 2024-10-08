const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  const userId = req.user.id; // Assuming you have user info in req.user
  try {
    const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (result.rows[0] && result.rows[0].is_admin) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error checking admin status' });
  }
};

// Get all users and their test scores
router.get('/users', isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, 
             json_agg(json_build_object('test_id', utr.test_id, 'score', utr.score, 'percentage', utr.percentage)) as test_results
      FROM users u
      LEFT JOIN user_test_results utr ON u.id = utr.user_id
      GROUP BY u.id
      ORDER BY u.last_name, u.first_name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

// Get all tests
router.get('/tests', isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tests ORDER BY display_order');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tests' });
  }
});

// Update test details
router.put('/tests/:testId', isAdmin, async (req, res) => {
  const { testId } = req.params;
  const { name, description, total_questions, display_order } = req.body;
  try {
    await pool.query(
      'UPDATE tests SET name = $1, description = $2, total_questions = $3, display_order = $4 WHERE id = $5',
      [name, description, total_questions, display_order, testId]
    );
    res.json({ message: 'Test updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating test' });
  }
});

// Get questions for a specific test
router.get('/tests/:testId/questions', isAdmin, async (req, res) => {
  const { testId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM questions WHERE test_id = $1', [testId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching questions' });
  }
});

// Update a question
router.put('/questions/:questionId', isAdmin, async (req, res) => {
  const { questionId } = req.params;
  const { question_text, answers, correct_answer } = req.body;
  try {
    await pool.query(
      'UPDATE questions SET question_text = $1, answers = $2, correct_answer = $3 WHERE id = $4',
      [question_text, JSON.stringify(answers), correct_answer, questionId]
    );
    res.json({ message: 'Question updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating question' });
  }
});

module.exports = router;
