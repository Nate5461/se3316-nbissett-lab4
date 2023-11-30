import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Main />
    </div>
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
    <main>
      <ListActions />
      <SplitContainer />
    </main>
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