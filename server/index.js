const express = require('express');
const app = express();

app.use(express.json());

const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://127.0.0.1:27017');

const jwt = require('jsonwebtoken');

async function startServer() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const superheroInfoCollection = client.db('mydb').collection('superheroInfo');
        const superheroPowersCollection = client.db('mydb').collection('superheroPowers');
        const superheroListsCollection = client.db('mydb').collection('superheroLists');
        const usersCollection = client.db('mydb').collection('userData');

        const port = 3000;

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

        app.use(express.static('../client/build'));

        const rateLimit = require('express-rate-limit');


        app.use(express.json({ limit: '1mb' })); 

        const { body, validationResult } = require('express-validator');

        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100000 // limit each IP to 1000 requests per windowMs
        });

        //Set up middleware
        app.use((req, res, next) => {
            console.log(`${req.method} request for ${req.url}`);
            next();
        })

        app.get('/api/open/superhero_info', async (req, res) => {
            console.log('Fetching superhero info...');
            try {
                const docs = await superheroInfoCollection.find().toArray();
                res.json(docs);
            } catch (err) {
                console.error('Error fetching superhero info:', err);
                res.status(500).send(err);
            }
        });

        app.get('/api/open/superhero_powers', async (req, res) => {
            console.log('Fetching superhero powers...')
            try {
                const docs = await superheroPowersCollection.find().toArray();
                
                res.json(docs);
            } catch (err) {
                console.error('Error fetching superhero powers:', err);
                res.status(500).send(err);
            }
        });

        //Get all superhero information
        /*
        app.get('/api/superhero_info/:id', async (req, res) => {
            const heroId = parseInt(req.params.id, 10); // Parse the id to an integer, if necessary
            try {
                const hero = await superheroInfoCollection.findOne({ id: heroId }); // Find the hero with the matching ID
                if (hero) {
                    res.json(hero); // Send the hero data
                } else {
                    res.status(404).send(`Hero with ID ${heroId} not found.`); // Send a 404 if not found
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while fetching the hero data.');
            }
        });
        */

        
        const bcrypt = require('bcrypt');


        app.post('/api/auth/register', [
            body('username').notEmpty().withMessage('Username is required'),
            body('password').notEmpty().withMessage('Password is required'),
            body('email').isEmail().withMessage('Email is required'),
        ], async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password, email } = req.body;

            try {
                // Check if the user already exists
                const existingUser = await usersCollection.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ message: 'email already exists' });
                }

                // Hash the password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Create a new user
                const newUser = {
                    username,
                    email,
                    password: hashedPassword,
                };

                try {
                    // Insert the new user into the database
                    const result = await usersCollection.insertOne(newUser);
                    res.status(201).json({ message: 'User registered successfully' });
                  } catch (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Failed to register user' });
                  }
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while registering the user');
            }
        });


        

        app.post('/api/auth/signin', async (req, res) => {
            const { email, password } = req.body;

            try {
                // Check if the user exists
                const user = await usersCollection.findOne({ email });
                if (!user) {
                    return res.status(401).json({ message: 'Invalid username or password' });
                }

                // Verify the password
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: 'Invalid username or password' });
                }

                // Generate a JWT token
                const token = jwt.sign({ username: user.username }, 'your-secret-key', { expiresIn: '1h' });

                res.json({ token });
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while signing in');
            }
        });


        

        app.get('/api/open/superhero_info/:id', async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const heroId = parseInt(req.params.id, 10); // Parse the id to an integer, if necessary
        
            try {
                const hero = await superheroInfoCollection.findOne({ id: heroId }); // Find the hero with the matching ID
                if (hero) {
                    const heroPowersEntry = await superheroPowersCollection.findOne({ hero_names: hero.name });
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
        
                    res.json({ ...hero, powers: heroPowers }); // Send the hero's info and powers
                } else {
                    res.status(404).send(`Hero with ID ${heroId} not found.`); // Send a 404 if not found
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while fetching the hero data.');
            }
        });

        app.get('/api/open/superhero_powers/bypower/:power', async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const searchPower = req.params.power.toLowerCase();
        
            try {
                const heroesWithPower = await superheroPowersCollection.find({}).toArray();
                const heroNames = heroesWithPower
                    .filter(hero => Object.keys(hero).some(key => key.toLowerCase().includes(searchPower) && hero[key] === "True"))
                    .map(hero => hero.hero_names); // Get hero names
        
                if (heroNames.length === 0) {
                    return res.status(404).send('No heroes found with that power.');
                }
        
                res.json(heroNames);
            } catch (err) {
                console.error('Error fetching heroes:', err);
                res.status(500).send('An error occurred while fetching the hero data.');
            }
        });

        app.get('/api/open/superhero_powers/byid/:id', async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const heroId = parseInt(req.params.id, 10); // Parse the id to an integer, if necessary
        
            try {
                const hero = await superheroInfoCollection.findOne({ id: heroId }); // Find the hero with the matching ID
                if (hero) {
                    const heroPowersEntry = await superheroPowersCollection.findOne({ hero_names: hero.name });
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
                } else {
                    res.status(404).send(`Hero with ID ${heroId} not found.`);
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while fetching the hero data.');
            }
        });

        app.get('/api/open/publishers', async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            try {
                const publishers = await superheroInfoCollection.distinct('Publisher');
                const uniquePublishers = publishers.filter(publisher => publisher.trim() !== "");
                res.json(uniquePublishers);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while fetching the publishers.');
            }
        });

        //Search for ids with given field/search term/ and number of results
        app.get('/api/superhero_info/:field/:pattern/:n?', async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const { field, pattern, n } = req.params;
            const numResults = n ? parseInt(n, 10) : Infinity; // Use Infinity when n is not provided
        
            try {
                const regex = new RegExp(pattern, 'i');
                const query = { [field]: regex };
                const heroes = await superheroInfoCollection.find(query).limit(numResults).toArray();
                const ids = heroes.map(hero => hero.id); // Assuming each hero object has an 'id' field
        
                res.json(ids);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while fetching the superhero data.');
            }
        });

        app.post('/api/superhero_lists/:listName', async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const newListName = req.params.listName;
        
            try {
                // Check if a list with the same name already exists
                const existingList = await superheroListsCollection.findOne({ name: newListName });
        
                if (existingList) {
                    return res.status(409).send(`The list named "${newListName}" already exists.`);
                }
        
                // If the list name does not exist, create a new list
                const newList = {
                    name: newListName,
                    heroes: [] // Start with an empty list of heroes
                };
        
                await superheroListsCollection.insertOne(newList);
        
                res.status(201).send(`New list named "${newListName}" created successfully.`);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while creating the superhero list.');
            }
        });

        app.put('/api/superhero_lists/:listName', async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const listName = req.params.listName;
            const superheroIds = req.body.superheroIds;
        
            try {
                const list = await superheroListsCollection.findOne({ name: listName });
        
                if (!list) {
                    return res.status(404).send(`The list named "${listName}" does not exist.`);
                }
        
                await superheroListsCollection.updateOne({ name: listName }, { $set: { heroes: superheroIds } });
        
                res.status(200).send(`Superhero IDs updated successfully in list "${listName}".`);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while updating the superhero list.');
            }
        });

        app.get('/api/superhero_lists/:listName', async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const listName = req.params.listName;
        
            try {
                const list = await superheroListsCollection.findOne({ name: listName });
        
                if (list) {
                    res.json(list.heroes); // Return the list of IDs
                } else {
                    res.status(404).send(`List named ${listName} not found.`);
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while fetching the superhero list.');
            }
        });


        app.get('/api/superhero_lists', async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            try {
                const lists = await superheroListsCollection.find({}).toArray();
                const listNames = lists.map(list => list.name); // Extract only the list names
        
                res.json(listNames);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while fetching the superhero lists.');
            }
        });


        app.delete('/api/superhero_lists/:listName', async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const listName = req.params.listName;
        
            try {
                const result = await superheroListsCollection.deleteOne({ name: listName });
        
                if (result.deletedCount === 0) {
                    res.status(404).send(`List named ${listName} does not exist.`);
                } else {
                    res.status(200).send(`List named ${listName} was deleted successfully.`);
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while deleting the superhero list.');
            }
        });

        app.get('/api/superhero_lists/:listName/details', async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const listName = req.params.listName;
        
            try {
                const list = await superheroListsCollection.findOne({ name: listName });
        
                if (!list) {
                    return res.status(404).send(`List named ${listName} not found.`);
                }
        
                const heroes = await superheroInfoCollection.find({ id: { $in: list.heroes } }).toArray();
                const powersList = await superheroPowersCollection.find({}).toArray();
        
                const listDetails = heroes.map(hero => {
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
                });
        
                res.json(listDetails);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while fetching the superhero list details.');
            }
        });

        

        //app.use(limiter);
        } catch (err) {
            console.error('Could not connect to MongoDB', err);
        }
}

startServer();


