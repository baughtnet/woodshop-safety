import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";

const TestTaking = ({ user, testId, onTestComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour in seconds

const handleSubmit = useCallback(async () => {
  try {
    // Calculate raw score (number of correct answers)
    const correctAnswers = questions.reduce((acc, question) => {
      acc[question.id] = question.correct_answer;
      return acc;
    }, {});

    const rawScore = Object.keys(answers).reduce((count, questionId) => {
      return answers[questionId] === correctAnswers[questionId] ? count + 1 : count;
    }, 0);

    console.log('Raw score:', rawScore); // Keeping this log

    const response = await fetch(`http://localhost:3001/api/tests/${testId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, answers, score: rawScore, testId })
    });

    if (!response.ok) {
      throw new Error('Failed to submit test');
    }

    const data = await response.json();
    console.log('Response data:', data); // Keeping this log

    const percentage = data.percentage || (rawScore / questions.length * 100);
    const passed = percentage >= 95;

    onTestComplete(rawScore, questions.length, percentage.toFixed(2), passed);
  } catch (error) {
    console.error('Error submitting test:', error);
    setError('Failed to submit test results');
  }
}, [testId, user.id, answers, questions, onTestComplete]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/tests/${testId}/questions`);
        if (!response.ok) {
          throw new Error('Failed to fetch test questions');
        }
        const data = await response.json();
        console.log('Fetched questions:', data);
        setQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [testId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit]);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleFlag = () => {
    const questionId = questions[currentQuestionIndex].id;
    setFlaggedQuestions(prev => 
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (skippedQuestions.length > 0) {
        const nextSkippedIndex = questions.findIndex(q => q.id === skippedQuestions[0]);
        setCurrentQuestionIndex(nextSkippedIndex);
        setSkippedQuestions(prev => prev.slice(1));
      } else {
        setShowSummary(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    const currentQuestionId = questions[currentQuestionIndex].id;
    setSkippedQuestions(prev => [...prev, currentQuestionId]);
    handleNext();
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>Error: {error}</p>;
  if (questions.length === 0) return <p>No questions available for this test.</p>;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (showSummary) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Total Questions: {questions.length}</p>
          <p>Answered Questions: {Object.keys(answers).length}</p>
          <p>Flagged Questions: {flaggedQuestions.length}</p>
          <p>Unanswered Questions: {questions.length - Object.keys(answers).length}</p>
          <div className="mt-4">
            <h3 className="font-semibold">Question Status:</h3>
            {questions.map((question, index) => (
              <div key={question.id} className="flex justify-between items-center my-2">
                <span>Question {index + 1}:</span>
                <span>
                  {answers[question.id] ? 'Answered' : 'Unanswered'}
                  {flaggedQuestions.includes(question.id) ? ' (Flagged)' : ''}
                </span>
                <Button onClick={() => {
                  setShowSummary(false);
                  setCurrentQuestionIndex(index);
                }}>
                  Review
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button onClick={() => setShowSummary(false)}>Back to Test</Button>
            <Button onClick={handleSubmit}>Submit Test</Button>
          </div>
        </CardContent>
      </Card>
    );
  }


return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
        <Progress value={progress} className="w-full mt-2" />
        <div>Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{currentQuestion.question_text}</p>
        <RadioGroup 
          onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
          value={answers[currentQuestion.id] || ''}
        >
          {currentQuestion.answers.map((answer, index) => (
            <div className="flex items-center space-x-2" key={index}>
              <RadioGroupItem value={answer} id={`answer-${index}`} />
              <Label htmlFor={`answer-${index}`}>{answer}</Label>
            </div>
          ))}
        </RadioGroup>
        <div className="flex justify-between mt-4">
          <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous</Button>
          <Button onClick={handleFlag}>
            {flaggedQuestions.includes(currentQuestion.id) ? 'Unflag' : 'Flag for Review'}
          </Button>
          <Button onClick={handleSkip}>Skip</Button>
          <Button onClick={handleNext}>
            {currentQuestionIndex === questions.length - 1 && skippedQuestions.length === 0 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestTaking;
