const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all users and their test scores
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, u.shop_class, 
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

router.patch('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { cohortId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET cohort_id = $1 WHERE id = $2 RETURNING *',
      [cohortId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
});

// Get all tests (only active)
router.get('/tests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tests WHERE is_active = TRUE ORDER BY display_order');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tests:', err);
    res.status(500).json({ error: 'Error fetching tests', details: err.message });
  }
});

router.get('/tests/:testId/questions', async (req, res) => {
  const { testId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM questions WHERE test_id = $1 AND is_active = TRUE', [testId]);
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
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.student_id, 
        u.shop_class,
        u.last_login,
        t.name AS test_name, 
        utr.score, 
        utr.attempt_timestamp
      FROM 
        users u
      LEFT JOIN 
        user_test_results utr ON u.id = utr.user_id
      LEFT JOIN 
        tests t ON utr.test_id = t.id
      ORDER BY 
        u.last_name, u.first_name, utr.attempt_timestamp DESC
    `);

    // Process the result to group by student
    const studentsProgress = result.rows.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          first_name: row.first_name,
          last_name: row.last_name,
          student_id: row.student_id,
          shop_class: row.shop_class,
          last_login: row.last_login,
          test_results: []
        };
      }
      if (row.test_name) {
        acc[row.id].test_results.push({
          test_name: row.test_name,
          score: row.score,
          attempt_date: row.attempt_timestamp
        });
      }
      return acc;
    }, {});

    res.json(Object.values(studentsProgress));
  } catch (error) {
    console.error('Error fetching students progress:', error);
    res.status(500).json({ error: 'An error occurred while fetching students progress.' });
  }
});

// Update test details
router.put('/tests/:testId', async (req, res) => {
  const { testId } = req.params;
  const { name, description, display_order, total_questions, time_limit, max_retries } = req.body;
  
  console.log(`Attempting to update test with ID: ${testId}`);
  console.log('Update data:', { name, description, display_order, total_questions, time_limit, max_retries });

  try {
    const result = await pool.query(
      'UPDATE tests SET name = $1, description = $2, display_order = $3, total_questions = $4, time_limit = $5, max_retries = $6 WHERE id = $7 RETURNING *',
      [name, description, display_order, total_questions, time_limit, max_retries, testId]
    );

    console.log(`Query executed. Rows affected: ${result.rowCount}`);

    if (result.rows.length === 0) {
      console.log(`No test found with ID: ${testId}`);
      return res.status(404).json({ error: 'Test not found' });
    }

    console.log(`Test updated successfully. Updated test:`, result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating test:', err);
    res.status(500).json({ error: 'Error updating test', details: err.message });
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

router.post('/tests', async (req, res) => {
  const { name, description, display_order, time_limit, max_retries } = req.body;
  console.log('Attempting to create a new test:', { name, description, display_order, time_limit, max_retries });

  try {
    const result = await pool.query(
      'INSERT INTO tests (name, description, display_order, time_limit, max_retries) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, display_order, time_limit, max_retries]
    );

    console.log('New test created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating test:', err);
    res.status(500).json({ error: 'Error creating test', details: err.message });
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

// Soft delete a question
router.delete('/questions/:questionId', async (req, res) => {
  const { questionId } = req.params;
  console.log(`Attempting to soft delete question with ID: ${questionId}`);

  try {
    const result = await pool.query(
      'UPDATE questions SET is_active = FALSE WHERE id = $1 RETURNING *',
      [questionId]
    );

    if (result.rows.length === 0) {
      console.log(`No question found with ID: ${questionId}`);
      return res.status(404).json({ error: 'Question not found' });
    }

    console.log(`Question soft deleted successfully. Deleted question:`, result.rows[0]);
    res.json({ message: 'Question soft deleted successfully', deletedQuestion: result.rows[0] });
  } catch (err) {
    console.error('Error soft deleting question:', err);
    res.status(500).json({ error: 'Error soft deleting question', details: err.message });
  }
});

// Soft delete a test
router.delete('/tests/:testId', async (req, res) => {
  const { testId } = req.params;
  console.log(`Attempting to soft delete test with ID: ${testId}`);

  try {
    const result = await pool.query(
      'UPDATE tests SET is_active = FALSE WHERE id = $1 RETURNING *',
      [testId]
    );

    if (result.rows.length === 0) {
      console.log(`No test found with ID: ${testId}`);
      return res.status(404).json({ error: 'Test not found' });
    }

    console.log(`Test soft deleted successfully. Deleted test:`, result.rows[0]);
    res.json({ message: 'Test soft deleted successfully', deletedTest: result.rows[0] });
  } catch (err) {
    console.error('Error soft deleting test:', err);
    res.status(500).json({ error: 'Error soft deleting test', details: err.message });
  }
});

module.exports = router;
