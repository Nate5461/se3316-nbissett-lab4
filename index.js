const express = require('express');
const fs = require('fs'); // Filesystem module to read files


const app = express();
const port = 3000;

// Send JSON file for the first route
app.get('/api/superhero_info', (req, res) => {
    fs.readFile('./superhero_info.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the JSON file.');
        }
        res.json(JSON.parse(data));
    });
});

// Send JSON file for the second route
app.get('/api/superhero_powers', (req, res) => {
    fs.readFile('./superhero_powers.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the JSON file.');
        }
        res.json(JSON.parse(data));
    });
});

app.get('/api/superhero_info/:id', (req, res) => {
    const id = req.params.id;
    console.log(`GET request for ${req.url}`);
    res.send('Working on it...');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
