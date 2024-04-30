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
  const [cookies] = useCookies(['jwtToken']); // Retrieve the 'jwtToken' cookie
  const [userId, setUserId] = useState(null); // State to store user ID

  useEffect(() => {
    if (cookies.jwtToken) {
      checkLoginStatus();
    }
  }, [cookies.jwtToken]);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/check-login', {
        headers: {
          Authorization: `Bearer ${cookies.jwtToken}`, // Send token as a header
        },
      });
      if (response.data && response.data.status === 'True') {
        setIsLoggedIn(true);
        setUserId(response.data.user_id); // Set user ID from response
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleLoginSuccess = (userId) => {
    setIsLoggedIn(true);
    setUserId(userId); // Set user ID upon successful login
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
      {isLoggedIn && (
        <div className="generate-summary">
          <GenerateSummary userId={userId} /> 
        </div>
      )}
    </div>
  );
}

export default App;
