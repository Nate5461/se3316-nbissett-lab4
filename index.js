const express = require('express');
const fs = require('fs'); // Filesystem module to read files


const app = express();
const port = 3000;


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
    fs.readFile('./superhero_info.json', 'utf8', (err, data) => {
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


//Get all hero Powers 
app.get('/api/superhero_powers/:id', (req, res) => {
    const heroId = parseInt(req.params.id, 10);
    fs.readFile('./superhero_info.json', 'utf8', (err, data) => {
        try {
            const heroes = JSON.parse(data);
            const hero = heroes.find(h => h.id === heroId);
            if (hero) {
                fs.readFile('./superhero_powers.json', 'utf8', (err, data) => {
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
    fs.readFile('./superhero_info.json', 'utf8', (err, data) => {
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

app.get('/api/search/:field/:pattern/:n?', (req, res) => {
    const { field, pattern, n } = req.params;
    const numResults = n ? parseInt(n, 10) : Infinity; // Use Infinity when n is not provided

    fs.readFile('./superhero_info.json', 'utf8', (err, data) => {
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







app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
