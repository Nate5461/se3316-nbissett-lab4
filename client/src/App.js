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
import { ResultsContext } from './ResultsContext.js';


function App() {

  const [results, setResults] = useState([]);
  const [username, setUsername] = useState('');

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      <ResultsContext.Provider value={{ results, setResults }}>
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
      </ResultsContext.Provider>
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
  const [selectedItem, setSelectedItem] = useState('public');

  const handleSelectedItemChange = (newSelectedItem) => {
    setSelectedItem(newSelectedItem);
  };

  return (
    <section id="split-container">
      <div id="search-area">
        <SearchArea setResults={setResults} selectedItem={selectedItem} />
      </div>
      <div id="display-area">
        <DisplayArea results={results} />
      </div>
      <div id="list-area">
        <ListDisplay onSelectedItemChange={handleSelectedItemChange}/>
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