const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Transaction } = require('../db/models'); // Import the Transaction model
const { verifyToken, verifyLoggedInUser } = require('../middleware/auth');

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
        const { username } = req.params;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { description, amount } = req.body;

        try {
            const transaction = await Transaction.create({
                description,
                amount,
            });

            // Store the transaction in the user's document
            await User.updateOne(
                { username },
                { $push: { transactions: transaction._id } } // Assuming transactions is an array of ObjectId references
            );

            res.status(201).json({ message: 'Transaction added successfully', transaction });
        } catch (error) {
            res.status(500).json({ message: 'Error adding transaction', error });
        }
    }
);

// Get All Transactions for User
router.get('/:username/transactions', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).populate('transactions').lean();

        if (!user || !user.transactions) {
            return res.status(404).json({ message: 'User or transactions not found' });
        }

        const transactions = user.transactions.map(trans => {
            const { _id, description, amount, date } = trans;
            return { _id, description, amount, date }; 
        });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
});

// Get Specific Transaction
router.get('/:username/transactions/:indexcount', async (req, res) => {
    const { username, indexcount } = req.params;

    try {
        const user = await User.findOne({ username }).populate('transactions').lean();

        if (!user || !user.transactions) {
            return res.status(404).json({ message: 'User or transactions not found' });
        }

        // Convert indexcount to a number
        let index = parseInt(indexcount);
        if (isNaN(index) || index < 0) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // If the transactions array is empty, set index to 1
        if (user.transactions.length === 0) {
            index = 1;
        }

        // Check if the index is valid (adjust for 0-based index)
        if (index > user.transactions.length) {
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

// Update Transaction
router.put('/:username/transactions/:indexcount', async (req, res) => {
    const { username, indexcount } = req.params;
    const updatedData = req.body;

    try {
        const user = await User.findOne({ username }).populate('transactions').lean();

        if (!user || !user.transactions) {
            return res.status(404).json({ message: 'User or transactions not found' });
        }

        // Convert indexcount to a number
        let index = parseInt(indexcount);
        if (isNaN(index) || index < 0) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // If the transactions array is empty, set index to 1
        if (user.transactions.length === 0) {
            index = 1;
        }

        // Check if the index is valid (adjust for 0-based index)
        if (index > user.transactions.length) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // Update the transaction at the specified adjusted index
        const transactionId = user.transactions[index - 1]._id; // Convert to 0-based index
        const updatedTransaction = await Transaction.findByIdAndUpdate(transactionId, updatedData, { new: true });

        res.status(200).json({ message: 'Transaction updated successfully', updatedTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction', error });
    }
});

// Delete Transaction
router.delete('/:username/transactions/:indexcount', async (req, res) => {
    const { username, indexcount } = req.params;

    try {
        const user = await User.findOne({ username }).populate('transactions').lean();

        if (!user || !user.transactions) {
            return res.status(404).json({ message: 'User or transactions not found' });
        }

        // Convert indexcount to a number
        let index = parseInt(indexcount);
        if (isNaN(index) || index < 0) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // If the transactions array is empty, set index to 1
        if (user.transactions.length === 0) {
            index = 1;
        }

        // Check if the index is valid (adjust for 0-based index)
        if (index > user.transactions.length) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // Get the transaction ID to delete
        const transactionId = user.transactions[index - 1]._id; // Convert to 0-based index

        await Transaction.findByIdAndDelete(transactionId);
        await User.updateOne(
            { username },
            { $pull: { transactions: transactionId } }
        );

        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error });
    }
});

module.exports = router;
