import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const RegistrationForm = ({ onBackToHome, onSuccessfulRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    pin: '',
    shopClass: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cohorts, setCohorts] = useState([]);

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cohorts`);
      if (!response.ok) throw new Error('Failed to fetch cohorts');
      const data = await response.json();
      setCohorts(data);
    } catch (err) {
      console.error('Error fetching cohorts:', err);
      setError('Failed to load classes. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCohortChange = (value) => {
    setFormData(prevState => ({
      ...prevState,
      shopClass: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    console.log('Form data being sent: ', formData);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      console.log('Response status: ', response.status);
      const data = await response.json();
      console.log('Full registration response:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log('Registration successful:', JSON.stringify(data, null, 2));
      setSuccess(true);
      setTimeout(() => {
        onSuccessfulRegister();
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account to access the Woodshop Safety App</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              name="studentId"
              type="text"
              required
              value={formData.studentId}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <Input
              id="pin"
              name="pin"
              type="password"
              required
              value={formData.pin}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopClass">Class</Label>
            <Select onValueChange={handleCohortChange} value={formData.shopClass} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your class" />
              </SelectTrigger>
              <SelectContent>
                {cohorts.map((cohort) => (
                  <SelectItem key={cohort.name} value={cohort.name.toString()}>
                    {cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>Registration successful! Redirecting to home...</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full">Register</Button>
          <Button type="button" variant="outline" className="w-full" onClick={onBackToHome}>
            Back to Home
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;
