const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all users and their test scores
router.get('/users', async (req, res) => {
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
router.get('/tests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tests ORDER BY display_order');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tests:', err);
    res.status(500).json({ error: 'Error fetching tests', details: err.message });
  }
});

router.get('/tests/:testId/questions', async (req, res) => {
  const { testId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM questions WHERE test_id = $1', [testId]);
    console.log('Raw database result:', result.rows); // Log raw database result
    
    const formattedQuestions = result.rows.map(question => {
      let answers = [];
      if (question.answers) {
        if (Array.isArray(question.answers)) {
          // If answers is already an array, use it directly
          answers = question.answers;
        } else if (typeof question.answers === 'string') {
          // If answers is a string, try to parse it as JSON first
          try {
            answers = JSON.parse(question.answers);
          } catch (e) {
            // If parsing fails, split by common delimiters
            const possibleDelimiters = ['\n', ';', ','];
            for (const delimiter of possibleDelimiters) {
              if (question.answers.includes(delimiter)) {
                answers = question.answers.split(delimiter).map(answer => answer.trim());
                break;
              }
            }
            // If no delimiter was found, use the whole string as a single answer
            if (answers.length === 0) {
              answers = [question.answers.trim()];
            }
          }
        }
      }
      console.log(`Processed answers for question ${question.id}:`, answers); // Log processed answers
      
      return {
        id: question.id,
        question_text: question.question_text,
        answers: answers,
        correct_answer: question.correct_answer
      };
    });
    
    console.log('Formatted questions:', formattedQuestions); // Log formatted questions
    res.json(formattedQuestions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Error fetching questions', details: err.message });
  }
});


// router.get('/user-progress/:userId', async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const result = await pool.query(`
//       SELECT t.name AS test_name, utr.score, utr.percentage, utr.attempt_timestamp
//       FROM user_test_results utr
//       JOIN tests t ON utr.test_id = t.id
//       WHERE utr.user_id = $1
//       ORDER BY utr.attempt_timestamp DESC
//     `, [userId]);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching user progress:', error);
//     res.status(500).json({ error: 'Failed to fetch user progress' });
//   }
// });

router.get('/students-progress', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.student_id,
             json_agg(json_build_object(
               'test_name', t.name,
               'percentage', utr.percentage
             )) as test_results
      FROM users u
      LEFT JOIN user_test_results utr ON u.id = utr.user_id
      LEFT JOIN tests t ON utr.test_id = t.id
      GROUP BY u.id, u.first_name, u.last_name, u.student_id
      ORDER BY u.last_name, u.first_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students progress:', error);
    res.status(500).json({ error: 'Failed to fetch students progress' });
  }
});

// Update test details
router.put('/tests/:testId', async (req, res) => {
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
router.get('/tests/:testId/questions', async (req, res) => {
  const { testId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM questions WHERE test_id = $1', [testId]);
    console.log('Raw database result:', result.rows); // Log raw database result
    
    const formattedQuestions = result.rows.map(question => {
      let answers = [];
      if (question.answers) {
        // Try to split answers by common delimiters
        const possibleDelimiters = ['\n', ';', ','];
        for (const delimiter of possibleDelimiters) {
          if (question.answers.includes(delimiter)) {
            answers = question.answers.split(delimiter).map(answer => answer.trim());
            break;
          }
        }
        // If no delimiter was found, use the whole string as a single answer
        if (answers.length === 0) {
          answers = [question.answers.trim()];
        }
      }
      console.log(`Processed answers for question ${question.id}:`, answers); // Log processed answers
      
      return {
        id: question.id,
        question_text: question.question_text,
        answers: answers,
        correct_answer: question.correct_answer
      };
    });
    
    console.log('Formatted questions:', formattedQuestions); // Log formatted questions
    res.json(formattedQuestions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Error fetching questions', details: err.message });
  }
});

// Update a question
router.put('/questions/:questionId', async (req, res) => {
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

router.post('/tests/:testId/questions', async (req, res) => {
  const { testId } = req.params;
  const { question_text, answers, correct_answer } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO questions (test_id, question_text, answers, correct_answer) VALUES ($1, $2, $3, $4) RETURNING *',
      [testId, question_text, JSON.stringify(answers), correct_answer]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding question:', err);
    res.status(500).json({ error: 'Error adding question', details: err.message });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const userResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(userResult.rows[0].count);

    // Get total tests
    const testResult = await pool.query('SELECT COUNT(*) FROM tests');
    const totalTests = parseInt(testResult.rows[0].count);

    // Get total questions
    const questionResult = await pool.query('SELECT COUNT(*) FROM questions');
    const totalQuestions = parseInt(questionResult.rows[0].count);

    // Get recent test results
    const recentTestResults = await pool.query(`
      SELECT u.first_name || ' ' || u.last_name AS user_name, t.name AS test_name, utr.percentage AS score
      FROM user_test_results utr
      JOIN users u ON utr.user_id = u.id
      JOIN tests t ON utr.test_id = t.id
      ORDER BY utr.attempt_timestamp DESC
      LIMIT 5
    `);

    res.json({
      totalUsers,
      totalTests,
      totalQuestions,
      recentTestResults: recentTestResults.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.put('/users/:userId/updatePin', async (req, res) => {
    const { userId } = req.params;
    const { newPin } = req.body;

    if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
        return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET pin_hash = $1 WHERE id = $2 RETURNING id',
            [newPin, userId] // In a real-world scenario, you should hash the PIN before storing
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'PIN updated successfully' });
    } catch (error) {
        console.error('Error updating PIN:', error);
        res.status(500).json({ error: 'An error occurred while updating the PIN.' });
    }
});

router.put('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { first_name, last_name, student_id, shop_class, is_admin } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, student_id = $3, shop_class = $4, is_admin = $5 WHERE id = $6 RETURNING *',
      [first_name, last_name, student_id, shop_class, is_admin, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
});

router.delete('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully', deletedUser: result.rows[0] });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'An error occurred while deleting the user.' });
    }
});

module.exports = router;
