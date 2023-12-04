import React, { useState, useContext } from 'react';
import './App.css';
import Signup from './signup.js';
import Login from './login.js';
import { UserContext } from './UserContext';
import { Link, BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import SearchArea from './Search.js';
import HeroCard from './HeroCard.js';

function App() {

  const [results, setResults] = useState([]);
  const [username, setUsername] = useState('');

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <>
              <Header />
              <SplitContainer setResults={setResults} results={results}/>
            </>
          } />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

function Header() {
  return (
    <header>
      <Nav />
    </header>
  );
} 

function Nav() {
  const { username } = useContext(UserContext);

  return (
    <nav>
      <div className="auth-buttons">
      {username ? (
        <>
          <span>{username}</span>
          <Link to="/my-lists">My Lists</Link> 
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
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





function SplitContainer({ setResults, results }) {
  return (
    <section id="split-container">
      <div id="search-area">
        <SearchArea setResults={setResults} />
      </div>
      <div id="display-area">
        <DisplayArea results={results} />
      </div>
      <div id="list-area">

      </div>
    </section>
  );
}


function DisplayArea({ results }) {
  console.log('runs display area' + results);
  return (
    <div className="results-container">
      {results.map((hero, index) => (
        console.log('runs display area' + hero.name),
        <HeroCard key={index} hero={hero} />
      ))}
    </div>
  );
}

export default App;