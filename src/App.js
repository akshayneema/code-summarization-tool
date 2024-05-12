import React, { useState, useEffect } from 'react';
import GenerateSummary from './GenerateSummary';
import Login from './Login';
import Register from './Register';
import axios from 'axios';
import './App.css'; // Import CSS file for styling
import { useCookies } from 'react-cookie';
import UserProfile from './UserProfile';
import AdminProfile from './AdminProfile';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showHome, setShowHome] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [cookies, setCookie] = useCookies(['jwtToken']); // Retrieve the 'jwtToken' cookie
  const [userId, setUserId] = useState(null); // State to store user ID
  const [userRole, setUserRole] = useState(null); // State to store user role
  const [userName, setUserName] = useState(null); // State to store user name
  const [userEmail, setUserEmail] = useState(null); // State to store user email

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
        setUserName(response.data.username); // Set username from response
        setUserEmail(response.data.email); // Set user email from response
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleLoginSuccess = (userId, userRole, firstLogin) => {
    setIsLoggedIn(true);
    setShowHome(true);
    setUserId(userId); // Set user ID upon successful login
    setUserRole(userRole); // Set user role upon successful login
    if (firstLogin == 'True') {
      setTimeout(() => {
        alert('Please change your password');
      }, 2000);
    }
  };

  const handleRegisterSuccess = () => {
    setShowLogin(true);
    setRegisterSuccess(true);
    setTimeout(() => {
      setRegisterSuccess(false);
    }, 3000);
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


  return (
    <div className={`app-container ${isLoggedIn ? 'loggedin-image' : 'login-image'}`}>
      {isLoggedIn && (
        <header>
          <nav>
            <button className="header-button" onClick={handleHome}>Home</button>
            <button className="header-button" onClick={handleProfile}>Profile</button>
            <button className="header-button" onClick={handleLogout}>Logout</button>
          </nav>
        </header>
      )}
      {!isLoggedIn && showLogin && <Login onSuccess={handleLoginSuccess} onRegisterClick={handleRegister} registerSuccess={registerSuccess} />}
      {!isLoggedIn && !showLogin && <Register onSuccess={handleRegisterSuccess} onLoginClick={handleLogin} />}
      {isLoggedIn && showHome && (
        <div className="generate-summary">
          <GenerateSummary userId={userId} />
        </div>
      )}
      {isLoggedIn && showProfile && userRole=='user' && <UserProfile user_id={userId} user_name={userName} user_email={userEmail} />}
      {isLoggedIn && showProfile && userRole=='admin' && <AdminProfile admin_name={userName} admin_email={userEmail} />}
    </div>
  );
}

export default App;
