import React, { useState, useContext } from 'react';
import './App.css';
import { Link, BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { UserContext } from './UserContext';
import { AdminContext } from './AdminContext.js';

function logout() {
    // Remove the token from local storage
    localStorage.removeItem('token');
  
    // Optionally, redirect the user to the login page
    window.location.href = '/';
  }

  


  function Nav() {
    const { username } = useContext(UserContext);
    const { isAdmin } = useContext(AdminContext);
  
    return (
      <nav>
        <div className="auth-buttons">
          {username ? (
            <div className='navver'>
            <div className="dropdown">
              <a>{username}</a>
              <div className="dropdown-content">
                <a onClick={logout}>Sign Out</a>
                <Link to="/ChangePassword">Change Password</Link>
              </div>
            </div>
            <Link to="/">Home</Link>
              {isAdmin && <Link to="/admin">Admin Page</Link>}
              <Link to="/dcmaNT">DCMA Policy</Link>
              <Link to="/dcmaSP">Privacy Policy</Link>
              <Link to="/aup">Acceptable Use Policy</Link>
              </div>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
              <Link to="/">Home</Link>
              <Link to="/dcmaNT">DCMA Policy</Link>
              <Link to="/dcmaSP">Privacy Policy</Link>
              <Link to="/aup">Acceptable Use Policy</Link>
            </>
          )}
        </div>
        <div className="title-area">
          <h1>
            <span className="title-text">SUPERHERO FINDER
              <div className="hover-box">
                <p>Step into the world of superheroes with our dynamic platform, where an extensive database awaits your exploration. Unleash the power of search to discover heroes based on their name, race, power, or publisher, and effortlessly delve into detailed information about each character. Whether you're a casual enthusiast or a dedicated fan, our site caters to all. Authenticated users can take their experience to the next level by creating personalized lists, managing heroes, and leaving reviews to share their passion with the community. Join us on this thrilling adventure where the extraordinary becomes ordinary, and every hero has a story to tell!</p>
              </div>
            </span>
          </h1>
        </div>
      </nav>
    );
  }

export default Nav;