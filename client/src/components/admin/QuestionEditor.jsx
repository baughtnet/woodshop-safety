import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';

const QuestionEditor = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
  });

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      fetchQuestions(selectedTest);
    }
  }, [selectedTest]);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/admin/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data);
      } else {
        console.error('Failed to fetch tests');
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchQuestions = async (testId) => {
    try {
      const response = await fetch(`/api/admin/tests/${testId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        console.error('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  // Add functions to handle adding/editing questions here

  return (
    <div>
      <h2>Question Editor</h2>
      {/* Add your question editor UI here */}
    </div>
  );
};

export default QuestionEditor;
