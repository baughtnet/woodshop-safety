import React, { useState } from 'react';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import AvailableTests from './components/AvailableTests';
import TestTaking from './components/TestTaking';
import ReviewFailedTest from './components/ReviewFailedTest';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [currentTestId, setCurrentTestId] = useState(null);
  const [reviewTestId, setReviewTestId] = useState(null);
  const [error, setError] = useState(null);

  const handleLoginClick = () => setCurrentPage('login');
  const handleRegisterClick = () => setCurrentPage('register');
  const handleBackToHome = () => setCurrentPage('home');

  const handleSuccessfulLogin = (userData) => {
    const user = {
      ...userData,
      firstName: userData.firstName || userData.first_name,
    };
    setUser(user);
    if (user.isAdmin) {
      setCurrentPage('adminDashboard');
    } else {
      setCurrentPage('availableTests');
    }
  };

  const handleSuccessfulRegister = () => {
    setCurrentPage('home');
  };

  const handleStartTest = (testId) => {
    setCurrentTestId(testId);
    setCurrentPage('takingTest');
  };

  const handleReviewTest = (testId) => {
    setReviewTestId(testId);
    setCurrentPage('reviewTest');
  };

  const handleTestComplete = (score, total) => {
    alert(`Test completed! Your score: ${score}/${total}`);
    setCurrentPage('availableTests');
  };

  const handleBackToTests = () => {
    setCurrentPage('availableTests');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    // Optionally, you can set a timeout to clear the error after a few seconds
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="App min-h-screen bg-gray-100 flex items-center justify-center">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
          {error}
        </div>
      )}
      {currentPage === 'home' && (
        <HomePage 
          onLoginClick={handleLoginClick}
          onRegisterClick={handleRegisterClick}
        />
      )}
      {currentPage === 'login' && (
        <LoginForm 
          onBackToHome={handleBackToHome} 
          onSuccessfulLogin={handleSuccessfulLogin}
          onError={handleError}
        />
      )}
      {currentPage === 'register' && (
        <RegistrationForm 
          onBackToHome={handleBackToHome}
          onSuccessfulRegister={handleSuccessfulRegister}
          onError={handleError}
        />
      )}
      {currentPage === 'availableTests' && user && !user.isAdmin && (
        <AvailableTests 
          user={user} 
          onStartTest={handleStartTest}
          onReviewTest={handleReviewTest}
          onLogout={handleLogout}
          onError={handleError}
        />
      )}
      {currentPage === 'takingTest' && user && currentTestId && (
        <TestTaking 
          user={user} 
          testId={currentTestId} 
          onTestComplete={handleTestComplete}
          onError={handleError}
        />
      )}
      {currentPage === 'reviewTest' && user && reviewTestId && (
        <ReviewFailedTest
          user={user}
          testId={reviewTestId}
          onBackToTests={handleBackToTests}
          onError={handleError}
        />
      )}
      {currentPage === 'adminDashboard' && user && user.isAdmin && (
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          onError={handleError}
        />
      )}
    </div>
  );
}

export default App;
