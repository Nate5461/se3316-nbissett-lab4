const express = require('express');
const app = express();

app.use(express.json());

const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient('mongodb://127.0.0.1:27017');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

async function startServer() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const superheroInfoCollection = client.db('mydb').collection('superheroInfo');
        const superheroPowersCollection = client.db('mydb').collection('superheroPowers');
        const superheroListsCollection = client.db('mydb').collection('superheroLists');
        const usersCollection = client.db('mydb').collection('userData');
        const reviewsCollection = client.db('mydb').collection('reviews');

        const port = 3000;

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

        app.use(express.static('../client/build'));

        const rateLimit = require('express-rate-limit');

        app.use(passport.initialize());

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

        passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                const user = await usersCollection.findOne({ email });
                if (!user) {
                    return done(null, false, { message: 'Invalid username or password' });
                }
        
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return done(null, false, { message: 'Invalid username or password' });
                }
        
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }));
        

        const jwtOptions = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'your-secret-key'
        };
        
        passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
            try {
                const user = await usersCollection.findOne({ _id: new ObjectId(jwtPayload.sub) });
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            } catch (err) {
                return done(err, false);
            }
        }));

        

        
        // Use passport.authenticate middleware in your routes
        app.post('/api/auth/signin', passport.authenticate('local', { session: false }), (req, res) => {
            const token = jwt.sign({ sub: req.user._id, username: req.user.username }, 'your-secret-key', { expiresIn: '1h' });
            res.json({ token });
        });

        app.post('/api/auth/change', passport.authenticate('jwt', { session: false }), async (req, res) => {
            console.log('Change password request received');
            
            const { oldPassword, newPassword } = req.body;
          
            try {
              // Verify the old password
              const isPasswordValid = await bcrypt.compare(oldPassword, req.user.password);
              if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid old password' });
              }
          
              // Hash the new password
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash(newPassword, salt);
          
              // Update the user's password in the database
              await usersCollection.updateOne({ _id: req.user._id }, { $set: { password: hashedPassword } });
          
              res.json({ message: 'Password changed successfully' });
            } catch (err) {
              res.status(500).send('An error occurred while changing the password');
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

        app.put('/api/secure/review', passport.authenticate('jwt', { session: false }), async (req, res) => {
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const { listid, username, stars, comment } = req.body;
            const userId = req.user._id;
            const timestamp = new Date();
            try {
                    await reviewsCollection.insertOne({ 
                        listId: listid,
                        userId: userId,
                        username: username,
                        stars: stars,
                        comment: comment,
                        timestamp: timestamp});

                    res.status(201).json('Review created successfully.' );
                }
            catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while updating the review.');
            }
        });

        app.get('/api/secure/reviews/:listId', async (req, res) => {
            const { listId } = req.params;
            console.log('list id' + listId);
            
            try {
              const reviews = await reviewsCollection.find({ listId: listId }).toArray();

                console.log('reviews found' + JSON.stringify(reviews));
              const averageRating = reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length;
                console.log('ran' + averageRating);
              res.status(200).json({ reviews, averageRating });
            } catch (err) {
              console.error(err);
              res.status(500).send('An error occurred while fetching the reviews.');
            }
          });
        

        app.get('/api/secure/lists', passport.authenticate('jwt', { session: false }), async (req, res) => {
            const userId = req.user._id;
        
            try {
                const userLists = await superheroListsCollection
                    .find({ userId: new ObjectId(userId) })
                    .toArray();
        
                res.status(200).json(userLists);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while retrieving the user lists.');
            }
        });


        //Adds list to list collection
        app.post('/api/secure/createlists', passport.authenticate('jwt', { session: false }), async (req, res) => {

            console.log('working, id' + req.user._id);
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
        
            const { listname, description, visibility, heroes } = req.body;
        
            // Extract userId from the authenticated user
            const userId = req.user._id;
            const username = req.user.username;

            console.log('data' + listname + description + visibility + heroes + userId);
            try {
                // Check if a list with the same name already exists for the user
                const existingList = await superheroListsCollection.findOne({ listname, userId });
        
                if (existingList) {
                    console.log('List already exists');
                    return res.status(409).send(`The list named "${listname}" already exists.`);
                }
        
                // If the list name does not exist, create a new list
                const newList = {
                    listname,
                    description,
                    visibility: visibility || 'private', // Default to private if not provided
                    lastEdited: new Date(),
                    heroes: heroes || [], // Start with an empty list of heroes or use provided list
                    userId, // Add the userId to the list
                    username
                };
        
                await superheroListsCollection.insertOne(newList);
        
                res.status(201).json({ message: `New list named "${listname}" created successfully.`, list: newList });
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while creating the superhero list.');
            }
        });

        //Get most recent public lists
        app.get('/api/open/publicLists', async (req, res) => {
            try {
                const publicLists = await superheroListsCollection
                    .find({ visibility: 'public' })
                    .sort({ lastEdited: -1 }) // Sort by lastEdited in descending order
                    .limit(10)
                    .toArray();
                res.status(200).json(publicLists);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while retrieving the public lists.');
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


