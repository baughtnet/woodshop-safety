import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const TestManager = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newTest, setNewTest] = useState({ name: '', description: '', display_order: 0, total_questions: 0 });
  const [newQuestion, setNewQuestion] = useState({ question_text: '', answers: '', correct_answer: '' });
  const [editingTest, setEditingTest] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [error, setError] = useState('');

  const fetchTests = useCallback(async () => {
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
  }, []);

  const fetchQuestions = useCallback(async (testId) => {
    if (!testId) return;
    try {
      const response = await fetch(`http://localhost:3001/api/admin/tests/${testId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        setError('Failed to fetch questions');
      }
    } catch (error) {
      setError('Error fetching questions: ' + error.message);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  useEffect(() => {
    if (selectedTest) {
      fetchQuestions(selectedTest);
    }
  }, [selectedTest, fetchQuestions]);

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTest
        ? `http://localhost:3001/api/admin/tests/${editingTest.id}`
        : 'http://localhost:3001/api/admin/tests';
      const method = editingTest ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTest || newTest),
      });
      if (response.ok) {
        fetchTests();
        setEditingTest(null);
        setNewTest({ name: '', description: '', display_order: 0, total_questions: 0 });
      } else {
        setError(`Failed to ${editingTest ? 'update' : 'add'} test`);
      }
    } catch (error) {
      setError(`Error ${editingTest ? 'updating' : 'adding'} test: ` + error.message);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    const formattedQuestion = {
      question_text: newQuestion.question_text,
      answers: newQuestion.answers.split('\n').filter(answer => answer.trim() !== ''),
      correct_answer: newQuestion.correct_answer,
    };

    try {
      const url = editingQuestion
        ? `http://localhost:3001/api/admin/questions/${editingQuestion.id}`
        : `http://localhost:3001/api/admin/tests/${selectedTest}/questions`;
      const method = editingQuestion ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedQuestion),
      });
      if (response.ok) {
        fetchQuestions(selectedTest);
        setEditingQuestion(null);
        setNewQuestion({ question_text: '', answers: '', correct_answer: '' });
      } else {
        setError(`Failed to ${editingQuestion ? 'update' : 'add'} question`);
      }
    } catch (error) {
      setError(`Error ${editingQuestion ? 'updating' : 'adding'} question: ` + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      
      <Card>
        <CardHeader>
          <CardTitle>Test Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tests">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tests">Manage Tests</TabsTrigger>
              <TabsTrigger value="questions">Manage Questions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tests">
              <form onSubmit={handleTestSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Test Name</Label>
                  <Input
                    id="name"
                    value={editingTest ? editingTest.name : newTest.name}
                    onChange={(e) => editingTest 
                      ? setEditingTest({...editingTest, name: e.target.value})
                      : setNewTest({...newTest, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingTest ? editingTest.description : newTest.description}
                    onChange={(e) => editingTest
                      ? setEditingTest({...editingTest, description: e.target.value})
                      : setNewTest({...newTest, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={editingTest ? editingTest.display_order : newTest.display_order}
                    onChange={(e) => editingTest
                      ? setEditingTest({...editingTest, display_order: parseInt(e.target.value)})
                      : setNewTest({...newTest, display_order: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="total_questions">Total Questions</Label>
                  <Input
                    id="total_questions"
                    type="number"
                    value={editingTest ? editingTest.total_questions : newTest.total_questions}
                    onChange={(e) => editingTest
                      ? setEditingTest({...editingTest, total_questions: parseInt(e.target.value)})
                      : setNewTest({...newTest, total_questions: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <Button type="submit">{editingTest ? 'Update Test' : 'Add Test'}</Button>
                {editingTest && (
                  <Button type="button" onClick={() => setEditingTest(null)} variant="outline">Cancel Edit</Button>
                )}
              </form>

              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Display Order</TableHead>
                    <TableHead>Total Questions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>{test.description}</TableCell>
                      <TableCell>{test.display_order}</TableCell>
                      <TableCell>{test.total_questions}</TableCell>
                      <TableCell>
                        <Button onClick={() => setEditingTest(test)}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="questions">
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

              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="question-text">Question</Label>
                  <Textarea
                    id="question-text"
                    name="question_text"
                    value={newQuestion.question_text}
                    onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="answers">Answers (separate multiple answers with newlines)</Label>
                  <Textarea
                    id="answers"
                    name="answers"
                    value={newQuestion.answers}
                    onChange={(e) => setNewQuestion({...newQuestion, answers: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="correct-answer">Correct Answer</Label>
                  <Input
                    id="correct-answer"
                    name="correct_answer"
                    value={newQuestion.correct_answer}
                    onChange={(e) => setNewQuestion({...newQuestion, correct_answer: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit">
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </Button>
                {editingQuestion && (
                  <Button type="button" onClick={() => setEditingQuestion(null)} variant="outline">
                    Cancel Edit
                  </Button>
                )}
              </form>

              {questions.length > 0 && (
                <Table className="mt-4">
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestManager;
