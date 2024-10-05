import React, { useState } from 'react';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import AvailableTests from './components/AvailableTests';
import TestTaking from './components/TestTaking';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [currentTestId, setCurrentTestId] = useState(null);

  const handleLoginClick = () => setCurrentPage('login');
  const handleRegisterClick = () => setCurrentPage('register');
  const handleBackToHome = () => setCurrentPage('home');

  const handleSuccessfulLogin = (userData) => {
    setUser(userData);
    setCurrentPage('availableTests');
  };

  const handleSuccessfulRegister = () => {
    setCurrentPage('home');
  };

  const handleStartTest = (testId) => {
    setCurrentTestId(testId);
    setCurrentPage('takingTest');
  };

  const handleTestComplete = (score, total) => {
    alert(`Test completed! Your score: ${score}/${total}`);
    setCurrentPage('availableTests');
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
        <AvailableTests user={user} onStartTest={handleStartTest} />
      )}
      {currentPage === 'takingTest' && user && currentTestId && (
        <TestTaking 
          user={user} 
          testId={currentTestId} 
          onTestComplete={handleTestComplete}
        />
      )}
    </div>
  );
}

export default App;
