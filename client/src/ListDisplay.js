import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from './UserContext';
import ListCard from './ListCard'; // Import the ListCard component
import { SelectedListContext } from './SelectedListContext';
import './App.css';

const ListDisplay = ({ signedIn, onSelectedItemChange }) => {
  const [selectedItem, setSelectedItem] = useState('public');
  const [userLists, setUserLists] = useState([]);
  const { username } = useContext(UserContext);
  const { selectedList, setSelectedList } = useContext(SelectedListContext); // Use useContext here

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onSelectedItemChange(item);
  };

  const handleListClick = (id) => {
    console.log('handle list click' + id);
    setSelectedList(id);
  };

  useEffect(() => {
    if (selectedItem === 'mylists') {
      // Get the JWT from wherever you're storing it
      const token = localStorage.getItem('token');

      // Call the endpoint
      fetch('/api/secure/lists', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        console.log('Raw response:', response);
        return response.json();
    })
    .then(setUserLists)
    .catch(console.error);
    }
  }, [selectedItem]);

  useEffect(() => {
    let endpoint;
    let headers = {};
  
    if (selectedItem === 'mylists') {
      endpoint = '/api/secure/lists';
      const token = localStorage.getItem('token');
      headers['Authorization'] = `Bearer ${token}`;

    } else if (selectedItem === 'public') {
      endpoint = '/api/open/publicLists';
    }
  
    if (endpoint) {
      fetch(endpoint, { headers })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(setUserLists)
        .catch(console.error);
    }
  }, [selectedItem]);


  return (
    <div id="list-type">
      <div className="nav-bar">
        <div
          className={`nav-item ${selectedItem === 'public' ? 'selected' : ''}`}
          onClick={() => handleItemClick('public')}
        >
          Public
        </div>
        {username && (
          <div
            className={`nav-item ${selectedItem === 'mylists' ? 'selected' : ''}`}
            onClick={() => handleItemClick('mylists')}
          >
            My Lists
          </div>
        )}

      </div>
      <div className="list-container">
      {userLists.map(list => (
        <div key={list._id} onClick={() => handleListClick(list._id)}>
          <ListCard list={list} />
        </div>
      ))}
      </div>
    </div>
  );
};

export default ListDisplay;