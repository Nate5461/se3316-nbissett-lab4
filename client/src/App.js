import React from 'react';
import './App.css';

import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
      <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Other routes go here */}
        </Routes>
      </div>
    </Router>
  );
}

function Header() {
  return (
    <header>
      <h1>Superhero Finder</h1>
      <SearchArea />
    </header>
  );
}

function Login() {
  // Replace with your own login form
  return (
    <div>
      <h2>Login</h2>
      <form>
        <input type="text" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function Signup() {
  // Replace with your own signup form
  return (
    <div>
      <h2>Signup</h2>
      <form>
        <input id="makeUser" type="text" placeholder="UserName" />
        <input id= "makeEmail" type="text" placeholder="Email" />
        <input id="makePass" type="password" placeholder="Password" />
        <button type="submit">Signup</button>
      </form> 
    </div>
  );
}



function SearchArea() {
  return (
    <div id="search-area">
      <select id="search-field">
        <option value="name">Name</option>
        <option value="power">Power</option>
        <option value="Publisher">Publisher</option>
        <option value="Race">Race</option>
      </select>
      <input type="search" id="search-box" placeholder="Search..." />
      <button id="search-btn">Search</button>
    </div>
  );
}

function Main() {
  return (
    <div id="splashPage">
      <h1>Welcome to Nate's Superheros</h1>
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
    </div>
  );
}

function ListActions() {
  // ... similar to SearchArea ...
}

function SplitContainer() {
  return (
    <section id="split-container">
      <ListArea />
      <DisplayArea />
    </section>
  );
}

function ListArea() {
  // ... similar to SearchArea ...
}

function DisplayArea() {
  // ... similar to SearchArea ...
}

export default App;