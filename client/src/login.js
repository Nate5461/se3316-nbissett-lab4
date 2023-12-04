import React, { useState, useContext } from 'react';
import './App.css';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';

function SignIn() {
    const navigate = useNavigate();
  const { setUsername: setGlobalUsername } = useContext(UserContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="text" value={email} onChange={handleEmailChange} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={handlePasswordChange} />
        </label>
        <br />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignIn;