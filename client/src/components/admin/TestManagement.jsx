import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';

const TestManagement = () => {
  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState({ name: '', description: '', display_order: 0, total_questions: 0 });
  const [editingTest, setEditingTest] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('http://localhost:3001/admin/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data);
      } else {
        setError('Failed to fetch tests');
      }
    } catch (error) {
      setError('Error fetching tests: ' + error.message);
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest),
      });
      if (response.ok) {
        setNewTest({ name: '', description: '', display_order: 0, total_questions: 0 });
        fetchTests();
      } else {
        setError('Failed to add test');
      }
    } catch (error) {
      setError('Error adding test: ' + error.message);
    }
  };

  const handleEditTest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/admin/tests/${editingTest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTest),
      });
      if (response.ok) {
        setEditingTest(null);
        fetchTests();
      } else {
        setError('Failed to update test');
      }
    } catch (error) {
      setError('Error updating test: ' + error.message);
    }
  };

  return (
    <div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      
      <form onSubmit={editingTest ? handleEditTest : handleAddTest} className="mb-4 space-y-4">
        <div>
          <Label htmlFor="name">Test Name</Label>
          <Input
            id="name"
            value={editingTest ? editingTest.name : newTest.name}
            onChange={(e) => editingTest 
              ? setEditingTest({...editingTest, name: e.target.value})
              : setNewTest({...newTest, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={editingTest ? editingTest.description : newTest.description}
            onChange={(e) => editingTest
              ? setEditingTest({...editingTest, description: e.target.value})
              : setNewTest({...newTest, description: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={editingTest ? editingTest.display_order : newTest.display_order}
            onChange={(e) => editingTest
              ? setEditingTest({...editingTest, display_order: parseInt(e.target.value)})
              : setNewTest({...newTest, display_order: parseInt(e.target.value)})}
            required
          />
        </div>
        <div>
          <Label htmlFor="total_questions">Total Questions</Label>
          <Input
            id="total_questions"
            type="number"
            value={editingTest ? editingTest.total_questions : newTest.total_questions}
            onChange={(e) => editingTest
              ? setEditingTest({...editingTest, total_questions: parseInt(e.target.value)})
              : setNewTest({...newTest, total_questions: parseInt(e.target.value)})}
            required
          />
        </div>
        <Button type="submit">{editingTest ? 'Update Test' : 'Add Test'}</Button>
        {editingTest && (
          <Button type="button" onClick={() => setEditingTest(null)}>Cancel Edit</Button>
        )}
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Display Order</TableHead>
            <TableHead>Total Questions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.map((test) => (
            <TableRow key={test.id}>
              <TableCell>{test.name}</TableCell>
              <TableCell>{test.description}</TableCell>
              <TableCell>{test.display_order}</TableCell>
              <TableCell>{test.total_questions}</TableCell>
              <TableCell>
                <Button onClick={() => setEditingTest(test)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TestManagement;
