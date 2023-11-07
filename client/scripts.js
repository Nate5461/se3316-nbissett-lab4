let searchList = []

populateListDropdown();

const searchHeros = async (searchField, searchTerm) => {
    try {
        const response = await fetch(`/api/superhero_info/${searchField}/${searchTerm}`);
        if (response.ok) {
            const heros = await response.json();
            return heros;
        } else {
            console.error('Failed to fetch superheroes');
            return []; // Return an empty array to indicate no data
        }
    } catch (error) {
        console.error('Error:', error);
        return []; // Return an empty array on error
    }
};

const fetchHero = async (id) =>{
    try{
        const response = await fetch (`/api/superhero_info/${id}`);
        if (response.ok) {
            const heroInfo = await response.json();
            return heroInfo;
        } else {
            console.error(`Failed to get hero info for id:${id}`);
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

const searchPowers = async (power) =>{
    try{
        const response = await fetch (`/api/superhero_powers/${power}`);
        if (response.ok) {
            const heros = await response.json();
            return heros;
        } else {
            console.error('Error:', error);
            return [];
        }
    } catch(error){
        console.error('Error:', error);
        return[];
    }
}

document.getElementById('create-list').addEventListener('click', addNewList);

function createList(callback) {
    const listName = document.getElementById('list-name').value; // .value to get the input value
    //JSON.stringify({ name: listName })
    fetch(`/api/superhero_lists/${listName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`); // Throw an error for non-2xx responses
        }

        return 'List created'
    })
    .then(data => {
        // Call the callback function when the list is created successfully
        populateListDropdown();
        callback(data);
    })
    .catch(error => {
        console.log('There was an error:', error.message);
    });
}

function createCharacterInfoItem(info, list) {
    

    // Create the main list item
    const item = document.createElement('li');
    

    // Create and set the header text
    const head = document.createElement('h2'); // 'h' is not a valid tag, you probably meant 'h2' or some other level
    head.textContent = info.name;
  
    // Create the sub-list
    const infoList = document.createElement('ul');
    
    // Create list items for each piece of information
    const genderItem = document.createElement('li');
    const eyeItem = document.createElement('li');
    const raceItem = document.createElement('li');
    const hairItem = document.createElement('li');
    const heightItem = document.createElement('li');
    const publisherItem = document.createElement('li');
    const skinItem = document.createElement('li');
    const alignmentItem = document.createElement('li');
    const weightItem = document.createElement('li');
    
    // Set the text content for each list item using the info object
    genderItem.textContent = `Gender: ${info.Gender}`; // Assuming the property is 'gender' not 'Gender'
    eyeItem.textContent = `Eye Color: ${info['Eye color']}`; // Corrected property name
    raceItem.textContent = `Race: ${info.Race}`;
    hairItem.textContent = `Hair Color: ${info['Hair color']}`; // Corrected property name
    heightItem.textContent = `Height: ${info.Height}`;
    publisherItem.textContent = `Publisher: ${info.Publisher}`;
    skinItem.textContent = `Skin Color: ${info['Skin color']}`; // Corrected property name
    alignmentItem.textContent = `Alignment: ${info.Alignment}`;
    weightItem.textContent = `Weight: ${info.Weight}`;
  
    // Append each detail item to the info list
    [genderItem, eyeItem, raceItem, hairItem, heightItem, publisherItem, skinItem, alignmentItem, weightItem].forEach(detailItem => {
      infoList.appendChild(detailItem);
    });
    
    // Append the header and info list to the main list item
    item.appendChild(head);
    item.appendChild(infoList);
    
    // Append the main list item to the parent list
    list.appendChild(item);
  }



document.getElementById('search-btn').addEventListener('click', function() {
    const searchTerm = document.getElementById('search-box').value;
    const searchField = document.getElementById('search-field').value;
    const display = document.getElementById('results');

    display.innerHTML = ''; // Clear previous results

    const msg = document.createElement('p');
    const list = document.createElement('ul');
    

    if (searchField == 'power') {
        searchPowers(searchTerm)
        .then( names => {
            if(names.length === 0) {
                msg.textContent = 'No superheroes found.'; // Show message if no heroes found
                display.appendChild(msg);
                return;
            } else {
                names.forEach(name => {
                    const item = document.createElement('li');
                    const infoList = document.createElement('ul');
                    const head = document.createElement('h');
                            
                    item.textContent = JSON.stringify(name);
                    list.appendChild(item);
                });

                display.appendChild(list); // Append the list to the display element

            }
        });
    } else{
        searchHeros(searchField, searchTerm) // Pass the searchTerm to the fetchHero function
        .then(data => {
          
            if(data.length === 0) {
                msg.textContent = 'No superheroes found.'; // Show message if no heroes found
                display.appendChild(msg);
                return;
            } else {
               
                searchList = [];
                // Iterate over the data and create list items based on the searchField
                data.forEach(hero => {
                    fetchHero(hero)
                    .then(info => {
                        
                        searchList.push(info.id);
                        createCharacterInfoItem(info, list);

                    });
                    
                });

                console.log("1" + searchList);

                display.appendChild(list); // Append the list to the display element
            }
            
            
        })
        .catch(error => {
            console.error('There was an issue displaying the heroes:', error);
        });
    }
});


function addHeroesToList(listName, heroIds) {
    console.log('adding ' + heroIds);
    const data = { superheroIds: heroIds };
    fetch(`/api/superhero_lists/${listName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(response => {
        if (response.ok) {
            console.log('Heroes added to the list successfully.');
        } else {
            console.error('Error adding heroes to list:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error adding heroes to list:', error);
    });
}



function addNewList(){
    const listName = document.getElementById('list-name').value;
    console.log('2' + searchList)
    try{
        
        createList(function(data) {
            // Now that the list is created, add heroes to it
            addHeroesToList(listName, searchList);
        });
    } catch (error) {
        console.log('There was an error:', error.message);
    }
    
    
}

function populateListDropdown() {
    const selectList = document.getElementById('select-list');
    selectList.innerHTML = ''; // Clear existing options

    // Fetch the list of superhero lists from the server
    fetch('/api/superhero_lists')
        .then((response) => response.json())
        .then((data) => {
            data.forEach((list) => {
                const option = document.createElement('option');
                option.value = list;
                option.textContent = list;
                selectList.appendChild(option);
            });
        })
        .catch((error) => {
            console.error('Error fetching superhero lists:', error);
        });
}

document.getElementById('select-list').addEventListener('change', (event) => {
    const selectedList = event.target.value;
    loadHeroesForList(selectedList);
    
});

function loadHeroesForList(selectedList) {
   
    const list = document.createElement('ul');
    const display = document.getElementById('list-results');

    display.innerHTML = ''; // Clear previous results

    fetch(`/api/superhero_lists/${selectedList}`)
        .then((response) => response.json())
        .then((data) => {
            data.forEach((hero) => {
                fetchHero(hero)
                    .then(info => {
                        
                        createCharacterInfoItem(info, list);

                    });
               
                
            });
            display.appendChild(list)
        })
        .catch((error) => {
            console.error('Error fetching superhero lists:', error);
        });
}
