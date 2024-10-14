import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { format } from 'date-fns';

const StudentProgress = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/admin/students-progress');
        if (!response.ok) {
          throw new Error('Failed to fetch students progress');
        }
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students progress:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

const filteredStudents = students.filter(student => {
  const searchTermLower = searchTerm.toLowerCase();
  return (
    (student.first_name && student.first_name.toLowerCase().includes(searchTermLower)) ||
    (student.last_name && student.last_name.toLowerCase().includes(searchTermLower)) ||
    (student.student_id && student.student_id.toLowerCase().includes(searchTermLower)) ||
    (student.shop_class && student.shop_class.toLowerCase().includes(searchTermLower))
  );
});

  if (loading) return <p>Loading student progress...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <Input
        type="text"
        placeholder="Search students..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Shop Class</TableHead>
            <TableHead>Test Name</TableHead>
            <TableHead>Test Score</TableHead>
            <TableHead>Last Attempt</TableHead>
            <TableHead>Last Login</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.flatMap((student) => 
            (student.test_results || []).map((result, index) => (
              <TableRow key={`${student.id}-${index}`}>
                <TableCell>{student.first_name || 'N/A'}</TableCell>
                <TableCell>{student.last_name || 'N/A'}</TableCell>
                <TableCell>{student.student_id || 'N/A'}</TableCell>
                <TableCell>{student.shop_class || 'N/A'}</TableCell>
                <TableCell>{result.test_name || 'N/A'}</TableCell>
                <TableCell>{result.score || 0}%</TableCell>
                <TableCell>{result.attempt_date ? format(new Date(result.attempt_date), 'yyyy-MM-dd HH:mm') : 'N/A'}</TableCell>
                <TableCell>{student.last_login ? format(new Date(student.last_login), 'yyyy-MM-dd HH:mm') : 'N/A'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentProgress;
