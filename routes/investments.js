const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Investment, Transaction } = require('../db/models'); // Importing the Investment model
const { investmentValidator } = require("./validators")

const router = express.Router();

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
        await User.updateOne({ username }, 
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

    try {
        const investments = await Investment.find({ username }); 
        res.status(200).json(investments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching investments', error });
    }
});

// Get Specific Investment
router.get('/:username/investments/:investmentId', async (req, res) => {
    const { investmentId } = req.params;

    try {
        const investment = await Investment.findOne({ investmentId });
        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }
        res.status(200).json(investment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching investment', error });
    }
});

// Update Investment
router.put('/:username/investments/:investmentId', async (req, res) => {
    const { investmentId } = req.params;
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
