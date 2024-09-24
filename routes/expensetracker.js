const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, ExpenseTracker, Transaction } = require('../db/models'); // Importing the ExpenseTracker model
//const { ExpenseTrackerValidator } = require("./validators");

const router = express.Router();

// Add Expense
router.post(
    '/:username/expenses',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('currentAmount').isNumeric().withMessage('Current amount must be a number'),
        body('usedValue').isNumeric().withMessage('Used value must be a number'),
        body('expiryOrRenewal').optional().isISO8601().withMessage('Invalid date format'),
        body('modeOfPayment').isIn(['Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Others'])
            .withMessage('Invalid mode of payment'),
    ],
    async (req, res) => {
        const { username } = req.params;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, currentAmount, usedValue, expiryOrRenewal, modeOfPayment } = req.body;

        const transaction = await Transaction.create({
            description: name,
            amount: currentAmount, 
            // Assuming you meant to use currentAmount here
        });

        const expense = await ExpenseTracker.create({
            name,
            currentAmount,
            usedValue,
            expiryOrRenewal,
            modeOfPayment,
            transactions: [transaction],
        });

        try {
            await User.updateOne(
                { username: username },
                { $push: { expenseTrackers: expense } }
            );
            res.status(201).json({ message: 'Expense added successfully', expense });
        } catch (error) {
            res.status(500).json({ message: 'Error adding expense', error });
        }
    }
);

// Get All Expenses for User
router.get('/:username/expenses', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }, "expenseTrackers").lean();

        if (!user || !user.expenseTrackers) {
            return res.status(404).json({ message: 'User or expense trackers not found' });
        }

        let expenseTrackers = user.expenseTrackers;

        // Clean up the data to remove unnecessary fields
        for (let exp of expenseTrackers) {
            delete exp._id;
            delete exp.__v;

            for (let transaction of exp.transactions) {
                delete transaction._id;
                delete transaction.__v;
            }
        }
        res.status(200).json(expenseTrackers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense trackers', error });
    }
});


// Get Specific Expense
router.get('/:username/expenses/:indexcount', async (req, res) => {
    const { username, indexcount } = req.params;

    try {
        const user = await User.findOne({ username }, "expenseTrackers").lean();

        if (!user || !user.expenseTrackers) {
            return res.status(404).json({ message: 'User or expense trackers not found' });
        }

        // Convert indexcount to a number
        const index = parseInt(indexcount);
        if (isNaN(index) || index < 0 || index >= user.expenseTrackers.length) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // Get the expense tracker by index
        const expense = user.expenseTrackers[index];

        // Clean up the expense data
        delete expense._id;
        delete expense.__v;

        for (let transaction of expense.transactions) {
            delete transaction._id;
            delete transaction.__v;
        }

        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense', error });
    }
});




// Update Expense


router.put('/:username/expenses/:indexcount', async (req, res) => {
    const { username, indexcount } = req.params;
    const updatedData = req.body;

    try {
        const user = await User.findOne({ username }, "expenseTrackers").lean();

        if (!user || !user.expenseTrackers) {
            return res.status(404).json({ message: 'User or expense trackers not found' });
        }

        // Convert indexcount to a number
        const index = parseInt(indexcount);
        if (isNaN(index) || index < 0 || index >= user.expenseTrackers.length) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // Update the expense tracker at the specified index
        user.expenseTrackers[index] = { ...user.expenseTrackers[index], ...updatedData };

        // Save the updated user document
        await User.updateOne(
            { username },
            { expenseTrackers: user.expenseTrackers }
        );

        res.status(200).json({ message: 'Expense updated successfully', expense: user.expenseTrackers[index] });
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense', error });
    }
});
// Delete Expense
router.delete('/:username/expenses/:indexcount', async (req, res) => {
    const { username, indexcount } = req.params;

    try {
        // Find the user and their expense trackers
        const user = await User.findOne({ username }, "expenseTrackers").lean();

        if (!user || !user.expenseTrackers) {
            return res.status(404).json({ message: 'User or expense trackers not found' });
        }

        // Convert indexcount to a number
        const index = parseInt(indexcount);
        if (isNaN(index) || index < 0 || index >= user.expenseTrackers.length) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // Remove the expense tracker at the specified index
        user.expenseTrackers.splice(index, 1);

        // Save the updated user document
        await User.updateOne(
            { username },
            { expenseTrackers: user.expenseTrackers }
        );

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error });
    }
});


module.exports = router;
