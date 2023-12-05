import React from 'react';
import './App.css';

function ListOptions() {


    return (
        <div id="list-options">
            <h1>List Options</h1>
            <input type="text" id="name" name="listName" placeholder="List Name..." />

            
            <textarea id="description" name="description" placeholder="Description...(optional)"></textarea>

            <div id="list-visibility">
                <label htmlFor="visibility">Visibility:</label>
                <select id="visibility" name="visibility">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
            </div>
            <button type="submit">Create List</button>
        </div>
    )
}

export default ListOptions;
