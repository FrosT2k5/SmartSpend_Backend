var express = require('express');
var router = express.Router();
const { User, Investment, ExpenseTracker } = require("../db/models");

/* GET users listing. */
router.get('/', async function(req, res, next) {
  const newUser = new User({
    name: 'Jane Doe',
    username: 'jane_doe',
    email: 'jane@example.com',
    password: 'hashedpassword123', // Make sure to hash the password in real apps
    currentBalance: 6000,
    rateOfInterest: 4.0,
});
  await newUser.save();
  res.send('respond with a resource');
});

module.exports = router;
