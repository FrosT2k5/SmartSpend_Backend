const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Transaction } = require('../db/models'); // Import the Transaction model
const { verifyToken, verifyLoggedInUser } = require('../middleware/auth');
const { createNewTransaction } = require('../db/helpers');

const router = express.Router();

router.use(verifyToken);
router.param('username', verifyLoggedInUser);

// Add Transaction
router.post(
    '/:username/transactions',
    [
        body('description').notEmpty().withMessage('Description is required'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
    ],
    async (req, res) => {
        /* #swagger.security = [{
            "bearerAuth": [],
            "apiKeyAuth": []
            }] */
        const { username } = req.params;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { description, amount } = req.body;

        let user = await User.findOne({username});

        try {
            // Create the transaction
            const transaction = await createNewTransaction(description, amount);

            // Store the transaction in the user's document with additional fields
            // await User.updateOne(
            //     { username },
            //     { $push: { transactions: transaction._id } }
            // );
            user.transactions.push(transaction);
            user.currentBalance += amount;
            await user.save();

            res.status(201).json({ message: 'Transaction added successfully', "newBalance": user.currentBalance });
        } catch (error) {
            res.status(500).json({ message: 'Error adding transaction', "error": error.message });
        }
    }
);


// Get All Transactions for User
router.get('/:username/transactions', async (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": [],
        "apiKeyAuth": []
        }] */
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).populate({
            path: "transactions",
            select: '-_id -__v',
        });

        if (!user || !user.transactions) {
            return res.status(404).json({ message: 'User or transactions not found' });
        }

        const transactions = user.transactions;

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', 'error': error.message });
    }
});

// Get Specific Transaction
router.get('/:username/transactions/:indexcount', async (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": [],
        "apiKeyAuth": []
        }] */
    const { username, indexcount } = req.params;

    try {
        const user = await User.findOne({ username }).populate({
            path: "transactions",
            select: '-_id -__v',
        });

        if (!user || !user.transactions) {
            return res.status(404).json({ message: 'User or transactions not found' });
        }

        index = parseInt(indexcount);
        if (isNaN(index) || index < 1 || index >= user.expenseTrackers.length+1) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // Get the transaction by adjusted index
        const transaction = user.transactions[index - 1]; // Convert to 0-based index

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transaction', error });
    }
});

// Delete Transaction
router.delete('/:username/transactions/:indexcount', async (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": [],
        "apiKeyAuth": []
        }] */
    const { username, indexcount } = req.params;

    try {
        const user = await User.findOne({ username }).lean();

        if (!user || !user.transactions) {
            return res.status(404).json({ message: 'User or transactions not found' });
        }

        const index = parseInt(indexcount);
        if (isNaN(index) || index < 1 || index > user.transactions.length) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // Adjust for 0-based index
        const transactionToDelete = user.transactions[index - 1];

        // Remove the transaction from the User document
        await User.updateOne(
            { username },
            { $pull: { transactions: { _id: transactionToDelete._id } } } // Use _id to ensure we pull the correct transaction
        );

        // Delete the transaction from the Transaction collection
        await Transaction.findByIdAndDelete(transactionToDelete._id);

        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting transaction', error });
    }
});



module.exports = router;
