var express = require('express');
var router = express.Router();
const { User} = require("../db/models");


router.post('/', async (req, res) => {
    const { name, username, email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this username or email already exists' });
      }
  
      // Create new user
      const newUser = new User({
        name,
        username,
        email,
        password,
        currentBalance: 0,
        rateOfInterest: 0,
        monthlyIncome: [],
        transactions: [],
        expenseTrackers: []
      });
  
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  });

  module.exports = router; 
