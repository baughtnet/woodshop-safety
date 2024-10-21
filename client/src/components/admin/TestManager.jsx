import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

const TestManager = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isNewTest, setIsNewTest] = useState(false);
  const [testDetails, setTestDetails] = useState({ name: '', description: '', timeLimit: 60, maxRetries: 0 });
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ question_text: '', answers: '', correct_answer: '' });
  const [error, setError] = useState('');
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [answers, setAnswers] = useState([]);

  const fetchTests = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/tests`);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/tests/${testId}/questions`);
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
    if (selectedTest && !isNewTest) {
      fetchQuestions(selectedTest.id);
      setTestDetails({
        name: selectedTest.name,
        description: selectedTest.description,
        timeLimit: selectedTest.time_limit || 60,
        maxRetries: selectedTest.max_retries || 0
      });
    }
  }, [selectedTest, isNewTest, fetchQuestions]);

  useEffect(() => {
    if (newQuestion.answers) {
      const answerList = newQuestion.answers.split('\n').filter(answer => answer.trim() !== '');
      setAnswers(answerList);
    }
  }, [newQuestion.answers]);

  const handleTestSelect = (testId) => {
    if (testId === 'new') {
      setIsNewTest(true);
      setSelectedTest(null);
      setTestDetails({ name: '', description: '', timeLimit: 60, maxRetries: 0 });
      setQuestions([]);
    } else {
      setIsNewTest(false);
      setSelectedTest(tests.find(test => test.id.toString() === testId));
    }
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isNewTest
        ? `${process.env.REACT_APP_API_URL}/api/admin/tests`
        : `${process.env.REACT_APP_API_URL}/api/admin/tests/${selectedTest.id}`;
      const method = isNewTest ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testDetails,
          time_limit: testDetails.timeLimit,
          max_retries: testDetails.maxRetries
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (isNewTest) {
          setSelectedTest(data);
          setIsNewTest(false);
        }
        fetchTests();
        setError('Test saved successfully');
      } else {
        setError('Failed to save test');
      }
    } catch (error) {
      setError('Error saving test: ' + error.message);
    }
  };

  const handleAnswersChange = (e) => {
    const answerList = e.target.value.split('\n').filter(answer => answer.trim() !== '');
    setNewQuestion({...newQuestion, answers: e.target.value});
    setAnswers(answerList);
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
        ? `${process.env.REACT_APP_API_URL}/api/admin/questions/${editingQuestion.id}`
        : `${process.env.REACT_APP_API_URL}/api/admin/tests/${selectedTest.id}/questions`;
      const method = editingQuestion ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedQuestion),
      });
      if (response.ok) {
        fetchQuestions(selectedTest.id);
        setEditingQuestion(null);
        setNewQuestion({ question_text: '', answers: '', correct_answer: '' });
        setIsQuestionDialogOpen(false);
        setError('Question saved successfully');
      } else {
        setError('Failed to save question');
      }
    } catch (error) {
      setError('Error saving question: ' + error.message);
    }
  };
  

const handleDeleteQuestion = async (questionId) => {
  if (window.confirm('Are you sure you want to delete this question?')) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchQuestions(selectedTest.id);
        setError('Question deleted successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete question');
      }
    } catch (error) {
      setError('Error deleting question: ' + error.message);
    }
  }
};

  const handleDeleteTest = async () => {
    if (!selectedTest) return;

    if (window.confirm(`Are you sure you want to delete the test "${selectedTest.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/tests/${selectedTest.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete test');
        }

        setError('Test deleted successfully');
        setSelectedTest(null);
        fetchTests();
      } catch (error) {
        console.error('Error deleting test:', error);
        setError('Failed to delete test. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Manager</h1>
      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select or Create Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleTestSelect} value={selectedTest?.id || (isNewTest ? 'new' : '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a test or create new" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create New Test</SelectItem>
                {tests.map((test) => (
                  <SelectItem key={test.id} value={test.id.toString()}>
                    {test.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedTest || isNewTest) && (
              <form onSubmit={handleTestSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Test Name</Label>
                  <Input
                    id="name"
                    value={testDetails.name}
                    onChange={(e) => setTestDetails({...testDetails, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={testDetails.description}
                    onChange={(e) => setTestDetails({...testDetails, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={testDetails.timeLimit}
                    onChange={(e) => setTestDetails({...testDetails, timeLimit: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxRetries">Max Retries (0 for unlimited)</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    value={testDetails.maxRetries}
                    onChange={(e) => setTestDetails({...testDetails, maxRetries: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="submit">{isNewTest ? 'Create Test' : 'Update Test'}</Button>
                  {!isNewTest && (
                    <Button type="button" variant="destructive" onClick={handleDeleteTest}>
                      Delete Test
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {selectedTest && !isNewTest && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Questions for {selectedTest.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={() => {
                  setEditingQuestion(null);
                  setNewQuestion({ question_text: '', answers: '', correct_answer: '' });
                  setIsQuestionDialogOpen(true);
                }}>
                  Add New Question
                </Button>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {questions.map((question, index) => (
                  <AccordionItem key={question.id} value={`question-${question.id}`}>
                    <AccordionTrigger>Question {index + 1}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p><strong>Question:</strong> {question.question_text}</p>
                        <p><strong>Answers:</strong></p>
                        <ul className="list-disc pl-5">
                          {question.answers.map((answer, i) => (
                            <li key={i} className={answer === question.correct_answer ? "font-bold" : ""}>
                              {answer} {answer === question.correct_answer && "(Correct)"}
                            </li>
                          ))}
                        </ul>
                        <div className="flex space-x-2">
                          <Button onClick={() => {
                            setEditingQuestion(question);
                            setNewQuestion({
                              question_text: question.question_text,
                              answers: question.answers.join('\n'),
                              correct_answer: question.correct_answer,
                            });
                            setIsQuestionDialogOpen(true);
                          }}>
                            Edit
                          </Button>
                          <Button variant="destructive" onClick={() => handleDeleteQuestion(question.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question-text">Question</Label>
              <Textarea
                id="question-text"
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="answers">Answers (one per line)</Label>
              <Textarea
                id="answers"
                value={newQuestion.answers}
                onChange={handleAnswersChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="correct-answer">Correct Answer</Label>
              <Select
                value={newQuestion.correct_answer}
                onValueChange={(value) => setNewQuestion({...newQuestion, correct_answer: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {answers.map((answer, index) => (
                    <SelectItem key={index} value={answer}>
                      {answer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestManager;
