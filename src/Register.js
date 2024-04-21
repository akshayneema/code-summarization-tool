import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Import the CSS file

const Register = ({onSuccess, onLoginClick}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    try {
      const role = 'user';
      const response = await axios.post('http://127.0.0.1:5000/register', { username, password, role });
      // Assuming the token is set as a cookie named 'access_token'
      const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('access_token='));
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.split('=')[1]}`;
      }
      console.log(response.data); // You can handle the response accordingly
      onSuccess(); // Call the onSuccess function passed as a prop
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <div className="register-container"> {/* Apply the class for styling */}
      <h2>Register</h2>
      <div className="form-container"> {/* Apply the class for styling */}
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button onClick={handleRegister}>Register</button>
        <p className="account-exists">Already have an account? </p>
        <span className="login-link" onClick={onLoginClick}>Login</span>
      </div>
    </div>
  );
};

export default Register;
