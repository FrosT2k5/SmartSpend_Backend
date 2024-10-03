var express = require('express');
const { User } = require("../db/models");
const { verifyToken, verifyLoggedInUser } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const router = express.Router();

router.use(verifyToken);

router.get('/', async function(req, res) {
  const user = await User.findOne(
    {username: req.decryptedUsername},
    'username name email monthlyIncome currentBalance'
  ).lean();

  res.json(user);
});

router.put('/', async function(req, res) {
  let user = await User.findOne(
    {username: req.decryptedUsername},
  );

  const { name, email, password, monthlyIncome, currentBalance, rateOfInterest } = req.body;
  let isInfoChanged = false;

  try {
    if (email) {
      isInfoChanged = true;
      user.email = email
  
      existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
    }
  
    if (password) {
      isInfoChanged = true;
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (monthlyIncome) {
      isInfoChanged = true;
      user.monthlyIncome = monthlyIncome
    }

    if (currentBalance) {
      isInfoChanged = true;
      user.currentBalance = currentBalance
    }

    if (name) {
      isInfoChanged = true;
      user.name = name
    }

    if (rateOfInterest) {
      isInfoChanged = true;
      user.rateOfInterest = rateOfInterest
    }

    if (isInfoChanged) {
      user.save();
      return res.status(200).json({'message': 'Information Updated Successfully.'})
    } else {
      res.status(404).json({'message': "No information provided, nothing changed."})
    }
  } catch (error) {
    return res.status(500).json({'message': 'error updating info', 'error': error.message});
  }
});

module.exports = router;
