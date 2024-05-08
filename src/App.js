import React, { useState, useEffect } from 'react';
import GenerateSummary from './GenerateSummary';
import Login from './Login';
import Register from './Register';
import axios from 'axios';
import './App.css'; // Import CSS file for styling
import { useCookies } from 'react-cookie';
import UserProfile from './UserProfile';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showHome, setShowHome] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [cookies, setCookie] = useCookies(['jwtToken']); // Retrieve the 'jwtToken' cookie
  const [userId, setUserId] = useState(null); // State to store user ID
  const [userRole, setUserRole] = useState(null); // State to store user role

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
        setUserRole(response.data.role); // Set user role from response
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleLoginSuccess = (userId, userRole) => {
    setIsLoggedIn(true);
    setShowHome(true);
    setUserId(userId); // Set user ID upon successful login
    setUserRole(userRole); // Set user role upon successful login
  };

  // Function to handle logout
  const handleLogout = async () => {
    setCookie('jwtToken', ''); // Remove the jwtToken cookie
    setIsLoggedIn(false);
    setShowHome(false);
    setShowProfile(false);
    setUserId(null);
    setUserRole(null);
    const response = await axios.get('http://127.0.0.1:5000/logout');
    window.location.reload(); // Reload the page
  };

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleRegister = () => {
    setShowLogin(false);
  };

  const handleHome = () => {
    setShowProfile(false);
    setShowHome(true);
  }

  const handleProfile = () => {
    setShowHome(false);
    setShowProfile(true);
  }

  // Sample data for testing
  const sampleUserData = {
    name: 'John Doe',
    age: 30,
    email: 'john.doe@example.com',
    location: 'New York, USA',
  };

  const samplePieChartData = [
    { label: 'Category A', value: 25 },
    { label: 'Category B', value: 35 },
    { label: 'Category C', value: 20 },
    { label: 'Category D', value: 10 },
    { label: 'Category E', value: 10 },
  ];

  const sampleBarGraphData = [
    { label: 'January', value: 20 },
    { label: 'February', value: 35 },
    { label: 'March', value: 40 },
    { label: 'April', value: 30 },
    { label: 'May', value: 45 },
    { label: 'June', value: 55 },
  ];


  return (
    <div>
      {isLoggedIn && (
        <header>
          <nav>
            <button onClick={handleHome}>Home</button>
            <button onClick={handleProfile}>Profile</button>
            <button onClick={handleLogout}>Logout</button>
          </nav>
        </header>
      )}
      {!isLoggedIn && showLogin && <Login onSuccess={handleLoginSuccess} onRegisterClick={handleRegister} />}
      {!isLoggedIn && !showLogin && <Register onSuccess={handleLoginSuccess} onLoginClick={handleLogin} />}
      {isLoggedIn && showHome && (
        <div className="generate-summary">
          <GenerateSummary userId={userId} />
        </div>
      )}
      {isLoggedIn && showProfile && <UserProfile userData={sampleUserData} pieChartData={samplePieChartData} 
          barGraphData={sampleBarGraphData}
        />}
    </div>
  );
}

export default App;
