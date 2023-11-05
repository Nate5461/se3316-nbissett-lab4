const express = require('express');
const fs = require('fs'); 

const path = require('path');
const listsFilePath = path.join(__dirname, 'superhero_lists.json');

const app = express();
const port = 3000;





app.use('/', express.static('../client'));


//More middleware for json parsing
app.use(express.json());


//Set up middleware
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
})



// Send JSON file for the first route
app.get('/api/superhero_info', (req, res) => {
    fs.readFile('./superhero_info.json', 'utf8', (err, data) => {
        res.json(JSON.parse(data));
    });
});

// Send JSON file for the second route
app.get('/api/superhero_powers', (req, res) => {
    fs.readFile('./superhero_powers.json', 'utf8', (err, data) => {
        res.json(JSON.parse(data));
    });
});

//Get all superhero information
app.get('/api/superhero_info/:id', (req, res) => {
    const heroId = parseInt(req.params.id, 10); // Parse the id to an integer, if necessary
    fs.readFile('../superhero_info.json', 'utf8', (err, data) => {
        try {
            const heroes = JSON.parse(data); // Parse the JSON data
            const hero = heroes.find(h => h.id === heroId); // Find the hero with the matching ID
            if (hero) {
                res.json({ name: hero.name }); // Send only the hero's name
            } else {
                res.status(404).send(`Hero with ID ${heroId} not found.`); // Send a 404 if not found
            }
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('An error occurred while parsing the JSON data.');
        }
    });
});



// Get all hero names that have a superpower matching the search term (partial matches included)
app.get('/api/superhero_powers/:power', (req, res) => {
    const searchPower = req.params.power.toLowerCase();

    fs.readFile('../superhero_powers.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('An error occurred while reading the superhero data.');
        }
        
        try {
            const heroesList = JSON.parse(data);
            const heroesWithPower = heroesList
                .filter(hero => {
                    // Check for partial match in power keys
                    return Object.keys(hero).some(key => 
                        key.toLowerCase().includes(searchPower) && hero[key] === "True"
                    );
                })
                .map(hero => hero.hero_names); // Get hero names

            if (heroesWithPower.length === 0) {
                return res.status(404).send('No heroes found with that power.');
            }

            res.json(heroesWithPower);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('An error occurred while parsing the superhero data.');
        }
    });
});




//Get all hero Powers 
app.get('/api/superhero_powers/:id', (req, res) => {
    const heroId = parseInt(req.params.id, 10);
    fs.readFile('../superhero_info.json', 'utf8', (err, data) => {
        try {
            const heroes = JSON.parse(data);
            const hero = heroes.find(h => h.id === heroId);
            if (hero) {
                fs.readFile('../superhero_powers.json', 'utf8', (err, data) => {
                    try {
                        const powersList = JSON.parse(data);
                        const heroPowersEntry = powersList.find(p => p.hero_names === hero.name);
                        if (heroPowersEntry) {
                            // Filter powers where the value is "True"
                            let truePowers = Object.keys(heroPowersEntry)
                                .filter(key => heroPowersEntry[key] === "True")
                                .reduce((obj, key) => {
                                    obj[key] = true;
                                    return obj;
                                }, {});

                            res.json({ name: hero.name, powers: truePowers });
                        } else {
                            res.status(404).send(`Powers for hero ${hero.name} not found.`);
                        }
                    } catch (parseError) {
                        console.error(parseError);
                        res.status(500).send('An error occurred while parsing the powers JSON data.');
                    }
                });
            } else {
                res.status(404).send(`Hero with ID ${heroId} not found.`);
            }
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('An error occurred while parsing the info JSON data.');
        }
    });
});

//Get all unique publishers
app.get('/api/publishers', (req, res) => {
    fs.readFile('../superhero_info.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the superhero info JSON file.');
        }
        try {
            const heroes = JSON.parse(data);
            // Extract all publishers using map, filter out empty strings, and then filter for unique values using a Set
            const publishers = heroes.map(hero => hero.Publisher).filter(publisher => publisher.trim() !== "");
            const uniquePublishers = [...new Set(publishers)];
            res.json(uniquePublishers);
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('An error occurred while parsing the superhero info JSON data.');
        }
    });
});

//Search for ids with given field/search term/ and number of results
app.get('/api/superhero_info/:field/:pattern/:n?', (req, res) => {
    const { field, pattern, n } = req.params;
    const numResults = n ? parseInt(n, 10) : Infinity; // Use Infinity when n is not provided

    fs.readFile('../superhero_info.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the superhero info JSON file.');
        }
        try {
            const heroes = JSON.parse(data);
            // Filter heroes by pattern in the specified field
            const matches = heroes.filter(hero => {
                const fieldValue = hero[field];
                // We check if fieldValue exists and if it matches the pattern
                return fieldValue && new RegExp(pattern, 'i').test(fieldValue);
            });

            // Limit the number of results if needed
            const limitedResults = matches.slice(0, numResults);
            const ids = limitedResults.map(match => match.id); // Assuming each hero object has an 'id' field

            res.json(ids);
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('An error occurred while parsing the superhero info JSON data.');
        }
    });
});





//Create a List if the list name doesn't exist, creates a json file if it doesn't exist
app.post('/api/superhero_lists/:listName', (req, res) => {
    const newListName = req.params.listName;

    // First, check if the superhero_lists.json file exists
    fs.access(listsFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            // The file does not exist, so we create a new one with the new list
            const lists = [{
                name: newListName,
                heroes: [] // Start with an empty list of heroes
            }];

            fs.writeFile(listsFilePath, JSON.stringify(lists, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error(writeErr);
                    return res.status(500).send('An error occurred while creating the superhero lists JSON file.');
                }
                return res.status(201).send(`New list named "${newListName}" created successfully.`);
            });
        } else {
            // The file exists, so we read it and then proceed
            fs.readFile(listsFilePath, 'utf8', (readErr, data) => {
                if (readErr) {
                    console.error(readErr);
                    return res.status(500).send('An error occurred while reading the superhero lists JSON file.');
                }
                
                try {
                    const lists = JSON.parse(data);

                    // Check if the list name already exists
                    if (lists.some(list => list.name === newListName)) {
                        return res.status(409).send(`The list named "${newListName}" already exists.`);
                    }

                    // If the list name does not exist, create a new list
                    lists.push({
                        name: newListName,
                        heroes: [] // Start with an empty list of heroes
                    });

                    // Save the updated lists back to the file
                    fs.writeFile(listsFilePath, JSON.stringify(lists, null, 2), 'utf8', (writeErr) => {
                        if (writeErr) {
                            console.error(writeErr);
                            return res.status(500).send('An error occurred while writing to the superhero lists JSON file.');
                        }
                        res.status(201).send(`New list named "${newListName}" created successfully.`);
                    });
                    
                } catch (parseError) {
                    console.error(parseError);
                    res.status(500).send('An error occurred while parsing the superhero lists JSON data.');
                }
            });
        }
    });
});


//Puts the given id's into the list only if that list exists
app.put('/api/superhero_lists/:listName', (req, res) => {

    const listName = req.params.listName;

    const superheroIds = req.body.superheroIds; 

    // Check if the superhero_lists.json file exists
    fs.readFile(listsFilePath, 'utf8', (readErr, data) => {
        if (readErr) {
            // If the file does not exist or can't be read, we assume the list does not exist
            console.error(readErr);
            return res.status(404).send(`The list named "${listName}" does not exist.`);
        }
        
        try {
            let lists = JSON.parse(data);

            // Find the index of the list with the given name
            const listIndex = lists.findIndex(list => list.name === listName);

            if (listIndex === -1) {
                // The list name does not exist
                return res.status(404).send(`The list named "${listName}" does not exist.`);
            }

            // Replace existing superhero IDs with new values
            lists[listIndex].heroes = superheroIds;

            // Write the updated data back to the file
            fs.writeFile(listsFilePath, JSON.stringify(lists, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error(writeErr);
                    return res.status(500).send('An error occurred while writing to the superhero lists JSON file.');
                }
                res.status(200).send(`Superhero IDs updated successfully in list "${listName}".`);
            });
            
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('An error occurred while parsing the superhero lists JSON data.');
        }
    });
});

// Get ids from a given list
app.get('/api/superhero_lists/:listName', (req, res) => {
    const listName = req.params.listName;
    
    // Read the superhero lists file
    fs.readFile('../superhero_lists.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the lists JSON file.');
        }
  
        try {
            const lists = JSON.parse(data);
            // Find the list by name
            const listObject = lists.find(list => list.name === listName);
  
            if (listObject) {
                res.json(listObject.heroes); // Return the list of IDs
            } else {
                res.status(404).send(`List named ${listName} not found.`);
            }
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('An error occurred while parsing the lists JSON data.');
        }
    });
});


// Delete a list with a given name
app.delete('/api/superhero_lists/:listName', (req, res) => {
    const listName = req.params.listName;

    // Read the superhero lists file
    fs.readFile('../superhero_lists.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the lists JSON file.');
        }

        try {
            let lists = JSON.parse(data);
            const listIndex = lists.findIndex(list => list.name === listName);

            if (listIndex > -1) {
                // Remove the list from the array
                lists.splice(listIndex, 1);

                // Write the updated array back to the file
                fs.writeFile('../superhero_lists.json', JSON.stringify(lists, null, 2), (writeErr) => {
                    if (writeErr) {
                        console.error(writeErr);
                        return res.status(500).send('An error occurred while writing to the lists JSON file.');
                    }
                    res.status(200).send(`List named ${listName} was deleted successfully.`);
                });
            } else {
                // List not found
                res.status(404).send(`List named ${listName} does not exist.`);
            }
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('An error occurred while parsing the lists JSON data.');
        }
    });
});


app.get('/api/superhero_lists/:listName/details', (req, res) => {
    const listName = req.params.listName;

    // Read the superhero lists file
    fs.readFile('../superhero_lists.json', 'utf8', (listsErr, listsData) => {
        if (listsErr) {
            console.error(listsErr);
            return res.status(500).send('An error occurred while reading the lists JSON file.');
        }

        try {
            const lists = JSON.parse(listsData);
            const list = lists.find(l => l.name === listName);

            if (!list) {
                return res.status(404).send(`List named ${listName} not found.`);
            }

            // Read the superhero info file
            fs.readFile('../superhero_info.json', 'utf8', (infoErr, infoData) => {
                if (infoErr) {
                    console.error(infoErr);
                    return res.status(500).send('An error occurred while reading the info JSON file.');
                }

                try {
                    const heroes = JSON.parse(infoData);

                    // Read the superhero powers file
                    fs.readFile('../superhero_powers.json', 'utf8', (powersErr, powersData) => {
                        if (powersErr) {
                            console.error(powersErr);
                            return res.status(500).send('An error occurred while reading the powers JSON file.');
                        }

                        try {
                            const powersList = JSON.parse(powersData);

                            // Combine the heroes' info and powers based on IDs
                            const listDetails = list.heroes.map(heroId => {
                                const hero = heroes.find(h => h.id === heroId);
                                if (hero) {
                                    const heroPowersEntry = powersList.find(p => p.hero_names === hero.name);
                                    let heroPowers = {};

                                    if (heroPowersEntry) {
                                        heroPowers = Object.entries(heroPowersEntry)
                                            .reduce((obj, [key, value]) => {
                                                if (value === "True") {
                                                    obj[key] = true;
                                                }
                                                return obj;
                                            }, {});
                                    }

                                    return {
                                        id: hero.id,
                                        name: hero.name,
                                        information: hero,
                                        powers: heroPowers
                                    };
                                }
                                return null;
                            }).filter(h => h !== null); // Filter out any nulls

                            res.json(listDetails);
                        } catch (parseError) {
                            console.error(parseError);
                            res.status(500).send('An error occurred while parsing the powers JSON data.');
                        }
                    });
                } catch (parseError) {
                    console.error(parseError);
                    res.status(500).send('An error occurred while parsing the info JSON data.');
                }
            });
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('An error occurred while parsing the lists JSON data.');
        }
    });
});





app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
