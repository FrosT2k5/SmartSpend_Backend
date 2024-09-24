const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Investment, Transaction } = require('../db/models'); // Importing the Investment model
const { investmentValidator } = require("./validators")
const { verifyToken, verifyLoggedInUser } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.param('username', verifyLoggedInUser)

// Add Investment
router.post(
    '/:username/investments',
    [
        body('type').custom( investmentValidator ),
        body('rateOfInterest').isFloat().withMessage('Invalid rate Rate of interest'),
        body('baseValue').isDecimal().withMessage('Invalid base value'),
    ],
     async (req, res) => {
    const { username } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { type, rateOfInterest, baseValue } = req.body;
    
    const transaction = await Transaction.create({
        "description": "Initial Investment",
        "amount": baseValue,
    });

    const investment = await Investment.create({
        type,
        rateOfInterest,
        baseValue,
        "currentValue": baseValue,
        "transactions": [
            transaction,
        ]
     }); 

    try {
        await User.updateOne( {username: username}, 
            { $push: { investments: investment } }
        );
        res.status(201).json({ message: 'Investment added successfully', investment });
    } catch (error) {
        res.status(500).json({ message: 'Error adding investment', error });
    }
});


// Get All Investments for User
router.get('/:username/investments', async (req, res) => {
    const { username } = req.params;
    let investments = await User.findOne({ username }, "investments").lean();
    investments = investments.investments;

    try {
        for (let inv of investments) {
            delete inv._id;
            delete inv.__v;
            for (let transaction of inv.transactions) {
                delete transaction._id;
                delete transaction.__v;
            }
        }
        res.status(200).json(investments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching investments', error });
    }
});

// Get Specific Investment
router.get('/:username/investments/:investmentId', async (req, res) => {
    const { username, investmentId } = req.params;
    const investmentUser = await User.findOne({ username }).where("investments.investmentId").equals(investmentId).lean();

    try {
        if (!investmentUser) {
            return res.status(404).json({ message: 'Investment not found' });
        }
    
        let investment = investmentUser.investments.filter( value => parseInt(value.investmentId) === parseInt(investmentId))[0];
        
        delete investment._id;
        delete investment.__v;
    
        for (let transaction of investment.transactions) {
            delete transaction._id;
            delete transaction.__v;
        }
        
        res.status(200).json(investment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching investment', error });
    }
});


// Update Investment
router.put('/:username/investments/:investmentId', async (req, res) => {
    const { username, investmentId } = req.params;
    const updatedData = req.body;

    try {
        const investment = await Investment.findOneAndUpdate(
            { investmentId },
            updatedData,
            { new: true }
        );
        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }
        res.status(200).json({ message: 'Investment updated successfully', investment });
    } catch (error) {
        res.status(500).json({ message: 'Error updating investment', error });
    }
});


// Delete Investment
router.delete('/:username/investments/:investmentId', async (req, res) => {
    const { investmentId } = req.params;

    try {
        const result = await Investment.deleteOne({ investmentId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Investment not found' });
        }
        res.status(200).json({ message: 'Investment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting investment', error });
    }
});

module.exports = router;
