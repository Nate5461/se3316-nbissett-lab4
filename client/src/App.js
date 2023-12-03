import React from 'react';
import './App.css';
import './scripts.js';

import { Link, BrowserRouter as Router, Route, Routes} from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={
          <>
            <Header />
            <SplitContainer />
          </>
        } />
      </Routes>
    </Router>
  );
}

function Header() {
  return (
    <header>
      <Nav />
      <div className="content-area">
        <div className="search-area">
          <SearchArea />
        </div>
      </div>
    </header>
  );
} 

function Nav() {
  return (
    <nav>
      <div className="auth-buttons">
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
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


function Login() {
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
      <div>
        <input type="search" id="name-search" placeholder="Search by name..." />
      </div>
      <div>
        <input type="search" id="power-search" placeholder="Search by power..." />
      </div>
      <div>
        <input type="search" id="publisher-search" placeholder="Search by publisher..." />
      </div>
      <div>
        <input type="search" id="race-search" placeholder="Search by race..." />
      </div>
      <div>
        <button id="search-btn">Search</button>
      </div>
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