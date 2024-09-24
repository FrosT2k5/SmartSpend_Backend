const express = require('express');
const { body, validationResult } = require('express-validator');
const { ExpenseTracker, User } = require('../db/models');

const router = express.Router();

// Add Expense Tracker
router.post(
    '/:username/expenses',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('currentAmount').isDecimal().withMessage('Current amount must be a decimal'),
        body('usedValue').isDecimal().withMessage('Used value must be a decimal').optional(),
        body('expiryOrRenewal').isISO8601().withMessage('Expiry or renewal must be a valid date').optional(),
        body('modeOfPayment').isIn(['Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Others'])
            .withMessage('Mode of payment must be one of the predefined options').optional(),
    ],
    async (req, res) => {
        const { username } = req.params;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if user exists
        const userExists = await User.findOne({ username });
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const expenseData = req.body;

        // Create a new expense tracker
        const expenseTracker = new ExpenseTracker({ ...expenseData, username });

        try {
            await expenseTracker.save(); // Save the new expense tracker record
            
            // Use spread operator to include all fields except username
            const { username, ...responseData } = expenseTracker.toObject();

            res.status(201).json({ 
                message: 'Expense added successfully', 
                expenseTracker: responseData // All fields except username
            });
        } catch (error) {
            console.error('Error adding expense:', error); // Log the error
            res.status(500).json({ message: 'Error adding expense', error });
        }
    }
);



router.get('/:username/expenses', async (req, res) => {
    const { username } = req.params;

    try {
        // Check if user exists
        const user = await User.findOne({ username }).lean();
        if (!user) {
            console.log('User not found:', username);
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch expenses using user ID
        const expenses = await ExpenseTracker.find({ userId: user._id }).lean();
        console.log('Fetched expenses:', expenses);

        if (!expenses || expenses.length === 0) {
            console.log('No expenses found for user:', user._id);
            return res.status(404).json({ message: 'No expenses found' });
        }

        // Format the expenses for the response
        const formattedExpenses = expenses.map(({ _id, __v, createdAt, updatedAt, ...rest }) => ({
            _id,
            createdAt,
            updatedAt,
            ...rest,
        }));

        res.status(200).json(formattedExpenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Error fetching expenses', error });
    }
});

module.exports = router;


// Get Specific Expense Tracker
router.get('/:username/expenses/:expenseId', async (req, res) => {
    const { username, expenseId } = req.params;

    try {
        const expense = await ExpenseTracker.findOne({ _id: expenseId, username }).lean();
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const { _id, __v, username, ...rest } = expense; // Omit _id, __v, and username
        res.status(200).json(rest);
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ message: 'Error fetching expense', error });
    }
});

// Update Expense Tracker
router.put('/:username/expenses/:expenseId', async (req, res) => {
    const { username, expenseId } = req.params;
    const updatedData = req.body;

    try {
        const expense = await ExpenseTracker.findOneAndUpdate(
            { _id: expenseId, username },
            updatedData,
            { new: true }
        );
        if (!expense) {
            return res.status(404).json({ message: 'Expense tracker not found' });
        }
        res.status(200).json({ message: 'Expense updated successfully', expense });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Error updating expense', error });
    }
});

// Delete Expense Tracker
router.delete('/:username/expenses/:expenseId', async (req, res) => {
    const { username, expenseId } = req.params;

    try {
        const result = await ExpenseTracker.deleteOne({ _id: expenseId, username });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Error deleting expense', error });
    }
});

module.exports = router;
