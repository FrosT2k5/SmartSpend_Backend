var express = require('express');
const { User } = require("../db/models");
const { verifyToken, verifyLoggedInUser } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/', async function(req, res) {
  const user = await User.findOne(
    {username: req.decryptedUsername},
    'username name email monthlyIncome currentBalance'
  );

  console.log(user);

  res.json(user);
});

module.exports = router;
