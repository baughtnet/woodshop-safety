import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "../ui/sheet";
import { Progress } from "../ui/progress";
import { ArrowUpDown, Search, AlertCircle } from "lucide-react";
import { format, isValid, parseISO } from 'date-fns';

const StudentProgress = () => {

  const [students, setStudents] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState('All Classes');
  const [selectedDetailCohort, setSelectedDetailCohort] = useState('All Classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'last_name', direction: 'ascending' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDetailStudent, setSelectedDetailStudent] = useState(null);
  const [totalTests, setTotalTests] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedTestDetails, setSelectedTestDetails] = useState(null);
  const [isTestDetailsOpen, setIsTestDetailsOpen] = useState(false);
  const [testDetailsError, setTestDetailsError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentsResponse = await fetch('http://localhost:3001/api/admin/students-progress');
        const cohortsResponse = await fetch('http://localhost:3001/api/cohorts');
        
        if (!studentsResponse.ok || !cohortsResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const studentsData = await studentsResponse.json();
        const cohortsData = await cohortsResponse.json();
        
        setStudents(studentsData);
        setCohorts([{ name: 'All Classes' }, ...cohortsData]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = students.filter(student => {
    const inSelectedCohort = selectedCohort === 'All Classes' || student.shop_class === selectedCohort;
    const matchesSearch = searchTerm === '' || 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    return inSelectedCohort && matchesSearch;
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

const getAverageScore = (studentOrList) => {
  if (Array.isArray(studentOrList)) {
    // If it's a list of students
    const totalScore = studentOrList.reduce((sum, student) => sum + getAverageScore(student), 0);
    return studentOrList.length > 0 ? totalScore / studentOrList.length : 0;
  } else {
    // If it's a single student
    const student = studentOrList;
    if (!student.test_results || student.test_results.length === 0) return 0;
    const totalScore = student.test_results.reduce((sum, result) => sum + result.score, 0);
    return totalScore / student.test_results.length;
  }
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

const getStudentsAtRisk = (studentList) => {
  return studentList.filter(student => getAverageScore(student) < 70).length;
};

const getTestDetails = async (userId, testId) => {
  try {
    if (!userId || !testId) {
      throw new Error('Invalid userId or testId');
    }

    // Fetch available tests to get the latest attempt information
    const availableTestsResponse = await fetch(`http://localhost:3001/api/tests/available/${userId}`);
    if (!availableTestsResponse.ok) {
      throw new Error(`HTTP error! status: ${availableTestsResponse.status}`);
    }
    const availableTests = await availableTestsResponse.json();
    const testInfo = availableTests.find(test => test.id === parseInt(testId));

    if (!testInfo) {
      throw new Error('Test not found in available tests');
    }

    // Fetch failed questions for review
    const reviewResponse = await fetch(`http://localhost:3001/api/tests/${testId}/review/${userId}`);
    if (!reviewResponse.ok) {
      throw new Error(`HTTP error! status: ${reviewResponse.status}`);
    }
    const failedQuestions = await reviewResponse.json();

    // Fetch all questions for this test
    const questionsResponse = await fetch(`http://localhost:3001/api/tests/${testId}/questions`);
    if (!questionsResponse.ok) {
      throw new Error(`HTTP error! status: ${questionsResponse.status}`);
    }
    const allQuestions = await questionsResponse.json();

    const totalQuestions = allQuestions.length;
    const failedQuestionCount = failedQuestions.length;
    const correctQuestionCount = totalQuestions - failedQuestionCount;

    return {
      testName: testInfo.name || 'Unknown Test',
      lastScore: testInfo.score || 0,
      lastPercentage: testInfo.percentage || 0,
      lastAttemptDate: testInfo.attempt_timestamp ? new Date(testInfo.attempt_timestamp).toISOString() : 'N/A',
      passed: testInfo.passed || false,
      totalQuestions,
      correctQuestions: correctQuestionCount,
      failedQuestions: failedQuestionCount,
      failedQuestionDetails: failedQuestions,
      isAvailable: testInfo.isAvailable || false,
      timeoutRemaining: testInfo.timeoutRemaining || 0
    };
  } catch (error) {
    console.error('Error fetching test details:', error);
    throw error;
  }
};

const handleViewQuickDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailSheetOpen(true);
  };

  const handleViewFullDetails = (student) => {
    setSelectedDetailStudent(student);
    setSelectedDetailCohort(student.shop_class);
    setActiveTab("details");
    setIsDetailSheetOpen(false);
  };

const handleViewTestDetails = async (studentId, testId) => {
    try {
      setTestDetailsError(null);
      const details = await getTestDetails(studentId, testId);
      setSelectedTestDetails(details);
      setIsTestDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching test details:', error);
      setTestDetailsError(error.message);
      setIsTestDetailsOpen(true);
    }
  };

  const filteredDetailStudents = students.filter(student => 
    selectedDetailCohort === 'All Classes' || student.shop_class === selectedDetailCohort
  );

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm') : 'Invalid Date';
  };

  if (loading) return <p>Loading student progress...</p>;
  if (error) return <p>Error: {error}</p>;

return (
  <div className="w-full">
    <h1 className="text-2xl font-bold mb-4">Student Progress Dashboard</h1>
    <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <div className="mb-4">
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.name} value={cohort.name}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold">Total Students</h3>
                <p className="text-2xl">{filteredStudents.length}</p>
              </div>
              <div>
                <h3 className="font-semibold">Average Class Score</h3>
                <p className="text-2xl">
                  {getAverageScore(filteredStudents).toFixed(2)}%
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Students at Risk</h3>
                <p className="text-2xl text-red-500">
                  {getStudentsAtRisk(filteredStudents)}
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
                    <Sheet open={isDetailSheetOpen && selectedStudent?.id === student.id} onOpenChange={setIsDetailSheetOpen}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" onClick={() => handleViewQuickDetails(student)}>
                          Quick View
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>{student.first_name} {student.last_name}'s Quick Details</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                          <h3 className="font-semibold">Average Score</h3>
                          <Progress value={getAverageScore(student)} className="mt-2" />
                          <p>{getAverageScore(student).toFixed(2)}%</p>
                        </div>
                        <div className="mt-4">
                          <h3 className="font-semibold">Progress</h3>
                          <Progress value={getProgress(student)} className="mt-2" />
                          <p>{student.test_results ? `${student.test_results.length}/${totalTests}` : '0/0'} tests completed</p>
                        </div>
                        <div className="mt-4">
                          <h3 className="font-semibold">Last Test Date</h3>
                          <p>{getLastTestDate(student)}</p>
                        </div>
                        <Button className="mt-4" onClick={() => handleViewFullDetails(student)}>
                          View Full Details
                        </Button>
                      </SheetContent>
                    </Sheet>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
<TabsContent value="details">
  <Card>
    <CardHeader>
      <CardTitle>Detailed Student Progress</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex space-x-4 mb-4">
        <Select value={selectedDetailCohort} onValueChange={setSelectedDetailCohort}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.name} value={cohort.name}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
        </Select>
        <Select 
          value={selectedDetailStudent?.id} 
          onValueChange={(value) => {
            const student = filteredDetailStudents.find(s => s.id.toString() === value);
            setSelectedDetailStudent(student);
          }}
        >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDetailStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
      {selectedDetailStudent ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {selectedDetailStudent.first_name} {selectedDetailStudent.last_name}'s Progress
          </h3>
          <p>Student ID: {selectedDetailStudent.student_id}</p>
          <p>Shop Class: {selectedDetailStudent.shop_class}</p>
          <h4 className="text-md font-semibold mt-4 mb-2">Test Results</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedDetailStudent?.test_results?.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{result.test_name}</TableCell>
                  <TableCell>{result.score}%</TableCell>
                  <TableCell>{formatDate(result.attempt_timestamp)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleViewTestDetails(selectedDetailStudent.id, result.test_id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p>Select a student to view detailed progress.</p>
      )}
    </CardContent>
  </Card>
</TabsContent>

      <Sheet open={isTestDetailsOpen} onOpenChange={setIsTestDetailsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedTestDetails?.testName || 'Test'} Details</SheetTitle>
          </SheetHeader>
          {testDetailsError ? (
            <div className="mt-4 text-red-500">
              Error: {testDetailsError}
            </div>
          ) : selectedTestDetails ? (
            <div className="mt-4">
              <p>Last Score: {selectedTestDetails.lastScore}</p>
              <p>Last Percentage: {selectedTestDetails.lastPercentage}%</p>
              <p>Last Attempt: {formatDate(selectedTestDetails.lastAttemptDate)}</p>
              <p>Passed: {selectedTestDetails.passed ? 'Yes' : 'No'}</p>
              <p>Total Questions: {selectedTestDetails.totalQuestions}</p>
              <p>Correct Answers: {selectedTestDetails.correctQuestions}</p>
              <p>Failed Questions: {selectedTestDetails.failedQuestions}</p>
              <p>Available for Retake: {selectedTestDetails.isAvailable ? 'Yes' : 'No'}</p>
              {!selectedTestDetails.isAvailable && (
                <p>Time until available: {Math.ceil(selectedTestDetails.timeoutRemaining)} minutes</p>
              )}
              
              {selectedTestDetails.failedQuestionDetails.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold">Failed Questions:</h4>
                  <ul className="list-disc pl-5">
                    {selectedTestDetails.failedQuestionDetails.map((q, index) => (
                      <li key={index}>
                        {q.question_text}
                        <br />
                        <span className="text-sm text-red-500">Your answer: {q.selected_answer}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">Loading test details...</div>
          )}
          <SheetClose asChild>
            <Button className="mt-4">Close</Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
  </Tabs>
    </div>
  );
};

export default StudentProgress;
