import React, { useState, useContext } from 'react';
import './App.css';
import { ResultsContext } from './ResultsContext';


function ListOptions() {
    const heroes = useContext(ResultsContext); // Assuming heroes is an array
    const [listname, setListname] = useState('');
    const [description, setDescription] = useState('');
    const [listnameError, setListnameError] = useState('');
    const [heroError, setHeroError] = useState('');
    const [visibility, setVisibility] = useState('private');

    const handleListnameChange = (e) => {
        setListname(e.target.value);
        setListnameError(''); // clear error when user starts typing
      };

      const handleDescriptionChange = (e) => { // Add this function
        setDescription(e.target.value);
    };

    const handleVisibilityChange = (e) => { // Add this function
        setVisibility(e.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // prevent default form submission behavior
      
        if (!listname) {
          setListnameError('Please enter a list name');
            return;
        }

        console.log(heroes, heroes.length, "heroes");
        if (!heroes || heroes.length === 0) {
            setHeroError('Please search heroes to add to list');
            return; 
        }
        
        const token = localStorage.getItem('token');
      
        const response = await fetch('/api/secure/createlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ listname, description, visibility, heroes }),
        });
    }

    return (
        <div id="list-options">
            <h1>List Options</h1>
            <input type="text" id="name" name="listName" placeholder="List Name..." onChange={handleListnameChange} />

            <textarea id="description" name="description" placeholder="Description...(optional)" onChange={handleDescriptionChange}></textarea>

            <div id="list-visibility">
                <label htmlFor="visibility">Visibility:</label>
                <select id="visibility" name="visibility" onChange={handleVisibilityChange}>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                </select>
            </div>
            <button type="submit" onClick={handleSubmit}>Create List</button>
            <p>{listnameError}</p>
            <p>{heroError}</p>
        </div>
    )
}

export default ListOptions;