import React, { useState, useContext } from 'react';
import './App.css';
import Signup from './signup.js';
import Login from './login.js';
import { UserContext } from './UserContext';
import { Link, BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import SearchArea from './Search.js';
import HeroCard from './HeroCard.js';
import Nav from './Nav.js';
import ChangePassword from './ChangePassword.js';
import ListDisplay from './ListDisplay.js';


function App() {

  const [results, setResults] = useState([]);
  const [username, setUsername] = useState('');

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      <Router>
        <Routes>
          <Route path="/login" element={
            <>
              <Header />
              <Login />
            </>
          } />
          
          <Route path="/signup" element={<>
            <Header/>
            <Signup />
          </>} />
          <Route path="/ChangePassword" element={<ChangePassword />} />
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
        <ListDisplay />
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