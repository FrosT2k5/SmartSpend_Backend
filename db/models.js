const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { userAccountSchema, investmentSchema, expenseTrackerSchema } = require('./schema'); 

// Load environment variables from .env file
dotenv.config();

// Get MongoDB connection URI from environment variable
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then( () => console.log("connected to DB."))
    .catch( err => console.log(err));

const User = mongoose.model('User', userAccountSchema);
const Investment = mongoose.model('Investment', investmentSchema);
const ExpenseTracker = mongoose.model('ExpenseTracker', expenseTrackerSchema);
// conn.model('User', UserAccount);
// conn.model('Investment', Investment);
// conn.model('ExpenseTracker', ExpenseTracker);
    
module.exports = { User, Investment, ExpenseTracker };

