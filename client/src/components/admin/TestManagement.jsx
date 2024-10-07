import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const TestManagement = () => {
  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/admin/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data);
      } else {
        console.error('Failed to fetch tests');
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest),
      });
      if (response.ok) {
        setNewTest({ title: '', description: '' });
        fetchTests();
      } else {
        console.error('Failed to add test');
      }
    } catch (error) {
      console.error('Error adding test:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleAddTest} className="mb-4">
        <Label htmlFor="title">Test Title</Label>
        <Input
          id="title"
          value={newTest.title}
          onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
          required
        />
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={newTest.description}
          onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
        />
        <Button type="submit">Add Test</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.map((test) => (
            <TableRow key={test.id}>
              <TableCell>{test.title}</TableCell>
              <TableCell>{test.description}</TableCell>
              <TableCell>{new Date(test.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TestManagement;
