import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import StudentProgress from './StudentProgress';
import UserManagement from './UserManagement';
import TestManagement from './TestManagement';
import QuestionManagement from './QuestionManagement';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('students');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Button onClick={() => setActiveSection('students')}>Student Progress</Button>
          <Button onClick={() => setActiveSection('users')}>User Management</Button>
          <Button onClick={() => setActiveSection('tests')}>Tests</Button>
          <Button onClick={() => setActiveSection('questions')}>Questions</Button>
        </div>
        {activeSection === 'students' && <StudentProgress />}
        {activeSection === 'users' && <UserManagement />}
        {activeSection === 'tests' && <TestManagement />}
        {activeSection === 'questions' && <QuestionManagement />}
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
