import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const handleLoginClick = () => setCurrentPage('login');
  const handleRegisterClick = () => setCurrentPage('register');
  const handleBackToLanding = () => setCurrentPage('landing');

  return (
    <div className="App min-h-screen bg-gray-100 flex items-center justify-center">
      {currentPage === 'landing' && (
        <LandingPage 
          onLoginClick={handleLoginClick}
          onRegisterClick={handleRegisterClick}
        />
      )}
      {currentPage === 'login' && <LoginForm onBackToLanding={handleBackToLanding} />}
      {currentPage === 'register' && <RegistrationForm onBackToLanding={handleBackToLanding} />}
    </div>
  );
}

export default App;
