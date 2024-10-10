import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const QuestionEditor = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
  });
  const [editingQuestion, setEditingQuestion] = useState(null);

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
      const response = await fetch('/api/admin/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data);
      } else {
        console.error('Failed to fetch tests');
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchQuestions = async (testId) => {
    try {
      const response = await fetch(`/api/admin/tests/${testId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        console.error('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (editingQuestion) {
      await handleUpdate();
    } else {
      const response = await fetch(`/api/admin/tests/${selectedTest}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });
      if (response.ok) {
        fetchQuestions(selectedTest);
        setNewQuestion({
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: '',
        });
      } else {
        console.error('Failed to add question');
      }
    }
  } catch (error) {
    console.error('Error adding/updating question:', error);
  }
};

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setNewQuestion(question);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });
      if (response.ok) {
        fetchQuestions(selectedTest);
        setEditingQuestion(null);
        setNewQuestion({
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: '',
        });
      } else {
        console.error('Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Question Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-select">Select Test</Label>
              <Select
                id="test-select"
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
              >
                <option value="">Select a test</option>
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>{test.name}</option>
                ))}
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
              {['a', 'b', 'c', 'd'].map((option) => (
                <div key={option}>
                  <Label htmlFor={`option-${option}`}>Option {option.toUpperCase()}</Label>
                  <Input
                    id={`option-${option}`}
                    name={`option_${option}`}
                    value={newQuestion[`option_${option}`]}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              ))}
              <div>
                <Label htmlFor="correct-answer">Correct Answer</Label>
                <Select
                  id="correct-answer"
                  name="correct_answer"
                  value={newQuestion.correct_answer}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select correct answer</option>
                  {['a', 'b', 'c', 'd'].map((option) => (
                    <option key={option} value={option}>Option {option.toUpperCase()}</option>
                  ))}
                </Select>
              </div>
              <Button type="submit">{editingQuestion ? 'Update Question' : 'Add Question'}</Button>
              {editingQuestion && (
                <Button type="button" onClick={() => setEditingQuestion(null)}>Cancel Edit</Button>
              )}
            </form>
          </div>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{question.question_text}</TableCell>
                    <TableCell>
                      A: {question.option_a}<br />
                      B: {question.option_b}<br />
                      C: {question.option_c}<br />
                      D: {question.option_d}
                    </TableCell>
                    <TableCell>{question.correct_answer.toUpperCase()}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEdit(question)}>Edit</Button>
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
};

export default QuestionEditor;
