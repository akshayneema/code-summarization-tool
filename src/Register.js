import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Import the CSS file
import { useCookies } from 'react-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Register = ({onSuccess, onLoginClick}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cookies, setCookie] = useCookies(['jwtToken']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = async () => {
    try {
      const role = 'user';
      const response = await axios.post('http://127.0.0.1:5000/register', { username, password, role });
      // Assuming the token is sent as a variable named 'access_token'
      const token = response.data.access_token
      setCookie('jwtToken', token, { path: '/' });
      onSuccess(response.data.user_id); // Call the onSuccess function passed as a prop
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <div className="register-container"> {/* Apply the class for styling */}
      <div className="form-container"> {/* Apply the class for styling */}
        <h2 className="register-heading">Register</h2>
        <div className="input-container">
          <FontAwesomeIcon icon={faUser} className="icon" />
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="input-container">
          <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="icon" onClick={togglePasswordVisibility} />
          <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="input-container">
          <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="icon" onClick={toggleConfirmPasswordVisibility} />
          <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <button onClick={handleRegister}>Register</button>
        <p className="account-exists">Already have an account? </p>
        <span className="login-link" tabIndex="0" onClick={onLoginClick}>Login</span>
      </div>
    </div>
  );
};

export default Register;
