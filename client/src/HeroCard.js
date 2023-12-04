import React from "react";
import "./App.css";

function HeroCard({ hero }) {
    return (
        <div className="hero-card">
            <h2>{hero.name}</h2>
            <p>{hero.Publisher}</p>
            <div className="hero-details">
                <p>Race: {hero.Race}</p>
                <p>Gender: {hero.Gender}</p>
                <p>Eye color: {hero["Eye color"]}</p>
                <p>Hair color: {hero["Hair color"]}</p>
                <p>Height: {hero.Height}</p>
                <p>Skin color: {hero["Skin color"]}</p>
                <p>Alignment: {hero.Alignment}</p>
                <p>Weight: {hero.Weight}</p>
            </div>
        </div>
    );
}

export default HeroCard;