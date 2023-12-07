import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from './UserContext';
import ListCard from './ListCard'; // Import the ListCard component
import { SelectedListContext } from './SelectedListContext';
import { DisplayListContext } from './DisplayListContext';
import './App.css';


const ListDisplay = ({ signedIn, onSelectedItemChange }) => {
  const [selectedItem, setSelectedItem] = useState('public');
  const [userLists, setUserLists] = useState([]);
  const { username } = useContext(UserContext);
  const { selectedList, setSelectedList } = useContext(SelectedListContext); 
  const { displayList, setDisplayList } = useContext(DisplayListContext);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onSelectedItemChange(item);
  };

  const handleListClick = (id) => {
    console.log('handle list click' + id);
    setSelectedList(id);
  };

  const handleDeleteClick = (id) => {

    const confirmDelete = window.confirm('Are you sure you want to delete this list?');

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
        .then(setDisplayList)
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
      .then()
      .catch(console.error);
  }

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
        .then(setDisplayList)
        .catch(console.error);
    }
  }, [selectedItem, displayList]);


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
        {displayList.map(list => (
          <div  key={list._id} onClick={() => handleListClick(list._id)}>
            <ListCard list={list} handleDeleteClick= {handleDeleteClick}/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListDisplay;