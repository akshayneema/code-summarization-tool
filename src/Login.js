import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import the CSS file
import { useCookies } from 'react-cookie';

const Login = ({onSuccess, onRegisterClick}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invalidCreds, setInvalidCreds] = useState(false);
  const [cookies, setCookie] = useCookies(['jwtToken']);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', { username, password });
      console.log(response.data); // You can handle the response accordingly
      // Assuming the token is sent as a variable named 'access_token'
      const token = response.data.access_token
      setCookie('jwtToken', token, { path: '/' });
      onSuccess(); // Call the onSuccess function passed as a prop
    } catch (error) {
      console.error('Error logging in:', error);
      setInvalidCreds(true);
    }
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <h2 className="login-heading">Login</h2>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {invalidCreds && <p className="error-message">Invalid Username or Password</p>}
        <button onClick={handleLogin}>Login</button>
        <p className="no-account">Don't have an account? </p>
        <span className="register-link" tabIndex="0" onClick={onRegisterClick}>Register</span>
      </div>
    </div>
  );
};

export default Login;
