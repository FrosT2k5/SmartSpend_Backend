const express = require('express');
const { ExpenseTracker } = require('../db/models'); 

const router = express.Router();

// Add Expense Tracker
router.post('/:username/expenses', async (req, res) => {
    const { username } = req.params;
    const expenseData = req.body;

    const expenseTracker = new ExpenseTracker({ ...expenseData, username });
    try {
        await expenseTracker.save(); // Save the new expense tracker record
        res.status(201).json({ message: 'Expense added successfully', expenseTracker });
    } catch (error) {
        res.status(500).json({ message: 'Error adding expense', error });
    }
});

// Get All Expense Trackers for User
router.get('/:username/expenses', async (req, res) => {
    const { username } = req.params;

    try {
        const expenses = await ExpenseTracker.find({ username }); 
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense ', error });
    }
});

// Get Specific Expense Tracker
router.get('/:username/expenses/:expenseId', async (req, res) => {
    const { expenseId } = req.params;

    try {
        const expense = await ExpenseTracker.findOne({ _id: expenseId, username: req.params.username });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense ', error });
    }
});

// Update Expense Tracker
router.put('/:username/expenses/:expenseId', async (req, res) => {
    const { expenseId } = req.params;
    const updatedData = req.body;

    try {
        const expense = await ExpenseTracker.findOneAndUpdate(
            { _id: expenseId, username: req.params.username },
            updatedData,
            { new: true }
        );
        if (!expense) {
            return res.status(404).json({ message: 'Expense tracker not found' });
        }
        res.status(200).json({ message: 'Expense updated successfully', expense });
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense ', error });
    }
});

// Delete Expense Tracker
router.delete('/:username/expenses/:expenseId', async (req, res) => {
    const { expenseId } = req.params;

    try {
        const result = await ExpenseTracker.deleteOne({ _id: expenseId, username: req.params.username });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error });
    }
});

module.exports = router;
