import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from './UserContext';
import ListCard from './ListCard'; // Import the ListCard component
import { SelectedListContext } from './SelectedListContext';
import './App.css';

const ListDisplay = ({ signedIn, onSelectedItemChange }) => {
  const [selectedItem, setSelectedItem] = useState('public');
  const [userLists, setUserLists] = useState([]);
  const { username } = useContext(UserContext);
  const { selectedList, setSelectedList } = useContext(SelectedListContext); 

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onSelectedItemChange(item);
  };

  const handleListClick = (id) => {
    console.log('handle list click' + id);
    setSelectedList(id);
  };

  const handleDeleteClick = (id) => {

    const confirmDelete = window.confirm('Are you sure you want to submit this review?');

    if (!confirmDelete) {
        return;
    }

    
      console.log('handle delete click' + id);
      const token = localStorage.getItem('token');
      fetch(`/api/secure/lists/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          console.log('Raw response:', response);
          return response.json();
        })
        .then(data => {
          // Remove the deleted list from userLists
          const updatedLists = userLists.filter(list => list._id !== id);
          setUserLists(updatedLists);

          console.log('updated lists', updatedLists);

          if (updatedLists.length > 0) {
            setSelectedList(updatedLists[0]._id);
          } else {
            setSelectedList(null);
          }
  
        })
        .catch(console.error);
    

  };
  

  const handleEditClick = (id) => {
    console.log('handle edit click' + id);
    const token = localStorage.getItem('token');
    fetch(`/api/secure/lists/${id}`, {
      method: 'PUT',
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

      <div className="edit-bar">
        {selectedItem === 'mylists' && (
          <div>
            <button className='edit-item' onClick={() => handleEditClick(selectedList)}>Edit</button>
            <button className='edit-item' onClick={() => handleDeleteClick(selectedList)}>Delete</button>
          </div>
        )}
      </div>

      <div className="list-container">
        {userLists.map(list => (
          <div  key={list._id} onClick={() => handleListClick(list._id)}>
            <ListCard list={list} handleDeleteClick= {handleDeleteClick}/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListDisplay;