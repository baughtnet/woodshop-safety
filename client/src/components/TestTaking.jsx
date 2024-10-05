import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

const TestTaking = ({ user, testId, onTestComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSkip = () => {
    const skippedQuestion = questions[currentQuestionIndex];
    setQuestions(prev => [...prev.slice(0, currentQuestionIndex), ...prev.slice(currentQuestionIndex + 1), skippedQuestion]);
  };

  const handleSubmit = async () => {
    try {
      const score = questions.reduce((acc, q) => answers[q.id] === q.correct_answer ? acc + 1 : acc, 0);
      await fetch(`http://localhost:3001/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, answers, score })
      });
      onTestComplete(score, questions.length);
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to submit test results');
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>Error: {error}</p>;
  if (questions.length === 0) return <p>No questions available for this test.</p>;

  const currentQuestion = questions[currentQuestionIndex];
  console.log('Current question:', currentQuestion);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{currentQuestion.question_text}</p>
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
          <Button onClick={handleSkip}>Skip</Button>
          <Button onClick={handleNext}>
            {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestTaking;
