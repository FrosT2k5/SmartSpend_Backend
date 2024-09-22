var express = require('express');
const { User} = require("../db/models");

const router = express.Router();

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