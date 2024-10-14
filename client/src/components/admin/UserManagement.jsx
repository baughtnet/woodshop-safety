import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

const EditPinDialog = ({ isOpen, onClose, user, onUpdatePin }) => {
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    onUpdatePin(newPin);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update PIN for {user?.first_name} {user?.last_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="newPin">New PIN</Label>
            <Input
              id="newPin"
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              maxLength={4}
            />
          </div>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Update PIN</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditUserDialog = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [editedUser, setEditedUser] = useState(user || {});

  useEffect(() => {
    setEditedUser(user || {});
  }, [user]);

  const handleSubmit = () => {
    onUpdateUser(editedUser);
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };


  const shopClasses = [
    "A Block - Wood 11/12",
    "B Block - Wood 11/12",
    "D Block - Wood 9/10"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User: {editedUser.first_name} {editedUser.last_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={editedUser.first_name || ''}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={editedUser.last_name || ''}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="student_id">Student ID</Label>
            <Input
              id="student_id"
              name="student_id"
              value={editedUser.student_id || ''}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="shop_class">Shop Class</Label>
            <Select
              value={editedUser.shop_class || ''}
              onValueChange={(value) => setEditedUser(prev => ({ ...prev, shop_class: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a shop class" />
              </SelectTrigger>
              <SelectContent>
                {shopClasses.map((shopClass) => (
                  <SelectItem key={shopClass} value={shopClass}>
                    {shopClass}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Checkbox
              id="is_admin"
              name="is_admin"
              checked={editedUser.is_admin || false}
              onCheckedChange={(checked) => setEditedUser(prev => ({ ...prev, is_admin: checked }))}
              label="Is Admin"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Update User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [editingPinUser, setEditingPinUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setDeleteLoading(userId);
        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        await fetchUsers(); // Refresh the user list
        setError('User deleted successfully.');
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user. Please try again.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleUpdatePin = async (newPin) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${editingPinUser.id}/updatePin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin })
      });

      if (!response.ok) {
        throw new Error('Failed to update PIN');
      }

      setError('PIN updated successfully');
      setEditingPinUser(null);
      await fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating PIN:', error);
      setError('Failed to update PIN. Please try again.');
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setError('User updated successfully');
      setEditingUser(null);
      await fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user. Please try again.');
    }
  };

const filteredUsers = users.filter(user => 
  user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (user.shop_class && user.shop_class.toLowerCase().includes(searchTerm.toLowerCase()))
);

  if (loading) return <p>Loading users...</p>;

return (
    <div>
      {error && <Alert variant={error.includes('successfully') ? 'default' : 'destructive'}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>}
      <Input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Shop Class</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.first_name} {user.last_name}</TableCell>
              <TableCell>{user.student_id}</TableCell>
              <TableCell>{user.shop_class}</TableCell>
              <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <Button 
                  onClick={() => setEditingPinUser(user)} 
                  variant="outline"
                  className="mr-2"
                >
                  Edit PIN
                </Button>
                <Button 
                  onClick={() => setEditingUser(user)} 
                  variant="outline"
                  className="mr-2"
                >
                  Edit User
                </Button>
                <Button 
                  onClick={() => handleDeleteUser(user.id)} 
                  variant="destructive"
                  disabled={deleteLoading === user.id}
                >
                  {deleteLoading === user.id ? 'Deleting...' : 'Delete'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingPinUser && (
        <EditPinDialog
          isOpen={true}
          onClose={() => setEditingPinUser(null)}
          user={editingPinUser}
          onUpdatePin={handleUpdatePin}
        />
      )}

      {editingUser && (
        <EditUserDialog
          isOpen={true}
          onClose={() => setEditingUser(null)}
          user={editingUser}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default UserManagement;
