const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/available/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching tests for user ID: ${userId}`);

    const result = await pool.query(`
      SELECT t.id, t.name, utr.score, utr.percentage, utr.attempt_timestamp
      FROM tests t
      LEFT JOIN (
        SELECT DISTINCT ON (test_id) 
          test_id, 
          user_id, 
          score, 
          percentage, 
          attempt_timestamp
        FROM user_test_results
        WHERE user_id = $1
        ORDER BY test_id, attempt_timestamp DESC
      ) utr ON t.id = utr.test_id
      ORDER BY t.display_order
    `, [userId]);

    console.log('Raw query result:', JSON.stringify(result.rows, null, 2));

    const now = new Date();
    const availableTests = result.rows.map(test => {
      console.log(`Processing test: ${test.name}`);
      console.log(`Test percentage: ${test.percentage}`);
      
      const lastAttempt = test.attempt_timestamp ? new Date(test.attempt_timestamp) : null;
      console.log(`Last attempt: ${lastAttempt}`);
      
      const timeSinceLastAttempt = lastAttempt ? (now - lastAttempt) / 1000 / 60 : null;
      console.log(`Time since last attempt (minutes): ${timeSinceLastAttempt}`);
      
      const passed = test.percentage != null && test.percentage >= 95;
      console.log(`Passed: ${passed}`);
      
      const isAvailable = !lastAttempt || timeSinceLastAttempt > 5 || passed;
      console.log(`Is available: ${isAvailable}`);

      return {
        id: test.id,
        name: test.name,
        score: test.score,
        percentage: test.percentage,
        passed: passed,
        isAvailable: isAvailable,
        timeoutRemaining: passed ? 0 : (isAvailable ? 0 : Math.max(0, 5 - timeSinceLastAttempt))
      };
    });

    console.log('Sending available tests:', JSON.stringify(availableTests, null, 2));
    res.json(availableTests);
  } catch (err) {
    console.error('Error fetching available tests:', err);
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

router.post('/:testId/submit', async (req, res) => {
  try {
    const { testId } = req.params;
    const { userId, answers, score, timeSpent } = req.body;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertResult = await client.query(
        'INSERT INTO user_test_results (user_id, test_id, score, answers, attempt_timestamp, time_spent) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5) RETURNING id, percentage, passed',
        [userId, testId, score, JSON.stringify(answers), timeSpent]
      );

      const { id: userTestResultId, percentage, passed } = insertResult.rows[0];

      // Store failed questions
      const questions = await client.query('SELECT id, correct_answer FROM questions WHERE test_id = $1', [testId]);
      for (let question of questions.rows) {
        if (answers[question.id] !== question.correct_answer) {
          await client.query(
            'INSERT INTO failed_questions (user_test_result_id, question_id, selected_answer) VALUES ($1, $2, $3)',
            [userTestResultId, question.id, answers[question.id]]
          );
        }
      }

      await client.query('COMMIT');
      res.json({ message: 'Test submitted successfully', percentage, passed });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error submitting test results:', error);
    res.status(500).json({ error: 'Failed to submit test results' });
  }
});

router.get('/:testId/review/:userId', async (req, res) => {
  try {
    const { testId, userId } = req.params;
    const result = await pool.query(`
      SELECT q.question_text, fq.selected_answer
      FROM failed_questions fq
      JOIN questions q ON fq.question_id = q.id
      JOIN user_test_results utr ON fq.user_test_result_id = utr.id
      WHERE utr.user_id = $1 AND utr.test_id = $2
      AND utr.attempt_timestamp = (
        SELECT MAX(attempt_timestamp)
        FROM user_test_results
        WHERE user_id = $1 AND test_id = $2
      )
    `, [userId, testId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching failed questions for review:', err);
    res.status(500).json({ error: 'Failed to fetch review questions' });
  }
});


module.exports = router;
