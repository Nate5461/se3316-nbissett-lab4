

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
                    item.textContent = `${name}`;
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

                // Iterate over the data and create list items based on the searchField
                data.forEach(hero => {
                    fetchHero(hero)
                    .then(info => {
                        const item = document.createElement('li');
                        item.textContent = `${info.name}`;
                        list.appendChild(item);
                    });
                
                });

                display.appendChild(list); // Append the list to the display element
            }
            
            
        })
        .catch(error => {
            console.error('There was an issue displaying the heroes:', error);
        });
    }
    
});

