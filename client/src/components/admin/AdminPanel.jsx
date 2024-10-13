import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import UserManagement from './UserManagement';
import TestManagement from './TestManagement';
import QuestionManagement from './QuestionManagement';
import StudentProgress from './StudentProgress';
import Dashboard from './Dashboard'; // New import

const AdminPanel = ({ onSwitchtoUserView }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUserView, setIsUserView] = useState(false);

  const handleSwitchChange = (checked) => {
    setIsUserView(checked);
    if (checked) {
      onSwitchtoUserView();
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Admin Panel</CardTitle>
        <div className="flex items-center space-x-2">
          <span>Admin View</span>
          <Switch checked={isUserView} onCheckedChange={handleSwitchChange} />
          <span>User View</span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="progress">Student Progress</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
          <TabsContent value="progress">
            <StudentProgress />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="tests">
            <TestManagement />
          </TabsContent>
          <TabsContent value="questions">
            <QuestionManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
