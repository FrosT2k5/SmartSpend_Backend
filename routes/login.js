var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require("../db/models");
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post('/',
  [
    body('username').notEmpty().withMessage('Invalid username'),
    body('password').notEmpty().withMessage('Invalid Password'),
  ], 
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid username' }); 
      }

      // Verify the password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
  
      res.status(200).json({ 
        message: 'Login successful', 
        token: token,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', "error": error.message });
    }
  });

module.exports = router;