const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateAdmin = require('../middleware/authenticateAdmin');

router.get('/scores', authenticateAdmin, async (req, res) => {
    try {
        const scores = await db.query(`
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

// Get all tests
router.get('/tests', authenticateAdmin, async (req, res) => {
    try {
        const tests = await db.query('SELECT * FROM tests ORDER BY created_at DESC');
        res.json(tests.rows);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching tests.' });
    }
});

// Add a new test
router.post('/tests', authenticateAdmin, async (req, res) => {
    const { title, description } = req.body;
    try {
        const newTest = await db.query(
            'INSERT INTO tests (title, description) VALUES ($1, $2) RETURNING *',
            [title, description]
        );
        res.status(201).json(newTest.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the test.' });
    }
});

// Get questions for a specific test
router.get('/tests/:testId/questions', authenticateAdmin, async (req, res) => {
    const { testId } = req.params;
    try {
        const questions = await db.query('SELECT * FROM questions WHERE test_id = $1', [testId]);
        res.json(questions.rows);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching questions.' });
    }
});

// Add a new question to a test
router.post('/tests/:testId/questions', authenticateAdmin, async (req, res) => {
    const { testId } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
    try {
        const newQuestion = await db.query(
            'INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [testId, question_text, option_a, option_b, option_c, option_d, correct_answer]
        );
        res.status(201).json(newQuestion.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the question.' });
    }
});

// Update a question
router.put('/questions/:questionId', authenticateAdmin, async (req, res) => {
    const { questionId } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
    try {
        const updatedQuestion = await db.query(
            'UPDATE questions SET question_text = $1, option_a = $2, option_b = $3, option_c = $4, option_d = $5, correct_answer = $6 WHERE id = $7 RETURNING *',
            [question_text, option_a, option_b, option_c, option_d, correct_answer, questionId]
        );
        res.json(updatedQuestion.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the question.' });
    }
});

module.exports = router;
