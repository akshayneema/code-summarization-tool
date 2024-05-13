import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import the CSS file
import { useCookies } from 'react-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = ({onSuccess, onRegisterClick, registerSuccess}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invalidCreds, setInvalidCreds] = useState(false);
  const [cookies, setCookie] = useCookies(['jwtToken']);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', { username, password });
      console.log(response.data); // You can handle the response accordingly
      // Assuming the token is sent as a variable named 'access_token'
      if (response.data && response.data.access_token) {
        const token = response.data.access_token
        setCookie('jwtToken', token, { path: '/' });
        onSuccess(response.data.user_id, response.data.role, response.data.first_login); // Call the onSuccess function passed as a prop
      } else {
        setInvalidCreds(true);
      }
      
    } catch (error) {
      console.error('Error logging in:', error);
      setInvalidCreds(true);
    }
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <h2 className="login-heading">Login</h2>
        { registerSuccess && <p className="register-success-message">Registered Successfully. You can login now</p>}
        <div className="input-container">
          <FontAwesomeIcon icon={faUser} className="icon" />
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="input-container">
          <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="icon" data-testid="toggle-password-visibility" onClick={togglePasswordVisibility} />
          <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} data-testid="password-input" onChange={(e) => setPassword(e.target.value)} />
        </div>
        {invalidCreds && <p data-testid="invalid-username" className="error-message">Invalid Username or Password</p>}
        <button data-testid="login-button" onClick={handleLogin} className='login-button'>Login</button>
        <p className="no-account">Don't have an account? </p>
        <span className="register-link" tabIndex="0" onClick={onRegisterClick}>Register</span>
      </div>
    </div>
  );
};

export default Login;
