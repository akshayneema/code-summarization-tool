import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Import the CSS file
import { useCookies } from 'react-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEye, faEyeSlash, faMailBulk, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Register = ({onSuccess, onLoginClick}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cookies, setCookie] = useCookies(['jwtToken']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = async () => {
    try {
      if (confirmPasswordError.length == 0) {
        const role = 'user';
        const response = await axios.post('http://127.0.0.1:5000/register', { username, email, password, role });
        if (response.data && response.data.status == 'True') {
          onSuccess(); // Call the onSuccess function passed as a prop
        }
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if inputEmail matches the emailRegex
    setEmail(inputEmail);
    if (emailRegex.test(inputEmail)) {
      // If valid, update the email state
      setEmailError('');
    } else {
      // If not valid, you may show an error message or handle it as per your requirement
      setEmailError('Please enter a valid email');
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    // Password must be at least 8 characters long
    // Must contain at least one capital letter, one number, and one special character
    const errors = [];
    if (newPassword.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(newPassword)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/\d/.test(newPassword)) {
      errors.push("Password must contain at least one number.");
    }
    if (!/[!@#$%^&*()_+]/.test(newPassword)) {
      errors.push("Password must contain at least one special character.");
    }

    setPassword(newPassword)
    if (errors.length === 0) {      
      setPasswordErrors([]);
    } else {
      setPasswordErrors(errors);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (newConfirmPassword === password) {
      setConfirmPasswordError('');
    } else {
      setConfirmPasswordError('Passwords do not match !!!');
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
          <FontAwesomeIcon icon={faEnvelope} className="icon" />
          <input type="text" placeholder="Email" value={email} onChange={handleEmailChange} />
          {emailError && <p className="error-message">{emailError}</p>}
        </div>
        <div className="input-container">
          <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="icon" onClick={togglePasswordVisibility} />
          <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={handlePasswordChange} />
          {passwordErrors.length > 0 && (
            <ul className="error-list">
            {passwordErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
            </ul>
          )}
        </div>
        <div className="input-container">
          <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="icon" onClick={toggleConfirmPasswordVisibility} />
          <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
          {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
        </div>
        <button data-testid="register-button" onClick={handleRegister} className='register-button'>Register</button>
        <p className="account-exists">Already have an account? </p>
        <span className="login-link" tabIndex="0" onClick={onLoginClick}>Login</span>
      </div>
    </div>
  );
};

export default Register;
