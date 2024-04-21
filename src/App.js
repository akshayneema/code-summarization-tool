import React, { useState, useEffect } from 'react';
import GenerateSummary from './GenerateSummary';
import Login from './Login';
import Register from './Register';
import axios from 'axios'; 
import './App.css'; // Import CSS file for styling
import { useCookies } from 'react-cookie';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [cookies] = useCookies(['access_token']); // Retrieve the 'access_token' cookie

  useEffect(() => {
    if (cookies.access_token) {
      checkLoginStatus();
    }
  }, [cookies.access_token]);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/check-login', {
        headers: {
          Authorization: `Bearer ${cookies.access_token}`, // Send token as a header
        },
      });
      if (response.data === 'True') {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogin = () => {
      setShowLogin(true);
  };

  const handleRegister = () => {
      setShowLogin(false);
  };

  return (
    <div>
      {!isLoggedIn && showLogin && <Login onSuccess={handleLoginSuccess} onRegisterClick={handleRegister}/>}
      {!isLoggedIn && !showLogin && <Register onSuccess={handleLoginSuccess} onLoginClick={handleLogin}/>}
      {isLoggedIn && <GenerateSummary />}
    </div>
  );
}

export default App;
