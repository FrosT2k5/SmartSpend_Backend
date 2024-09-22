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

router.post('/register', async (req, res) => {
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
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username' }); 
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

module.exports = router;
