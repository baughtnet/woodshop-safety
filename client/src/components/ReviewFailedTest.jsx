import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const ReviewFailedTest = ({ user, testId, onBackToTests }) => {
  const [failedQuestions, setFailedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFailedQuestions = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tests/${testId}/review/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch failed questions');
        }
        const data = await response.json();
        setFailedQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching failed questions:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchFailedQuestions();
  }, [testId, user.id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Review Failed Questions</CardTitle>
        <CardDescription>Review the questions you got wrong in your last attempt</CardDescription>
      </CardHeader>
      <CardContent>
        {failedQuestions.map((question, index) => (
          <div key={index} className="mb-4">
            <p className="font-bold">Question: {question.question_text}</p>
            <p>Your answer: {question.selected_answer}</p>
          </div>
        ))}
        <Button onClick={onBackToTests}>Back to Available Tests</Button>
      </CardContent>
    </Card>
  );
};

export default ReviewFailedTest;
