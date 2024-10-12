import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const AvailableTests = ({ user, onStartTest, onReviewTest }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/tests/available/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch available tests');
        }
        const data = await response.json();
        console.log('Fetched tests:', data); // Keep this log
        setTests(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchTests();
  }, [user.id]);

  if (loading) return <p>Loading tests...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Available Tests for {user.firstName}</CardTitle>
      </CardHeader>
      <CardContent>
        {tests.map(test => (
          <div key={test.id} className="mb-4 p-4 border rounded">
            <h3 className="text-lg font-semibold">{test.name}</h3>
            {test.percentage != null ? (
              <p>Last attempt: {typeof test.percentage === 'number' ? test.percentage.toFixed(2) : test.percentage}%</p>
            ) : (
              <p>Not attempted yet</p>
            )}
            {test.passed ? (
              <p className="text-green-600">Passed</p>
            ) : test.isAvailable ? (
              <Button onClick={() => onStartTest(test.id)}>Start Test</Button>
            ) : (
              <p>Available in {Math.ceil(test.timeoutRemaining)} minutes</p>
            )}
            {!test.passed && test.percentage != null && (
              <Button onClick={() => onReviewTest(test.id)} className="ml-2">Review Last Attempt</Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AvailableTests;
