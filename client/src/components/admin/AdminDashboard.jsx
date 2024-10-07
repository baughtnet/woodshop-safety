import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from "../ui/alert";
import TestScores from './TestScores';
import TestManagement from './TestManagement';
import QuestionEditor from './QuestionEditor';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('scores');
  const [error, setError] = useState('');

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Welcome, {user.firstName}! Manage tests and view scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button onClick={() => setActiveView('scores')} variant={activeView === 'scores' ? 'default' : 'outline'}>
                View Scores
              </Button>
              <Button onClick={() => setActiveView('tests')} variant={activeView === 'tests' ? 'default' : 'outline'}>
                Manage Tests
              </Button>
              <Button onClick={() => setActiveView('questions')} variant={activeView === 'questions' ? 'default' : 'outline'}>
                Edit Questions
              </Button>
            </div>
            <Button onClick={onLogout} variant="destructive">Logout</Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {activeView === 'scores' && <TestScores onError={handleError} />}
          {activeView === 'tests' && <TestManagement onError={handleError} />}
          {activeView === 'questions' && <QuestionEditor onError={handleError} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
