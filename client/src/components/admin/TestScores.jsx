import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const TestScores = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await fetch('/api/admin/scores');
      if (response.ok) {
        const data = await response.json();
        setScores(data);
      } else {
        console.error('Failed to fetch scores');
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Test</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scores.map((score, index) => (
          <TableRow key={index}>
            <TableCell>{`${score.first_name} ${score.last_name}`}</TableCell>
            <TableCell>{score.title}</TableCell>
            <TableCell>{score.score}</TableCell>
            <TableCell>{new Date(score.completed_at).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TestScores;
