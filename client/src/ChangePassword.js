import React, { useState, useContext } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
  const navigate = useNavigate();
  const { setUsername: setGlobalUsername } = useContext(UserContext);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

  const handleOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
    setOldPasswordError('');
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setNewPasswordError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!oldPassword) {
      setOldPasswordError('Please enter your old password.');
    }
    if (!newPassword) {
      setNewPasswordError('Please enter your new password.');
    }
  
    const token = localStorage.getItem('token'); // replace this with how you're storing your token
    
    console.log('Token:', token);

    const response = await fetch('/api/auth/change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  
    if (response.ok) {
      const data = await response.json();
      setGlobalUsername(null);
      navigate('/login');
    } else {
      console.error('Password change failed');
      setChangePasswordError('Failed to change password. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label>
          Old Password:
          <input 
            type="password" 
            value={oldPassword} 
            onChange={handleOldPasswordChange} 
            required 
          />
        </label>
        <br />
        <label>
          New Password:
          <input 
            type="password" 
            value={newPassword} 
            onChange={handleNewPasswordChange} 
            required 
          />
        </label>
        <br />
        <button type="submit">Change Password</button>
        <p>{oldPasswordError}</p>
        <p>{newPasswordError}</p>
        <p>{changePasswordError}</p>
      </form>
    </div>
  );
}

export default ChangePassword;