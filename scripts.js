let searchList = []

startup();

async function startup() {

    console.log('Startup');
    await populateListDropdown();

    
    const selectedList = document.getElementById('select-list').value

    console.log('selected list: ' + selectedList);

    loadHeroesForList(selectedList);
    
}

function sanitizeInput(input) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return input.replace(/[&<>"']/g, function (m) { return map[m]; });
}

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

const fetchHero = async (id) => {
    try {
        const response = await fetch(`/api/superhero_info/${id}`);
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


const searchPowers = async (power) => {
    try {
        const response = await fetch(`/api/superhero_powers/${power}`);
        if (response.ok) {
            const heros = await response.json();
            return heros;
        } else {
            //console.error('Error:', error);
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
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



function createCharacterInfoItem(infoList, list) {

    infoList.forEach(info => {

        // Create the main list item
        const item = document.createElement('li');


        // Create and set the header text
        const head = document.createElement('h2');
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
        const powerItem = document.createElement('li');
        const powersArray = Object.entries(info.powers)
            .filter(([power, hasPower]) => hasPower)
            .map(([power, hasPower]) => power);


        // Set the text content for each list item using the info object
        genderItem.textContent = `Gender: ${info.Gender}`;
        eyeItem.textContent = `Eye Color: ${info['Eye color']}`;
        raceItem.textContent = `Race: ${info.Race}`;
        hairItem.textContent = `Hair Color: ${info['Hair color']}`;
        heightItem.textContent = `Height: ${info.Height}`;
        publisherItem.textContent = `Publisher: ${info.Publisher}`;
        skinItem.textContent = `Skin Color: ${info['Skin color']}`;
        alignmentItem.textContent = `Alignment: ${info.Alignment}`;
        weightItem.textContent = `Weight: ${info.Weight}`;


        powerItem.textContent = `Powers: ${powersArray.join(', ')}`;


        // Append each detail item to the info list
        [genderItem, eyeItem, raceItem, hairItem, heightItem, publisherItem, skinItem, alignmentItem, weightItem, powerItem].forEach(detailItem => {
            infoList.appendChild(detailItem);
        });

        // Append the header and info list to the main list item
        item.appendChild(head);
        item.appendChild(infoList);

        // Append the main list item to the parent list
        list.appendChild(item);

    });

}


document.getElementById('delete-list').addEventListener('click', function () {
    const list = document.getElementById('select-list').value;


    deleteList(list)
    populateListDropdown()

})

function deleteList(listName) {
    fetch(`/api/superhero_lists/${listName}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },

    }).then(response => {
        if (response.ok) {
            console.log('List deleted');
        } else {
            console.error('Error deleting heroes from list:', response.statusText);
        }
    })
        .catch(error => {
            console.error('Error deleting heroes from list:', error);
        });
}

document.getElementById('search-btn').addEventListener('click', function () {
    const searchTerm = document.getElementById('search-box').value;
    const searchField = document.getElementById('search-field').value;
    const display = document.getElementById('results');
    const search = sanitizeInput(searchTerm);

    display.innerHTML = ''; // Clear previous results

    const msg = document.createElement('p');
    const list = document.createElement('ul');


    if (searchField == 'power') {
        searchPowers(search)
            .then(names => {
                if (names.length === 0) {
                    msg.textContent = 'No superheroes found.'; // Show message if no heroes found
                    display.appendChild(msg);
                    return;
                } else {
                    let promises = [];
                    names.forEach(name => {
                        promises.push(
                            searchHeros("name", name)
                                .then(idList => {
                                    let heroPromises = idList.map(id => fetchHero(id));
                                    return Promise.all(heroPromises);
                                })
                        );
                    });

                    Promise.all(promises).then(results => {
                        searchList = results.flat();

                        createCharacterInfoItem(searchList, list);

                        display.appendChild(list); // Append the list to the display element
                    });
                }
            });
    }
    else {
        searchHeros(searchField, search) // Pass the searchTerm to the fetchHero function
            .then(data => {

                if (data.length === 0) {
                    msg.textContent = 'No superheroes found.'; // Show message if no heroes found
                    display.appendChild(msg);
                    return;
                } else {

                    searchList = [];
                    // Iterate over the data and create list items based on the searchField
                    data.forEach(hero => {
                        searchList.push(fetchHero(hero));
                    });

                    Promise.all(searchList).then(results => {

                        createCharacterInfoItem(results, list);

                        display.appendChild(list); // Append the list to the display element
                        searchList = results
                    });

                }


            })
            .catch(error => {
                console.error('There was an issue displaying the heroes:', error);
            });
    }
});


function addHeroesToList(listName, heroIds) {

    const arr = []

    heroIds.forEach(id => {
        arr.push(id.id);
    });

    console.log('adding ' + arr);

    const data = { superheroIds: arr };
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



function addNewList() {
    const listName = document.getElementById('list-name').value;
    const list = sanitizeInput(listName);
    

    try {
        createList(function (data) {
            // Now that the list is created, add heroes to it
            addHeroesToList(list, searchList);
        });
    } catch (error) {
        console.log('There was an error:', error.message);
    }
}



function populateListDropdown() {
    const selectList = document.getElementById('select-list');
    selectList.innerHTML = ''; // Clear existing options

    // Fetch the list of superhero lists from the server
    return fetch('/api/superhero_lists')
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

document.getElementById('sort-dropdown').addEventListener('change', (event) => {
    const selectedList = document.getElementById('select-list').value
    loadHeroesForList(selectedList);
    const display = document.getElementById('results');
    const list = document.createElement('ul');

    display.innerHTML = ''; // Clear previous results

    sortHeroes(searchList, event.target.value);
    createCharacterInfoItem(searchList, list);

    display.appendChild(list); // Append the list to the display element



});

function sortHeroes(heroes, key) {
    return heroes.sort((a, b) => {
        if (key === 'power') {
            const powersA = Object.values(a.powers).filter(value => value === true).length;
            const powersB = Object.values(b.powers).filter(value => value === true).length;
            return powersB - powersA;
        } else {
            if (a[key] < b[key]) {
                return -1;
            }
            if (a[key] > b[key]) {
                return 1;
            }
            return 0;
        }
    });
}

function loadHeroesForList(selectedList) {
    const list = document.createElement('ul');
    const display = document.getElementById('list-results');
    const sortTerm = document.getElementById('sort-dropdown').value;

    const heroList = [];
    display.innerHTML = ''; // Clear previous results

    fetch(`/api/superhero_lists/${selectedList}`)
        .then((response) => response.json())
        .then((data) => {
            data.forEach(hero => {
                heroList.push(fetchHero(hero));
            });

            Promise.all(heroList).then(results => {

                sortHeroes(results, sortTerm);
                createCharacterInfoItem(results, list);

                display.appendChild(list); // Append the list to the display element

            });

        })

        .catch((error) => {
            console.error('Error fetching superhero lists:', error);
        });
}
