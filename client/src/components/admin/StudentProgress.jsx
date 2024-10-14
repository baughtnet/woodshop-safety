import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { format } from 'date-fns';

const StudentProgress = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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
      (student.shop_class && student.shop_class.toLowerCase().includes(searchTermLower)) ||
      (student.test_results && student.test_results.some(result => 
        result.test_name && result.test_name.toLowerCase().includes(searchTermLower)
      ))
    );
  });

  const sortedStudents = React.useMemo(() => {
    let sortableItems = filteredStudents.flatMap(student => 
      student.test_results.map(result => ({...student, ...result}))
    );
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredStudents, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (loading) return <p>Loading student progress...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <Input
        type="text"
        placeholder="Search students or tests..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            {[
              { key: 'first_name', label: 'First Name' },
              { key: 'last_name', label: 'Last Name' },
              { key: 'student_id', label: 'Student ID' },
              { key: 'shop_class', label: 'Shop Class' },
              { key: 'test_name', label: 'Test Name' },
              { key: 'score', label: 'Test Score' },
              { key: 'attempt_date', label: 'Last Attempt' },
              { key: 'last_login', label: 'Last Login' },
            ].map(({ key, label }) => (
              <TableHead key={key}>
                <Button variant="ghost" onClick={() => requestSort(key)}>
                  {label}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStudents.map((item, index) => (
            <TableRow key={`${item.id}-${index}`}>
              <TableCell>{item.first_name || 'N/A'}</TableCell>
              <TableCell>{item.last_name || 'N/A'}</TableCell>
              <TableCell>{item.student_id || 'N/A'}</TableCell>
              <TableCell>{item.shop_class || 'N/A'}</TableCell>
              <TableCell>{item.test_name || 'N/A'}</TableCell>
              <TableCell>{item.score ? `${item.score}%` : 'N/A'}</TableCell>
              <TableCell>{item.attempt_date ? format(new Date(item.attempt_date), 'yyyy-MM-dd HH:mm') : 'N/A'}</TableCell>
              <TableCell>{item.last_login ? format(new Date(item.last_login), 'yyyy-MM-dd HH:mm') : 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentProgress;
