import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

const ClassManagement = () => {
  const [cohorts, setCohorts] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCohort, setEditingCohort] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newCohort, setNewCohort] = useState({ name: '', description: '' });
  const [isAddingCohort, setIsAddingCohort] = useState(false);

  useEffect(() => {
    fetchCohorts();
    fetchUsers();
  }, []);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cohorts`);
      if (!response.ok) {
        throw new Error('Failed to fetch cohorts');
      }
      const data = await response.json();
      setCohorts(data);
    } catch (error) {
      console.error('Error fetching cohorts:', error);
      setError('Failed to load cohorts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    }
  };

  const handleEditCohort = async (cohort) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cohorts/${cohort.id}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch cohort users');
      }
      const cohortUsers = await response.json();
      setSelectedUsers(cohortUsers.map(user => user.id));
      setEditingCohort(cohort);
    } catch (error) {
      console.error('Error fetching cohort users:', error);
      setError('Failed to load cohort users. Please try again.');
    }
  };

  const handleUpdateCohort = async () => {
    try {
      // Update cohort details
      const detailsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/cohorts/${editingCohort.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCohort.name,
          description: editingCohort.description
        })
      });

      if (!detailsResponse.ok) {
        throw new Error('Failed to update cohort details');
      }

      // Update cohort users
      const usersResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/cohorts/${editingCohort.id}/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsers,
          cohortName: editingCohort.name
        })
      });

      if (!usersResponse.ok) {
        throw new Error('Failed to update cohort users');
      }

      setError('Cohort updated successfully');
      setEditingCohort(null);
      await fetchCohorts();
    } catch (error) {
      console.error('Error updating cohort:', error);
      setError('Failed to update cohort. Please try again.');
    }
  };

  const handleAddCohort = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cohorts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCohort)
      });

      if (!response.ok) {
        throw new Error('Failed to add cohort');
      }

      setError('Cohort added successfully');
      setNewCohort({ name: '', description: '' });
      setIsAddingCohort(false);
      await fetchCohorts();
    } catch (error) {
      console.error('Error adding cohort:', error);
      setError('Failed to add cohort. Please try again.');
    }
  };

  const handleDeleteCohort = async (cohortId) => {
    if (window.confirm('Are you sure you want to delete this cohort?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cohorts/${cohortId}`, { 
          method: 'DELETE' 
        });
        if (!response.ok) {
          throw new Error('Failed to delete cohort');
        }
        setError('Cohort deleted successfully');
        await fetchCohorts();
      } catch (error) {
        console.error('Error deleting cohort:', error);
        setError('Failed to delete cohort. Please try again.');
      }
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredCohorts = cohorts.filter(cohort => 
    cohort.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.student_id.includes(userSearchTerm)
  );

  if (loading) return <p>Loading cohorts...</p>;

  return (
    <div>
      {error && <Alert variant={error.includes('successfully') ? 'default' : 'destructive'}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>}
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search cohorts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsAddingCohort(true)}>Add New Cohort</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>COHORT NAME</TableHead>
            <TableHead>DESCRIPTION</TableHead>
            <TableHead>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCohorts.map((cohort) => (
            <TableRow key={cohort.id}>
              <TableCell>{cohort.name}</TableCell>
              <TableCell>{cohort.description}</TableCell>
              <TableCell>
                <Button 
                  onClick={() => handleEditCohort(cohort)} 
                  variant="outline"
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button 
                  onClick={() => handleDeleteCohort(cohort.id)} 
                  variant="destructive"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingCohort && (
        <Dialog open={true} onOpenChange={() => setEditingCohort(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Cohort: {editingCohort.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCohortName">Cohort Name</Label>
                <Input
                  id="editCohortName"
                  value={editingCohort.name}
                  onChange={(e) => setEditingCohort({...editingCohort, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editCohortDescription">Description</Label>
                <Textarea
                  id="editCohortDescription"
                  value={editingCohort.description}
                  onChange={(e) => setEditingCohort({...editingCohort, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="userSearch">Search Users</Label>
                <Input
                  id="userSearch"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Search users by name or student ID"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserSelection(user.id)}
                    />
                    <Label htmlFor={`user-${user.id}`}>
                      {user.first_name} {user.last_name} ({user.student_id}) - Current Shop Class: {user.shop_class || 'None'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateCohort}>Update Cohort</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isAddingCohort && (
        <Dialog open={true} onOpenChange={() => setIsAddingCohort(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Cohort</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newCohortName">Cohort Name</Label>
                <Input
                  id="newCohortName"
                  value={newCohort.name}
                  onChange={(e) => setNewCohort({...newCohort, name: e.target.value})}
                  placeholder="Enter cohort name"
                />
              </div>
              <div>
                <Label htmlFor="newCohortDescription">Description</Label>
                <Textarea
                  id="newCohortDescription"
                  value={newCohort.description}
                  onChange={(e) => setNewCohort({...newCohort, description: e.target.value})}
                  placeholder="Enter cohort description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCohort}>Add Cohort</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClassManagement;
