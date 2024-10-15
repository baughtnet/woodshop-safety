import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";

const ClassManagement = () => {
  const [cohorts, setCohorts] = useState([]);
  const [newCohort, setNewCohort] = useState({ name: '', description: '' });
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [editingCohort, setEditingCohort] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('');
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCohorts();
    fetchUsers();
  }, []);

useEffect(() => {
    if (users.length > 0) {
      setFilteredUsers(
        users.filter(user => 
          user.firstName.toLowerCase().includes(userFilter.toLowerCase()) ||
          user.lastName.toLowerCase().includes(userFilter.toLowerCase()) ||
          user.studentId.toLowerCase().includes(userFilter.toLowerCase())
        )
      );
    }
  }, [users, userFilter]);

  const fetchCohorts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cohorts');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setCohorts(data);
    } catch (err) {
      setError('Failed to fetch classes');
    }
  };

const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      console.log('Raw user data:', data);
      const processedUsers = data.map(user => ({
        id: user.id,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        studentId: user.student_id || '',
        cohortId: user.shop_class // Assuming shop_class corresponds to cohortId
      }));
      console.log('Processed users:', processedUsers);
      setUsers(processedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingCohort) {
      setEditingCohort({ ...editingCohort, [name]: value });
    } else {
      setNewCohort({ ...newCohort, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCohort) {
        await updateCohort(editingCohort);
      } else {
        await createCohort(newCohort);
      }
      fetchCohorts();
      setNewCohort({ name: '', description: '' });
      setEditingCohort(null);
      setIsDialogOpen(false);
    } catch (err) {
      setError('Failed to save class');
    }
  };

  const createCohort = async (cohortData) => {
    const response = await fetch('http://localhost:3001/api/cohorts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cohortData),
    });
    if (!response.ok) throw new Error('Failed to create class');
  };

  const updateCohort = async (cohortData) => {
    const response = await fetch(`http://localhost:3001/api/cohorts/${cohortData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cohortData),
    });
    if (!response.ok) throw new Error('Failed to update class');
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/cohorts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete class');
      fetchCohorts();
      setSelectedCohort(null);
    } catch (err) {
      setError('Failed to delete class');
    }
  };

  const handleUserAssignment = async (userId, isAssigned) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_class: isAssigned ? editingCohort.id : null }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      // Update local state immediately
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, cohortId: isAssigned ? editingCohort.id : null } : user
      ));

      // Show success notification
      toast.success(`User ${isAssigned ? 'added to' : 'removed from'} class successfully`);

      // Refresh the user list to ensure consistency with the backend
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(`Failed to update user: ${err.message}`);
      toast.error(`Failed to update user: ${err.message}`);
    }
  };

  const handleEdit = (cohort) => {
    setEditingCohort(cohort);
    setIsDialogOpen(true);
    // Reset the user filter when opening the dialog
    setUserFilter('');
    // Re-filter users based on the current cohort
    setFilteredUsers(users.filter(user => 
      user.firstName.toLowerCase().includes(userFilter.toLowerCase()) ||
      user.lastName.toLowerCase().includes(userFilter.toLowerCase()) ||
      user.studentId.toLowerCase().includes(userFilter.toLowerCase())
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Management</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <div>
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              name="name"
              value={newCohort.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={newCohort.description}
              onChange={handleInputChange}
            />
          </div>
          <Button type="submit">Add Class</Button>
        </form>
        <Select onValueChange={(value) => setSelectedCohort(cohorts.find(c => c.id === parseInt(value)))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {cohorts.map((cohort) => (
              <SelectItem key={cohort.id} value={cohort.id.toString()}>{cohort.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCohort && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">{selectedCohort.name}</h3>
            <p>{selectedCohort.description}</p>
            <div className="mt-2 space-x-2">
              <Button onClick={() => handleEdit(selectedCohort)}>Edit Class</Button>
              <Button onClick={() => handleDelete(selectedCohort.id)} variant="destructive">Delete Class</Button>
            </div>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Class: {editingCohort?.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={editingCohort?.name || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">Description</Label>
                  <Input
                    id="edit-description"
                    name="description"
                    value={editingCohort?.description || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div>
                  <Label htmlFor="userFilter">Filter Users</Label>
                  <Input
                    id="userFilter"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    placeholder="Filter by name or student ID"
                  />
                </div>
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <div key={user.id} className="flex items-center space-x-2 py-2">
            <Checkbox
              id={`user-${user.id}`}
              checked={user.cohortId === editingCohort?.id}
              onCheckedChange={(checked) => handleUserAssignment(user.id, checked)}
            />
            <Label htmlFor={`user-${user.id}`} className="text-sm">
              {user.firstName} {user.lastName} ({user.studentId})
            </Label>
          </div>
        ))
      ) : (
        <p>No users found</p>
      )}
    </ScrollArea>
              </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
    </CardContent>
    </Card>
  );
};

export default ClassManagement;
