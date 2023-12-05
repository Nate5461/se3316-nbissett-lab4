import React from "react";
import "./App.css";
import HeroCard from "./HeroCard";

function ListCard({ list }) {
    return (
        <div className="list-card">
            <h2>{list.listname}</h2>
            <p>Created by: {list.username}</p>
            <div>
                {list.heroes.results.map((hero, index) => (
                    <HeroCard key={index} hero={hero} />
                ))}
            </div>
        </div>
    );
}

export default ListCard;