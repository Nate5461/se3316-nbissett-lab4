import React, { useState, useEffect } from 'react';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [reviews, setReviews] = useState([]);

    const fetchData = () => {
        const token = localStorage.getItem('token');

        fetch('/api/secure/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => setUsers(data));

        fetch('/api/secure/reviews', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => setReviews(data));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleHidden = id => {
        const token = localStorage.getItem('token');
      
        fetch(`/api/secure/review/toggle/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json().catch(error => {
              // This catch handles the error thrown when the body is empty.
              // If the body is empty, we return a default value.
              return { success: true };
            });
          } else {
            throw new Error('Network response was not ok.');
          }
        })
        .then(data => {
          if (data.success) {
            fetchData();
          } else {
            console.error('Failed to toggle hidden status');
          }
        })
        .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));
      };


    const toggleActive = id => {
        const token = localStorage.getItem('token');
      
        fetch(`/api/secure/users/${id}/toggle-deactivated`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json().catch(error => {
              // This catch handles the error thrown when the body is empty.
              // If the body is empty, we return a default value.
              return { success: true };
            });
          } else {
            throw new Error('Network response was not ok.');
          }
        })
        .then(data => {
          if (data.success) {
            fetchData();
          } else {
            console.error('Failed to toggle active status');
          }
        })
        .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));
      };

      const toggleAdmin = id => {
        const token = localStorage.getItem('token');
      
        fetch(`/api/secure/users/${id}/toggle-admin`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json().catch(error => {
              // This catch handles the error thrown when the body is empty.
              // If the body is empty, we return a default value.
              return { success: true };
            });
          } else {
            throw new Error('Network response was not ok.');
          }
        })
        .then(data => {
          if (data.success) {
            fetchData();
          } else {
            console.error('Failed to toggle admin status');
          }
        })
        .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));
      };

    return (
        <div>
            <h1>Admin Page</h1>
            <div>
                <h2>Users</h2>
                <ul>
                    {users.map(user => {
                        console.log(user.username, user._id, user.isDisabled, "user info");
                        return (
                            <li key={user.id}>
                                {user.username}
                                <button onClick={() => toggleActive(user._id)}>
                                    {user.isDisabled ? 'Activate' : 'Deactivate'}
                                </button>
                                <button onClick={() => toggleAdmin(user._id)}>
                                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div>
                <h2>Reviews</h2>
                <ul>
                    {reviews.map(review => (
                        <li key={review.id}>
                            {reviews.map(review => (
                                <div key={review.id}>
                                    
                                    <p> Review: {review.stars} stars, by: {review.username} </p>
                                    <p>{review.comment}</p>
                                    <button onClick={() => toggleHidden(review._id)}>
                                        {review.hidden ? 'Unhide' : 'Hide'}
                                    </button>
                                </div>
                            ))}
                        </li>
                    ))}
                </ul>
            </div>

            
        </div>
    );
};

export default AdminPage;