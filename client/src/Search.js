import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import { UserContext } from './UserContext';
import ListOptions from './ListOptions.js';
import ReviewOptions from './ReviewOptions.js';
import similarity from 'string-similarity';

function SearchArea({setResults: setResultsProp, selectedItem}) {
    const [name, setName] = useState('');
    const [power, setPower] = useState('');
    const [publisher, setPublisher] = useState('');
    const [race, setRace] = useState('');
    const [results, setResults] = useState([]);
    const { username } = useContext(UserContext);

    useEffect(() => {
      searchSuperheroes();
    }, [name, power, publisher, race]);
  
    const handleInputChange = (event) => {
        switch (event.target.id) {
          case 'name-search':
            setName(event.target.value || null);
            break;
          case 'power-search':
            setPower(event.target.value || null);
            break;
          case 'publisher-search':
            setPublisher(event.target.value || null);
            break;
          case 'race-search':
            setRace(event.target.value || null);
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
        }else {
            // clear the results if all search fields are empty
            console.log('Clearing results');
            setResults([]);
            setResultsProp([]);
          }
      }
      
      const fetchSuperheroInfo = async (powerResults) => {
        try {
          const response = await fetch(`/api/open/superhero_info`, {
            method: 'GET',
          });
          const infoResults = await response.json();
          let filterResults = infoResults.filter(hero => hero.Publisher);
      
          
      
          if (power) {
            filterResults = filterResults.filter(hero => hero.name && powerResults.includes(hero.name.toLowerCase().trim()));
        }
        if (name) {
            filterResults = filterResults.filter(hero => hero.name && similarity.compareTwoStrings(name.trim(), hero.name.toLowerCase().trim()) > 0.5);
        }
        if (publisher) {
            filterResults = filterResults.filter(hero => hero.Publisher && similarity.compareTwoStrings(publisher.trim(), hero.Publisher.toLowerCase().trim()) > 0.5);
        }
        if (race) {
            filterResults = filterResults.filter(hero => hero.Race && similarity.compareTwoStrings(race.trim(), hero.Race.toLowerCase().trim()) > 0.5);
        }

          const powersResponse = await fetch(`/api/open/superhero_powers`);
          const allPowers = await powersResponse.json();
      
          const resultsWithPowers = filterResults.map(hero => {
            const heroPowersData = allPowers.find(powerData => powerData.hero_names === hero.name);
            let heroPowers = '';
            if (heroPowersData) {
              heroPowers = Object.keys(heroPowersData).filter(power => heroPowersData[power] === "True").join(', ');
            }
            return {...hero, powers: heroPowers};
          });
      
          setResults(resultsWithPowers);
          setResultsProp(resultsWithPowers); 
        } catch (error) {
          console.error('Error:', error);
        }
      }
      

  return (
    <div id="search-area">
      <h1>Search Options</h1>
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
    {username && <ListOptions />}
    {username && <ReviewOptions />}
    </div>
  );
}

export default SearchArea;