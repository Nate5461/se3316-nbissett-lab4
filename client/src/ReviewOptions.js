import React, { useState, useContext } from 'react';
import './App.css';
import { SelectedListContext } from './SelectedListContext';
import { jwtDecode } from "jwt-decode";

function ReviewOptions () {
  const [rating, setRating] = useState(1);
  const [review, setReview] = useState('');
  const selectedList = useContext(SelectedListContext);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const confirmReview = window.confirm('Are you sure you want to submit this review?');
    if (!confirmReview) {
        return;
    }
    
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const username = decodedToken.username;

    console.log('select' + selectedList.selectedList);
    const response = await fetch('/api/secure/review', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        listid: selectedList.selectedList, 
        username: username, 
        stars: rating,
        comment: review
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      console.log('An error occurred.');
    }
  };

  return (
    <div className='review-options'>
      <form onSubmit={handleSubmit}>
        <h3>Add review</h3>
        <div className='review-options-header'>
          <label htmlFor='rating'>Rating:</label>
          <select id="rating" name="rating" value={rating} onChange={e => setRating(e.target.value)}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
        </div>
        <textarea id="review-desc" placeholder='Add review here...' value={review} onChange={e => setReview(e.target.value)}></textarea>
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}

export default ReviewOptions;