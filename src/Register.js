import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Import the CSS file
import { useCookies } from 'react-cookie';


const Register = ({onSuccess, onLoginClick}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cookies, setCookie] = useCookies(['jwtToken']);

  const handleRegister = async () => {
    try {
      const role = 'user';
      const response = await axios.post('http://127.0.0.1:5000/register', { username, password, role });
      // Assuming the token is sent as a variable named 'access_token'
      const token = response.data.access_token
      setCookie('jwtToken', token, { path: '/' });
      onSuccess(); // Call the onSuccess function passed as a prop
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <div className="register-container"> {/* Apply the class for styling */}
      <div className="form-container"> {/* Apply the class for styling */}
        <h2 className="register-heading">Register</h2>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button onClick={handleRegister}>Register</button>
        <p className="account-exists">Already have an account? </p>
        <span className="login-link" tabIndex="0" onClick={onLoginClick}>Login</span>
      </div>
    </div>
  );
};

export default Register;
