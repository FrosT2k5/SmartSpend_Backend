var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require("../db/models");
const { body, validationResult } = require('express-validator');

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

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

      const payload = { username: user.username };
      const token = jwt.sign(
        payload,
        secretKey,
        { expiresIn: '6h' }
      );
      const refreshToken = jwt.sign(
        payload,
        secretKey,
        { expiresIn: '7d' }
      );

      res.cookie('refreshToken', refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict', 
        maxAge: 7 * 24 * 60 * 60 * 1000, // Set the expiration time to 7 days
      });
  
      res.status(200).json({ 
        message: 'Login successful', 
        token: token,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', "error": error.message });
    }
  });

  router.post('/refreshToken', async (req, res) => {
  // Refreshing JWT token using the refresh token
  const cookie = req.cookies.refreshToken;

  if (cookie) {
    jwt.verify(cookie, secretKey, (err, decoded) => {
      if (err) {
        // Handle invalid or expired refresh token
        res.status(401).json({ error: 'Invalid or expired refresh token' });
      } else {
        // Generate a new JWT token
        const newJwtToken = jwt.sign({ username: decoded.username }, secretKey, { expiresIn: '6h' });

        // Return the new JWT token to the client
        res.json({ status: 'success', token: newJwtToken });
      }
    });
  } else {
    // No refresh token found, prompt user to log in
    res.status(401).json({ error: 'Refresh token not found' });
  }
  })

module.exports = router;