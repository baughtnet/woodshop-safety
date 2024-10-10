import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import AvailableTests from './components/AvailableTests';
import TestTaking from './components/TestTaking';
import ReviewFailedTest from './components/ReviewFailedTest';
import AdminPanel from './components/admin/AdminPanel';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [currentTestId, setCurrentTestId] = useState(null);
  const [reviewTestId, setReviewTestId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('Current page:', currentPage);
    console.log('Is admin:', isAdmin);
  }, [currentPage, isAdmin]);

  const handleLoginClick = () => setCurrentPage('login');
  const handleRegisterClick = () => setCurrentPage('register');
  const handleBackToHome = () => setCurrentPage('home');

  const handleSuccessfulLogin = (userData) => {
    console.log('Login successful, user data:', userData);
    const user = {
      ...userData,
      firstName: userData.firstName || userData.first_name,
    };
    setUser(user);
    setIsAdmin(user.isAdmin);
    setCurrentPage(user.isAdmin ? 'adminPanel' : 'availableTests');
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

  const handleAdminPanelClick = () => {
    if (isAdmin) {
      setCurrentPage('adminPanel');
    }
  };

  return (
    <div className="App min-h-screen bg-gray-100 flex items-center justify-center">
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
        />
      )}
      {currentPage === 'register' && (
        <RegistrationForm 
          onBackToHome={handleBackToHome}
          onSuccessfulRegister={handleSuccessfulRegister}
        />
      )}
      {currentPage === 'availableTests' && user && (
        <>
          <AvailableTests 
            user={user} 
            onStartTest={handleStartTest}
            onReviewTest={handleReviewTest}
          />
          {isAdmin && (
            <button onClick={handleAdminPanelClick} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              Go to Admin Panel
            </button>
          )}
        </>
      )}
      {currentPage === 'takingTest' && user && currentTestId && (
        <TestTaking 
          user={user} 
          testId={currentTestId} 
          onTestComplete={handleTestComplete}
        />
      )}
      {currentPage === 'reviewTest' && user && reviewTestId && (
        <ReviewFailedTest
          user={user}
          testId={reviewTestId}
          onBackToTests={handleBackToTests}
        />
      )}
      {currentPage === 'adminPanel' && isAdmin && (
        <AdminPanel />
      )}
    </div>
  );
}

export default App;
