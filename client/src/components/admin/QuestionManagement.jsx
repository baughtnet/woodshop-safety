import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent } from "../ui/card";

const QuestionManagement = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    answers: '',
    correct_answer: '',
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      fetchQuestions(selectedTest);
    }
  }, [selectedTest]);

  const fetchTests = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data);
      } else {
        setError('Failed to fetch tests');
      }
    } catch (error) {
      setError('Error fetching tests: ' + error.message);
    }
  };

const fetchQuestions = async (testId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/admin/tests/${testId}/questions`);
    if (response.ok) {
      const data = await response.json();
      console.log('Fetched questions:', data); // Log fetched data
      setQuestions(data);
      console.log('Questions state after setting:', questions); // This might show the previous state due to closure
    } else {
      setError('Failed to fetch questions');
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    setError('Error fetching questions: ' + error.message);
  }
};

// Add this useEffect to log questions whenever they change
useEffect(() => {
  console.log('Questions state updated:', questions);
}, [questions]);

// In your render method, before the return statement:
console.log('Current questions state during render:', questions);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedQuestion = {
      question_text: newQuestion.question_text,
      answers: newQuestion.answers.split('\n').filter(answer => answer.trim() !== ''),
      correct_answer: newQuestion.correct_answer,
    };

    try {
      if (editingQuestion) {
        await handleUpdate(formattedQuestion);
      } else {
        await handleAdd(formattedQuestion);
      }
      fetchQuestions(selectedTest);
      resetForm();
    } catch (error) {
      setError('Error adding/updating question: ' + error.message);
    }
  };

  const handleAdd = async (formattedQuestion) => {
    const response = await fetch(`http://localhost:3001/api/admin/tests/${selectedTest}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedQuestion),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  };

  const handleUpdate = async (formattedQuestion) => {
    const response = await fetch(`http://localhost:3001/api/admin/questions/${editingQuestion.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedQuestion),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  };

  const resetForm = () => {
    setNewQuestion({
      question_text: '',
      answers: '',
      correct_answer: '',
    });
    setEditingQuestion(null);
  };

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Label htmlFor="test-select">Select Test</Label>
            <Select value={selectedTest} onValueChange={setSelectedTest}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a test" />
              </SelectTrigger>
              <SelectContent>
                {tests.map((test) => (
                  <SelectItem key={test.id} value={test.id.toString()}>
                    {test.name || `Test ${test.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question-text">Question</Label>
              <Textarea
                id="question-text"
                name="question_text"
                value={newQuestion.question_text}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="answers">Answers (separate multiple answers with newlines)</Label>
              <Textarea
                id="answers"
                name="answers"
                value={newQuestion.answers}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="correct-answer">Correct Answer</Label>
              <Input
                id="correct-answer"
                name="correct_answer"
                value={newQuestion.correct_answer}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit">
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
            {editingQuestion && (
              <Button type="button" onClick={resetForm} variant="outline">
                Cancel Edit
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Answers</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{question.question_text}</TableCell>
                    <TableCell>
                      {question.answers && question.answers.length > 0 ? (
                        <ul>
                          {question.answers.map((answer, index) => (
                            <li key={index}>{answer}</li>
                          ))}
                        </ul>
                      ) : (
                        <div>No answers available</div>
                      )}
                    </TableCell>
                    <TableCell>{question.correct_answer}</TableCell>
                    <TableCell>
                      <Button onClick={() => {
                        setEditingQuestion(question);
                        setNewQuestion({
                          question_text: question.question_text,
                          answers: Array.isArray(question.answers) ? question.answers.join('\n') : '',
                          correct_answer: question.correct_answer || '',
                        });
                      }}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
)}
    </div>
  );
}
