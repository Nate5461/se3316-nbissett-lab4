import React, { useState, useEffect } from 'react';
import './App.css';
import HeroCard from './HeroCard.js';

function SearchArea() {
    const [name, setName] = useState('');
    const [power, setPower] = useState('');
    const [publisher, setPublisher] = useState('');
    const [race, setRace] = useState('');
    const [results, setResults] = useState([]);
  
    useEffect(() => {
      searchSuperheroes();
    }, [name, power, publisher, race]);
  
    const handleInputChange = (event) => {
      switch (event.target.id) {
        case 'name-search':
          setName(event.target.value);
          break;
        case 'power-search':
          setPower(event.target.value);
          break;
        case 'publisher-search':
          setPublisher(event.target.value);
          break;
        case 'race-search':
          setRace(event.target.value);
          break;
        default:
          break;
      }
    };

    const searchSuperheroes = () => {
        if (name || power || publisher || race) {
          if (power) {
            fetch(`/api/open/superhero_powers/bypower/${power}`, {
              method: 'GET',
            })
            .then(response => response.json())
            .then(powerResults => {
              const lowerCasePowerResults = powerResults.map(result => result.toLowerCase());
              fetchSuperheroInfo(lowerCasePowerResults);
            })
            .catch(error => console.error('Error:', error));
          } else {
            fetchSuperheroInfo([]);
          }
        }
      }
      
      const fetchSuperheroInfo = (powerResults) => {
        fetch(`/api/open/superhero_info`, {
          method: 'GET',
        })
        .then(response => response.json())
        .then(infoResults => {
        let filterResults = infoResults.filter(hero => hero.Publisher);
        if (power) {
            filterResults = filterResults.filter(hero => hero.name && powerResults.includes(hero.name.toLowerCase()));
        }
        if (name) {
            filterResults = filterResults.filter(hero => hero.name && hero.name.toLowerCase().includes(name.toLowerCase()));
        }
        if (publisher) {
            filterResults = filterResults.filter(hero => hero.Publisher.toLowerCase().includes(publisher.toLowerCase()));
        }
        if (race) {
            filterResults = filterResults.filter(hero => hero.Race && hero.Race.toLowerCase().includes(race.toLowerCase()));
        }
        setResults(filterResults);
        })
        .catch(error => console.error('Error:', error));
      }
      

  return (
    <div id="search-area">
      <div>
        <input type="search" id="name-search" placeholder="Search by name..." onChange={handleInputChange} />
      </div>
      <div>
        <input type="search" id="power-search" placeholder="Search by power..." onChange={handleInputChange} />
      </div>
      <div>
        <input type="search" id="publisher-search" placeholder="Search by publisher..." onChange={handleInputChange} />
      </div>
      <div>
        <input type="search" id="race-search" placeholder="Search by race..." onChange={handleInputChange} />
      </div>
      <div className="results-container">
        {results.map((hero, index) => (
            <HeroCard key={index} hero={hero} />
        ))}
      </div>
    </div>
  );
}

export default SearchArea;