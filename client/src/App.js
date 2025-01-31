import React, { useState, useContext, useEffect } from 'react';
import './App.css';
import Signup from './signup.js';
import Login from './login.js';
import { UserContext } from './UserContext';
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchArea from './Search.js';
import HeroCard from './HeroCard.js';
import Nav from './Nav.js';
import ChangePassword from './ChangePassword.js';
import ListDisplay from './ListDisplay.js';
import { ResultsContext } from './ResultsContext.js';
import { SelectedListContext } from './SelectedListContext.js';
import { DisplayListContext } from './DisplayListContext.js';
import AdminPage from './AdminPage.js';
import { AdminContext } from './AdminContext.js';

function App() {

  const [results, setResults] = useState([]);
  const [username, setUsername] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [displayList, setDisplayList] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('selectedList changed:', selectedList);
  }, [selectedList]);

  useEffect(() => {
    const checkIfAdmin = async () => {

      const token = localStorage.getItem('token');

      try {
        const response = await fetch('/api/secure/isAdmin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include your user's credentials in the headers
            'Authorization': `Bearer ${token}`, // replace `token` with your user's token
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('An error occurred while checking if the user is an admin:', error);
      }
    };

    if (username) {
      checkIfAdmin();
    }
  }, [username]);

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      <ResultsContext.Provider value={{ results, setResults }}>
        <SelectedListContext.Provider value={{ selectedList, setSelectedList }}>
          <DisplayListContext.Provider value={{ displayList, setDisplayList }}>
            <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
              <Router>
                <Routes>
                  <Route path="/login" element={
                    <>
                      <Header />
                      <Login />
                    </>
                  } />
                  <Route path="/dcmaNT" element={
                    <>
                      <Header />
                      <DCMANT />
                    </>
                  } />
                  <Route path="/dcmaSP" element={
                    <>
                      <Header />
                      <DCMASP />
                    </>
                  } />
                  <Route path="/aup" element={
                    <>
                      <Header />
                      <AUP />
                    </>
                  } />
                  <Route path="/dcmaNT/edit" element={
                    <>
                      <Header />
                      <DCMANTEdit />
                    </>
                  } />
                  <Route path="/dcmaSP/edit" element={
                    <>
                      <Header />
                      <DCMASPEdit />
                    </>
                  } />
                  <Route path="/aup/edit" element={
                    <>
                      <Header />
                      <AUPEdit />
                    </>
                  } />
                  <Route path="/admin" element={
                    <>
                      <Header />
                      <AdminPage />
                    </>
                  } />
                  <Route path="/signup" element={<>
                    <Header />
                    <Signup />
                  </>} />
                  <Route path="/ChangePassword" element={<ChangePassword />} />
                  <Route path="/" element={
                    <>
                      <Header />
                      <SplitContainer setResults={setResults} results={results} />
                    </>
                  } />
                </Routes>
              </Router>
            </AdminContext.Provider>
          </DisplayListContext.Provider>
        </SelectedListContext.Provider>
      </ResultsContext.Provider>
    </UserContext.Provider>
  );
}

function DCMANT() {
  const { isAdmin } = useContext(AdminContext);
  const [content, setContent] = useState('');

  useEffect(() => {
    console.log('Fetching data from /api/open/dcmaNT'); // Added console.log
    fetch('/api/open/dcmaNT')
      .then(response => {
        return response.json();
      })
      .then(data => {
        setContent(data[0].content);
      })
      .catch(error => {
        console.log('Error:', error); // Added console.log
      });
  }, []);

  return (
    <div>
      {isAdmin && <Link to="/dcmaNT/edit">Edit</Link>}
      <p>{content}</p>
    </div>
  );
}

function DCMANTEdit() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/api/open/dcmaNT')
      .then(response => response.json())
      .then(data => setContent(data[0].content))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
  
    const token = localStorage.getItem('token');

    fetch('/api/secure/dcmaNT', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify( { content: content} ),
    })
    .then(response => response.json())
    .then(data => {
      // Handle the response data
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
}

function DCMASP() {
  const { isAdmin } = useContext(AdminContext);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/api/open/dcmaSP')
      .then(response => response.json())
      .then(data => setContent(data[0].content))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div>
      {isAdmin && <Link to="/dcmaSP/edit">Edit</Link>}
      <p>{content}</p>
    </div>
  );
}

function DCMASPEdit() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/api/open/dcmaSP')
      .then(response => response.json())
      .then(data => setContent(data[0].content))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
  
    const token = localStorage.getItem('token');

    fetch('/api/secure/dcmaSP', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: content }),
    })
    .then(response => response.json())
    .then(data => {
      // Handle the response data
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
}



function AUP() {
  const { isAdmin } = useContext(AdminContext);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/api/open/aup')
      .then(response => response.json())
      .then(data => setContent(data[0].content))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div>
      {isAdmin && <Link to="/aup/edit">Edit</Link>}
      <p>{content}</p>
    </div>
  );
}

function AUPEdit() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/api/open/aup')
      .then(response => response.json())
      .then(data => setContent(data[0].content))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
  
    const token = localStorage.getItem('token');

    fetch('/api/secure/aup', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: content }),
    })
    .then(response => response.json())
    .then(data => {
      // Handle the response data
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button type="submit">Save</button>
    </form>
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
        <ListDisplay onSelectedItemChange={handleSelectedItemChange} />
      </div>
    </section>
  );
}


function DisplayArea({ results }) {
  return (
    <div className="results-container">
      {results.map((hero, index) => (
        <HeroCard key={index} hero={hero} />
      ))}
    </div>
  );
}

export default App;