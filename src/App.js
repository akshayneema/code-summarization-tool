import React, { useState, useEffect } from 'react';
import GenerateSummary from './GenerateSummary';
import Login from './Login';
import Register from './Register';
import axios from 'axios'; 
import './App.css'; // Import CSS file for styling

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
      checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:5000/check-login');
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
      {!isLoggedIn && showLogin && <Login onSuccess={handleLoginSuccess} />}
      {!isLoggedIn && !showLogin && <Register />}
      {!isLoggedIn && showLogin && <button onClick={handleRegister}>Register</button>}
      {!isLoggedIn && !showLogin && <button onClick={handleLogin}>Login</button>}
      {isLoggedIn && <GenerateSummary />}
    </div>
  );
}

export default App;
