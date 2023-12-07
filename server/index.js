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

        const bcrypt = require('bcrypt');

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


        /*
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt);
        const username = 'admin';
        const email = 'admin';

        const adminUser = {
            username,
            email,
            password: hashedPassword,
            isAdmin: true,
        };
    
        usersCollection.insertOne(adminUser, function(err, res) {
            console.assert(null, err);
            console.log("Admin user inserted");
            client.close();
        });
        */


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


        app.get('/api/secure/isAdmin', passport.authenticate('jwt', { session: false }), async (req, res) => {
            const user = await usersCollection.findOne({ _id: new ObjectId(req.user._id) });

            if (!user) {
                return res.status(401).send('User not found.');
            }

            res.status(200).json({ isAdmin: user.isAdmin });
        });


        //Get user info
        app.get('/api/secure/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
            const user = await usersCollection.findOne({ _id: new ObjectId(req.user._id) });


            if (!user.isAdmin) {
                return res.status(403).send('You do not have permission to perform this action.');
            }

            try {
                const users = await usersCollection.find().toArray();
                res.status(200).json(users);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while retrieving the users.');
            }
        });


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
                    isAdmin: false,
                    isDisabled: false
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

                if (user.isDisabled) {
                    return done(null, false, { message: 'Your account is disabled' });
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
        app.post('/api/auth/signin', (req, res, next) => {
            passport.authenticate('local', { session: false }, (err, user, info) => {
              if (err) {
                return next(err);
              }
          
              if (!user) {
                return res.status(401).json({ message: info.message });
              }
          
              req.login(user, { session: false }, (err) => {
                if (err) {
                  return next(err);
                }
          
                const token = jwt.sign({ sub: req.user._id, username: req.user.username }, 'your-secret-key', { expiresIn: '1h' });
                return res.json({ token });
              });
            })(req, res, next);
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

        app.put('/api/secure/review/toggle/:reviewId', passport.authenticate('jwt', { session: false }), async (req, res) => {
            const reviewId = req.params.reviewId;

            try {
                const review = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });
                if (!review) {
                    return res.status(404).json({ message: 'Review not found' });
                }

                const updatedReview = await reviewsCollection.findOneAndUpdate(
                    { _id: new ObjectId(reviewId) },
                    { $set: { hidden: !review.hidden } },
                    { returnOriginal: false }
                );

                res.json(updatedReview.value);
            } catch (err) {
                console.error('Error toggling review hidden value:', err);
                res.status(500).send('An error occurred while toggling the review hidden value.');
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
                    timestamp: timestamp,
                    hidden: false
                });

                res.status(201).json('Review created successfully.');
            }
            catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while updating the review.');
            }
        });

        //get reviews for admin list
        app.get('/api/secure/reviews', passport.authenticate('jwt', { session: false }), async (req, res) => {

            try {
                const reviews = await reviewsCollection.find().toArray();

                res.status(200).json(reviews);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while retrieving the user reviews.');
            }
        });

        //toggles the isdisabled field for a user
        app.put('/api/secure/users/:userId/toggle-deactivated', passport.authenticate('jwt', { session: false }), async (req, res) => {
            const { userId } = req.params;

            try {
                const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

                if (!user) {
                    return res.status(404).send('User not found.');
                }

                const updatedUser = await usersCollection.findOneAndUpdate(
                    { _id: new ObjectId(userId) },
                    { $set: { isDisabled: !user.isDisabled } },
                    { returnOriginal: false }
                );

                res.status(200).json(updatedUser.value);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while toggling the user account status.');
            }
        });

        // Toggles the isAdmin field for a user
        app.put('/api/secure/users/:userId/toggle-admin', passport.authenticate('jwt', { session: false }), async (req, res) => {
            const { userId } = req.params;

            try {
                const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

                if (!user) {
                    return res.status(404).send('User not found.');
                }

                const updatedUser = await usersCollection.findOneAndUpdate(
                    { _id: new ObjectId(userId) },
                    { $set: { isAdmin: !user.isAdmin } },
                    { returnOriginal: false }
                );

                res.status(200).json(updatedUser.value);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while toggling the user admin status.');
            }
        });


        //Get average rating for a list
        app.get('/api/open/reviews/:listId', async (req, res) => {
            const { listId } = req.params;


            try {
                const reviews = await reviewsCollection.find({ listId: listId, hidden: false }).toArray();


                const averageRating = reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length;

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

        app.delete('/api/secure/lists/:listId', passport.authenticate('jwt', { session: false }), async (req, res) => {
            const { listId } = req.params;
            const userId = req.user._id;

            try {
                const list = await superheroListsCollection.findOne({ _id: new ObjectId(listId) });

                if (!list) {
                    return res.status(404).send('List not found.');
                }

                if (list.userId.toString() !== userId.toString()) {
                    return res.status(403).send('You do not have permission to delete this list.');
                }

                await superheroListsCollection.deleteOne({ _id: new ObjectId(listId) });

                res.status(200).send(`List with id ${listId} deleted successfully.`);
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred while deleting the list.');
            }
        });






        //app.use(limiter);
    } catch (err) {
        console.error('Could not connect to MongoDB', err);
    }
}

startServer();


