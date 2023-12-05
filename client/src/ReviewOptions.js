import React from 'react';
import './App.css';

function ReviewOptions () {
  return (
    <div className='review-options'>
      <div> 
        <h3>Add review</h3>
        <div className='review-options-header'>
        <label htmlFor='rating'>Rating:</label>
        <select id="rating" name = "rating">
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </select>
        </div>
        <textarea id = "review-desc" placeholder='Add review here...'></textarea>
      </div>
    </div>
  );
}

export default ReviewOptions;
