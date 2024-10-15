import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { ArrowUpDown, Search, AlertCircle } from "lucide-react";
import { format } from 'date-fns';

const StudentProgress = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'last_name', direction: 'ascending' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [totalTests, setTotalTests] = useState(0);

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
        
        // Determine the total number of tests
        if (data.length > 0) {
          const maxTestCount = Math.max(...data.map(student => student.test_results.length));
          setTotalTests(maxTestCount);
        }
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

  const sortedStudents = React.useMemo(() => {
    let sortableItems = [...filteredStudents];
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

  const getAverageScore = (student) => {
    if (!student.test_results || student.test_results.length === 0) return 0;
    const totalScore = student.test_results.reduce((sum, result) => sum + result.score, 0);
    return totalScore / student.test_results.length;
  };

  const getLastTestDate = (student) => {
    if (!student.test_results || student.test_results.length === 0) return 'N/A';
    const lastTest = student.test_results.reduce((latest, current) => 
      new Date(current.attempt_date) > new Date(latest.attempt_date) ? current : latest
    );
    return format(new Date(lastTest.attempt_date), 'yyyy-MM-dd');
  };

  const getProgress = (student) => {
    if (!student.test_results) return 0;
    const completedTests = student.test_results.length;
    return (completedTests / totalTests) * 100;
  };

  if (loading) return <p>Loading student progress...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto p-4 max-w-[1400px]"> {/* Increased max-width */}
      <h1 className="text-2xl font-bold mb-4">Student Progress Dashboard</h1>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Class Overview</TabsTrigger>
          <TabsTrigger value="details">Student Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Class Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold">Total Students</h3>
                  <p className="text-2xl">{students.length}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Average Class Score</h3>
                  <p className="text-2xl">
                    {(students.reduce((sum, student) => sum + getAverageScore(student), 0) / students.length).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Students at Risk</h3>
                  <p className="text-2xl text-red-500">
                    {students.filter(student => getAverageScore(student) < 70).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between items-center mb-4">
            <Input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    { key: 'last_name', label: 'Last Name' },
                    { key: 'first_name', label: 'First Name' },
                    { key: 'student_id', label: 'Student ID' },
                    { key: 'shop_class', label: 'Shop Class' },
                    { key: 'average_score', label: 'Average Score' },
                    { key: 'progress', label: 'Progress' },
                    { key: 'last_test', label: 'Last Test Date' },
                  ].map(({ key, label }) => (
                    <TableHead key={key}>
                      <Button variant="ghost" onClick={() => requestSort(key)} className="font-semibold">
                        {label}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.last_name}</TableCell>
                    <TableCell>{student.first_name}</TableCell>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell>{student.shop_class}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Progress value={getAverageScore(student)} className="mr-2 w-24" />
                        {getAverageScore(student).toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Progress value={getProgress(student)} className="mr-2 w-24" />
                        {student.test_results ? `${student.test_results.length}/${totalTests}` : '0/0'}
                      </div>
                    </TableCell>
                    <TableCell>{getLastTestDate(student)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" onClick={() => setSelectedStudent(student)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="details">
          {selectedStudent ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedStudent.first_name} {selectedStudent.last_name}'s Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold">Student ID</h3>
                    <p>{selectedStudent.student_id}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Shop Class</h3>
                    <p>{selectedStudent.shop_class}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Average Score</h3>
                    <p>{getAverageScore(selectedStudent).toFixed(2)}%</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Last Login</h3>
                    <p>{selectedStudent.last_login ? format(new Date(selectedStudent.last_login), 'yyyy-MM-dd HH:mm') : 'N/A'}</p>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Test Results</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Attempt Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStudent.test_results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.test_name}</TableCell>
                        <TableCell>{result.score}%</TableCell>
                        <TableCell>{format(new Date(result.attempt_date), 'yyyy-MM-dd HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <p>Select a student from the overview to see detailed information.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProgress;
