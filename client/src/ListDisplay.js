import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from './UserContext';
import './App.css';
import SearchArea from './Search';


const ListDisplay = ({ signedIn, onSelectedItemChange }) => {
  const [selectedItem, setSelectedItem] = useState('public');
  const { username } = useContext(UserContext);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onSelectedItemChange(item);
  };

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
      <div className="list-container"></div>
        
    </div>
  );
};

export default ListDisplay;
