const express = require('express');
const router = express.Router();
const pool = require('../db'); // Assuming you have a db connection setup

// Get available tests for a user
router.get('/available/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM tests WHERE id NOT IN (SELECT test_id FROM user_test_results WHERE user_id = $1)',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch available tests' });
  }
});

// Get questions for a specific test
router.get('/:testId/questions', async (req, res) => {
  try {
    const { testId } = req.params;
    const result = await pool.query(
      'SELECT * FROM questions WHERE test_id = $1',
      [testId]
    );
    console.log('Raw question data:', result.rows);
    const questions = result.rows.map(q => {
      console.log(`Question ${q.id} data:`, q);
      let parsedAnswers = q.answers;
      if (typeof q.answers === 'string') {
        try {
          parsedAnswers = JSON.parse(q.answers);
        } catch (parseError) {
          console.error(`Error parsing answers for question ${q.id}:`, parseError);
          parsedAnswers = [];
        }
      }
      return {
        ...q,
        answers: Array.isArray(parsedAnswers) ? parsedAnswers.sort(() => Math.random() - 0.5) : []
      };
    });
    res.json(questions.sort(() => Math.random() - 0.5));
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to fetch test questions', details: err.message });
  }
});

// Submit test results
router.post('/:testId/submit', async (req, res) => {
  try {
    const { testId } = req.params;
    const { userId, answers, score } = req.body;
    await pool.query(
      'INSERT INTO user_test_results (user_id, test_id, score, answers) VALUES ($1, $2, $3, $4)',
      [userId, testId, score, JSON.stringify(answers)]
    );
    res.json({ message: 'Test results submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit test results' });
  }
});

module.exports = router;
