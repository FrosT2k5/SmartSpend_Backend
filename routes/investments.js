const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Investment } = require('../db/models'); // Importing the Investment model
const { createNewTransaction } = require("../db/helpers");
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
    
    const transaction = createNewTransaction("Initial Investment", baseValue);

    const investment = await Investment.create({
        type,
        rateOfInterest,
        baseValue,
        "currentValue": baseValue,
        "transactions": [
            await transaction,
        ]
     }); 

    try {
        await User.updateOne( {username: username}, 
            { $push: { investments: investment._id } }
        );
        res.status(201).json({ message: 'Investment added successfully', investment });
    } catch (error) {
        res.status(500).json({ message: 'Error adding investment', error });
    }
});


// Get All Investments for User
router.get('/:username/investments', async (req, res) => {
    const { username } = req.params;
    
    let currentUser = await User.findOne({ username }, "investments").populate({
        path: "investments",
        select: '-_id -__v',
    });
    investments = currentUser.investments;

    try {
        for (let inv of investments) {
            await inv.populate({
                path: "transactions",
                select: '-_id -__v',
            });
        }
        res.status(200).json(investments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching investments', error: error.message });
    }
});

// Get Specific Investment
router.get('/:username/investments/:investmentId', async (req, res) => {
    const { username, investmentId } = req.params;

    const investmentUser = await User.findOne({ username })
                                    .populate({
                                        path: "investments",
                                        match: { investmentId: {$eq: investmentId } },
                                        select: '-_id -__v',
                                    })
    
    try {
        if (!investmentUser) {
            return res.status(404).json({ message: 'Investment not found' });
        }
    
        let investment = investmentUser.investments.filter( value => parseInt(value.investmentId) === parseInt(investmentId))[0];
        
        await investment.populate("transactions");
        res.status(200).json(investment);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching investment', error: error.message });
    }
});


// Update Investment
router.put(
    '/:username/investments/:investmentId', 
    [
        body('transactionAmount').notEmpty().isDecimal().withMessage('Invalid transaction value'),
        body('description').notEmpty().isString().withMessage('Invalid transaction value'),
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { investmentId } = req.params;
        const { transactionAmount, description } = req.body;
        let investment = await Investment.findOne({investmentId: investmentId});

        const newTransaction = createNewTransaction(description, transactionAmount);


        try {
            if (!investment) {
                return res.status(404).json({ message: 'Investment not found' });
            }

            investment.currentValue += transactionAmount;
            investment.transactions.push(await newTransaction);
            investment.populate("transactions")
            await investment.save();
            
            res.status(200).json({ message: 'Investment updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating investment', error });
        }
    }
);


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
