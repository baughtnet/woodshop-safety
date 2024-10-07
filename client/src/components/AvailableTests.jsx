import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const AvailableTests = ({ user, onStartTest, onReviewTest, onLogout }) => {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/tests/available/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch available tests');
        }
        const data = await response.json();
        setTests(data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    fetchTests();
    const interval = setInterval(fetchTests, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [user.id]);

  // const renderTestStatus = (test) => {
  //   if (test.completed) {
  //     return (
  //       <div className="text-right">
  //         <span className="text-green-600 font-bold">Completed</span>
  //         <p>Best Score: {test.best_score}%</p>
  //       </div>
  //     );
  //   } else if (test.is_available) {
  //     return <Button onClick={() => onStartTest(test.id)}>Start Test</Button>;
  //   } else {
  //     return (
  //       <div className="text-right">
  //         <p>Timeout: {Math.ceil(test.timeout_remaining)} minutes</p>
  //         <Button onClick={() => onReviewTest(test.id)}>Review Last Attempt</Button>
  //       </div>
  //     );
  //   }
  // };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Available Tests for {user.firstName}</CardTitle>
        <CardDescription>Select a test to begin, retake, or review your attempts</CardDescription>
      </CardHeader>
      <CardContent>
        {tests.length === 0 ? (
          <p>No tests available at the moment.</p>
        ) : (
          <ul className="space-y-4">
            {tests.map((test) => (
              <li key={test.id} className="flex justify-between items-center">
                <span>{test.name}</span>
                {test.score >= 95 ? (
                  <span className="text-green-600 font-bold">Completed</span>
                ) : test.isAvailable ? (
                  <Button onClick={() => onStartTest(test.id)}>Start Test</Button>
                ) : (
                  <div className="text-right">
                    <p>Timeout: {Math.ceil(test.timeoutRemaining)} minutes</p>
                    <Button onClick={() => onReviewTest(test.id)}>Review Failed Attempt</Button>
                  </div>
                )} 
              </li>
            ))}
          </ul>
        )}
        <Button onClick={onLogout} className="mt-4">Logout</Button>
      </CardContent>
    </Card>
  );
};

export default AvailableTests;
