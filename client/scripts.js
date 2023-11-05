
const searchHeros = async (searchField, searchTerm) => {
    try {
        const response = await fetch(`/api/superhero_info/${searchField}/${searchTerm}/50`);
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

document.getElementById('search-btn').addEventListener('click', function() {
    const searchTerm = document.getElementById('search-box').value;
    const searchField = document.getElementById('search-field').value;
    searchHeros(searchField, searchTerm) // Pass the searchTerm to the fetchHero function
    .then(data => {
        const display = document.getElementById('results');
        display.innerHTML = ''; // Clear previous results
        if(data.length === 0) {
            display.innerHTML = '<p>No superheroes found.</p>'; // Show message if no heroes found
            return;
        }
        
        const list = document.createElement('ul');

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
    })
    .catch(error => {
        console.error('There was an issue displaying the heroes:', error);
    });
});

