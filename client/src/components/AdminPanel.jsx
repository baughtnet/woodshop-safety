import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import UserManagement from './admin/UserManagement';
import TestManagement from './admin/TestManagement';
import QuestionManagement from './admin/QuestionManagement';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('users');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Button onClick={() => setActiveSection('users')}>Users</Button>
          <Button onClick={() => setActiveSection('tests')}>Tests</Button>
          <Button onClick={() => setActiveSection('questions')}>Questions</Button>
        </div>
        {activeSection === 'users' && <UserManagement />}
        {activeSection === 'tests' && <TestManagement />}
        {activeSection === 'questions' && <QuestionManagement />}
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
