// src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const Collection = require('../models/collection');
const Query = require('../models/query');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true in production with HTTPS
}));

// Database connection
mongoose.connect('mongodb+srv://lokesh:12345@cluster0.n9upzef.mongodb.net/supportdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Root route
app.get('/', (req, res) => {
    res.render('index');
});

// User Login Form
app.get('/user-login', (req, res) => {
    res.render('login');
});

// User Signup Form
app.get('/signup', (req, res) => {
    res.render('signup');
});

// User Signup Submit
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newCollection = new Collection({ username, password });
        await newCollection.save();
        res.redirect('/user-login');
    } catch (err) {
        console.error('Error signing up:', err);
        res.send('Error signing up.');
    }
});

// User Login Submit
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await Collection.findOne({ username, password });
        if (user) {
            req.session.isLoggedIn = true;
            res.redirect('/helpdesk');
        } else {
            res.render('login', { error: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.send('Error logging in.');
    }
});

// Helpdesk Form (protected route)
app.get('/helpdesk', (req, res) => {
    if (req.session.isLoggedIn) {
        res.render('helpdesk');
    } else {
        res.redirect('/user-login');
    }
});

// Submit Query
app.post('/submit-query', async (req, res) => {
    const { name, email, phone, orderId, queryType, queryDescription } = req.body;
    
    try {
        const newQuery = new Query({
            name,
            email,
            phone,
            orderId,
            queryType,
            queryDescription
        });
        await newQuery.save();
        res.send('Query submitted successfully!');
    } catch (err) {
        console.error('Error submitting query:', err);
        res.send('Error submitting query.');
    }
});

// Admin Login Form
app.get('/admin-login', (req, res) => {
    res.render('admin-login', { error: '' });
});

// Admin Login Submit
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    // Replace with actual admin authentication logic
    if (username === 'admin' && password === 'adminpassword') {
        req.session.isAdminLoggedIn = true;
        res.redirect('/admin-dashboard');
    } else {
        res.render('admin-login', { error: 'Invalid username or password' });
    }
});

// Admin Dashboard (protected route)
app.get('/admin-dashboard', async (req, res) => {
    if (req.session.isAdminLoggedIn) {
        try {
            const queries = await Query.find();
            res.render('admin-dashboard', { queries });
        } catch (err) {
            console.error('Error fetching queries:', err);
            res.send('Error fetching queries.');
        }
    } else {
        res.redirect('/admin-login');
    }
});

// Edit Query Form
app.get('/edit-query/:id', async (req, res) => {
    const queryId = req.params.id;
    try {
        const query = await Query.findById(queryId);
        res.render('edit-query', { query });
    } catch (err) {
        console.error('Error fetching query for edit:', err);
        res.send('Error fetching query for edit.');
    }
});

// Update Query
app.post('/update-query/:id', async (req, res) => {
    const queryId = req.params.id;
    const { name, email, phone, orderId, queryType, queryDescription } = req.body;
    try {
        await Query.findByIdAndUpdate(queryId, {
            name,
            email,
            phone,
            orderId,
            queryType,
            queryDescription
        });
        res.send(`Query ${queryId} updated successfully!`);
    } catch (err) {
        console.error('Error updating query:', err);
        res.send('Error updating query.');
    }
});

// Delete Query
app.post('/delete-query/:id', async (req, res) => {
    const queryId = req.params.id;
    try {
        await Query.findByIdAndDelete(queryId);
        res.send(`Query ${queryId} deleted successfully!`);
    } catch (err) {
        console.error('Error deleting query:', err);
        res.send('Error deleting query.');
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
