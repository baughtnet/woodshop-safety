import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('http://localhost:3001/api/admin/users');
      const data = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Student ID</TableHead>
          <TableHead>Test Results</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.first_name} {user.last_name}</TableCell>
            <TableCell>{user.student_id}</TableCell>
            <TableCell>
              {user.test_results.map((result, index) => (
                <div key={index}>
                  Test ID: {result.test_id}, Score: {result.percentage}%
                </div>
              ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default UserManagement;
