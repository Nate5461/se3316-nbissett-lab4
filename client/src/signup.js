import React, { useState } from 'react';
import './App.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
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
    } else {
      console.error(data.errors[0].msg);
    }
  };

  return (
    <div className="form-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input id="makeUser" type="text" placeholder="UserName" value={username} onChange={e => setUsername(e.target.value)} />
        <input id="makeEmail" type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input id="makePass" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <input id="confirmPass" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        <button type="submit">Signup</button>
      </form> 
    </div>
  );
}

export default Signup;