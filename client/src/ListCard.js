import React, { useState, useEffect, useContext } from "react";
import "./App.css";
import HeroCard from "./HeroCard";
import { SelectedListContext } from './SelectedListContext';

function ListCard({ list }) {
    const [averageRating, setAverageRating] = useState(null);
    const { selectedList, setSelectedList } = useContext(SelectedListContext);


    const handleCardClick = (event) => {
        setSelectedList(list._id);
    };

    useEffect(() => {
        const fetchReviews = async () => {
          console.log('Fetching reviews for list', list._id);
      
          const response = await fetch(`/api/secure/reviews/${list._id}`);
      
          if (response.ok) {
            const data = await response.json();
            setAverageRating(data.averageRating);
          } else {
            console.error('An error occurred while fetching the reviews.');
          }
        };
      
        fetchReviews();
      }, [list._id]);

      const cardStyle = selectedList === list._id ? { backgroundColor: 'lightblue' } : {};

    return (
        <div className="list-card" onClick={handleCardClick} style={cardStyle}>
            <h2>{list.listname}</h2>
            <p>Created by: {list.username}</p>
            <p>Number of heros: {list.heroes.results.length}</p>
            <p>Average rating: {averageRating}</p>
            {selectedList === list._id && (
                <div>
                    {list.heroes.results.map((hero, index) => (
                        <HeroCard key={index} hero={hero} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ListCard;