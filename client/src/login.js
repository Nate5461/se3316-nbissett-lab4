import React, { useState, useContext } from 'react';
import './App.css';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';

function Login() {
  const navigate = useNavigate();
  const { setUsername: setGlobalUsername } = useContext(UserContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState(''); // new state variable for login errors

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(''); // clear error when user starts typing
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(''); // clear error when user starts typing
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // prevent default form submission behavior
  
    if (!email) {
      setEmailError('Please enter your email.');
    }
    if (!password) {
      setPasswordError('Please enter your password.');
    }
  
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await response.json();
  
    if (response.ok) {
      console.log('Token:', data.token);
      const decodedToken = jwtDecode(data.token);
      const username = decodedToken.username;
      setGlobalUsername(username);
      console.log('Username:', username);
      navigate('/');
    } else {
      console.error(data.message);
      setLoginError('Incorrect login. Please try again.'); // set login error if login fails
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input 
            type="email" 
            value={email} 
            onChange={handleEmailChange} 
            required 
          />
        </label>
        <br />
        <label>
          Password:
          <input 
            type="password" 
            value={password} 
            onChange={handlePasswordChange} 
            required 
          />
        </label>
        <br />
        <button type="submit">Sign In</button>
        <p>{emailError}</p>
        <p>{passwordError}</p>
        <p>{loginError}</p> {/* display login error */}
      </form>
    </div>
  );
}

export default Login;