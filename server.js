const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://praga:praga123@cluster0.czsurkc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define a schema for the details collection
const detailSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    favoriteNumber: Number
});

const Detail = mongoose.model('Detail', detailSchema);

app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML file for the registration page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle registration form submission
// Handle registration form submission
app.post('/reg', async (req, res) => {
    // Check if the email already exists in the database
    try {
        const existingDetail = await Detail.findOne({ email: req.body.email });
        if (existingDetail) {
            // If the email already exists, send a response to the user
            return res.status(400).send('Email already exists. Please use a different email.');
        }
    } catch (err) {
        console.error('Error checking existing email:', err);
        return res.status(500).send('Error checking existing email');
    }

    // If the email doesn't exist, proceed to save the new detail
    const newDetail = new Detail({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        fav: req.body.favoritenumber
    });

    newDetail.save()
        .then((detail) => {
            console.log('Detail saved successfully:', detail);
            res.send('Registration successful!');
        })
        .catch((err) => {
            console.error('Error saving detail to database:', err);
            res.status(500).send('Error saving detail to database');
        });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    try {
        if(email == 'admin@gmail.com' && password == 'admin'){
            res.redirect('/admin');
        }
        else{
            const existingDetail = await Detail.findOne({ email, password });
            if (existingDetail) {
                // If the user exists and the password matches, send a success response
                res.send('You are logged in.');
            } else {
                // If the user doesn't exist or the password doesn't match, send an error response
                res.status(401).send('Invalid email or password.');
            }
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in.');
    }
});


app.get('/admin', async (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'))
});

app.get('/data' , async (req, res) => { 
    try {
        const existingDetail = await Detail.find({}, { name: 1, email: 1, favoriteNumber: 1 });
        if (existingDetail) {
            res.send(existingDetail);
            // res.render('admin', { existingDetail });
        } else {
            res.status(401).send('No users found');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error logging in.');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
