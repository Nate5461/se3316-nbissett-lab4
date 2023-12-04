import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState(''); // new state variable for username errors
  const [emailError, setEmailError] = useState(''); // new state variable for email errors
  const [passwordError, setPasswordError] = useState(''); // new state variable for password errors
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data.message);
      navigate('/login');
    } else {
      console.error(data.message);
      if (data.message === 'email already exists') {
        setEmailError(data.message); // set email error if email already exists
      } else if (data.errors && data.errors[0].param === 'username') {
        setUsernameError(data.errors[0].msg); // set username error
      } else if (data.errors && data.errors[0].param === 'email') {
        setEmailError(data.errors[0].msg); // set email error
      } else if (data.errors && data.errors[0].param === 'password') {
        setPasswordError(data.errors[0].msg); // set password error
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input id="makeUser" type="text" placeholder="UserName" value={username} onChange={e => {setUsername(e.target.value); setUsernameError('');}} required />
        <p>{usernameError}</p> {/* display username error */}
        <input id="makeEmail" type="email" placeholder="Email" value={email} onChange={e => {setEmail(e.target.value); setEmailError('');}} required />
        <p>{emailError}</p> {/* display email error */}
        <input id="makePass" type="password" placeholder="Password" value={password} onChange={e => {setPassword(e.target.value); setPasswordError('');}} required />
        <input id="confirmPass" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <p>{passwordError}</p> {/* display password error */}
        <button type="submit">Signup</button>
      </form> 
    </div>
  );
}

export default Signup;