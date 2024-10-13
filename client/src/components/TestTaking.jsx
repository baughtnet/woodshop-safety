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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour in seconds
  const [showSummary, setShowSummary] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/tests/${testId}/questions`);
        if (!response.ok) {
          throw new Error('Failed to fetch test questions');
        }
        const data = await response.json();
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
    setProgress((currentQuestionIndex / questions.length) * 100);
  }, [currentQuestionIndex, questions.length]);


  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    setFlaggedQuestions(prev => prev.filter(id => id !== questionId));
    setSkippedQuestions(prev => prev.filter(id => id !== questionId));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    const currentQuestionId = questions[currentQuestionIndex].id;
    if (!skippedQuestions.includes(currentQuestionId)) {
      setSkippedQuestions(prev => [...prev, currentQuestionId]);
    }
    handleNext();
  };

  const handleFlag = () => {
    const currentQuestionId = questions[currentQuestionIndex].id;
    setFlaggedQuestions(prev => 
      prev.includes(currentQuestionId)
        ? prev.filter(id => id !== currentQuestionId)
        : [...prev, currentQuestionId]
    );
  };

  const handleSubmit = useCallback(async () => {
    try {
      const score = questions.reduce((acc, q) => answers[q.id] === q.correct_answer ? acc + 1 : acc, 0);
      const timeSpent = 3600 - timeRemaining;
      const response = await fetch(`http://localhost:3001/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          answers,
          score,
          timeSpent
        }),
      });
      const data = await response.json();
      if (response.ok) {
        onTestComplete(score, questions.length, data.percentage, data.passed);
      } else {
        throw new Error(data.error || 'Failed to submit test results');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to submit test results');
    }
  }, [testId, user.id, answers, questions, onTestComplete, timeRemaining]);

  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowSummary(false);
  };

  useEffect(() => {
  const timer = setInterval(() => {
    setTimeRemaining((prevTime) => {
      if (prevTime <= 0) {
        clearInterval(timer);
        handleSubmit();
        return 0;
      }
      return prevTime - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [handleSubmit]);


  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>Error: {error}</p>;
  if (questions.length === 0) return <p>No questions available for this test.</p>;

  if (showSummary) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.map((question, index) => (
            <div key={question.id} className="mb-4 p-2 border rounded">
              <p className="font-bold">Question {index + 1}: {question.question_text}</p>
              <p>Your answer: {answers[question.id] || 'Not answered'}</p>
              <p>Status: {
                flaggedQuestions.includes(question.id) ? 'Flagged' :
                skippedQuestions.includes(question.id) ? 'Skipped' :
                answers[question.id] ? 'Answered' : 'Not answered'
              }</p>
              <Button onClick={() => handleGoToQuestion(index)}>Review Question</Button>
            </div>
          ))}
          <Button onClick={handleSubmit}>Confirm and Submit</Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
        <div>Time Remaining: {minutes}:{seconds < 10 ? '0' : ''}{seconds}</div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent>
        <p className="mb-4">{currentQuestion.question_text}</p>
        {flaggedQuestions.includes(currentQuestion.id) && (
          <p className="text-yellow-500 mb-2">This question is flagged for review.</p>
        )}
        {currentQuestion.answers && currentQuestion.answers.length > 0 ? (
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
        ) : (
          <p>No answer options available for this question.</p>
        )}
        <div className="flex justify-between mt-4">
          <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous</Button>
          <Button onClick={handleSkip}>Skip</Button>
          <Button onClick={handleFlag}>
            {flaggedQuestions.includes(currentQuestion.id) ? 'Unflag' : 'Flag for Review'}
          </Button>
          <Button onClick={handleNext}>
            {currentQuestionIndex === questions.length - 1 ? 'Review' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestTaking;
