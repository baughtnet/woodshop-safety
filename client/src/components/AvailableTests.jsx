import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const AvailableTests = ({ user, onStartTest }) => {
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
  }, [user.id]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Available Tests for {user.firstName}</CardTitle>
        <CardDescription>Select a test to begin</CardDescription>
      </CardHeader>
      <CardContent>
        {tests.length === 0 ? (
          <p>No tests available at the moment.</p>
        ) : (
          <ul className="space-y-2">
            {tests.map((test) => (
              <li key={test.id}>
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-between"
                  onClick={() => onStartTest(test.id)}
                >
                  <span>{test.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableTests;
