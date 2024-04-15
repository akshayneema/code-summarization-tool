import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Import the CSS file

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    try {
      const role = 'user';
      const response = await axios.post('http://127.0.0.1:5000/register', { username, password, role });
      console.log(response.data); // You can handle the response accordingly
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
      </div>
    </div>
  );
};

export default Register;
