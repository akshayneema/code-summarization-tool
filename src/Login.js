import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import the CSS file
import { useCookies } from 'react-cookie';

const Login = ({onSuccess, onRegisterClick}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invalidCreds, setInvalidCreds] = useState(false);
  const [cookies, setCookie] = useCookies(['access_token']); // Initialize a cookie named 'access_token'

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', { username, password });
      console.log(response.data); // You can handle the response accordingly
      // Assuming the token is set as a cookie named 'access_token'
      const access_token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('access_token='));
      // Store the access token in a cookie
      setCookie('access_token', access_token, { path: '/' });
      onSuccess(); // Call the onSuccess function passed as a prop
    } catch (error) {
      console.error('Error logging in:', error);
      setInvalidCreds(true);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <div className="form-container">
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {invalidCreds && <p className="error-message">Invalid Username or Password</p>}
        <button onClick={handleLogin}>Login</button>
        <p className="no-account">Don't have an account? </p>
        <span className="register-link" onClick={onRegisterClick}>Register</span>
      </div>
    </div>
  );
};

export default Login;
