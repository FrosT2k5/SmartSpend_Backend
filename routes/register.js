var express = require('express');
var router = express.Router();
const { User } = require("../db/models");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

router.post('/',
  [
    body('name').notEmpty().withMessage('Invalid Name'),
    body('username').notEmpty().withMessage('Invalid username'),
    body('email').isEmail().withMessage('Invalid Email Address'),
    body('password').notEmpty().withMessage('Invalid Password'),
  ],
   async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, username, email, password } = req.body;
  
    try {
      let existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this username already exists' });
      }

      existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash the password using bcrypt (10 is the salt rounds)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
        name,
        username,
        email,
        password: hashedPassword,
        currentBalance: 0,
        rateOfInterest: 0,
        monthlyIncome: [],
        transactions: [],
        expenseTrackers: []
      });

    await newUser.save();

    const token = jwt.sign(
      { username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token: token,
    });

    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  }
);

module.exports = router; 
