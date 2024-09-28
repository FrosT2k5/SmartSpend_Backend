const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, ExpenseTracker } = require('../db/models'); // Importing the ExpenseTracker model
const { verifyToken, verifyLoggedInUser } = require('../middleware/auth');
const { modeOfPaymentValidator } = require("./validators")
const { createNewTransaction } = require('../db/helpers');

const router = express.Router();

router.use(verifyToken);
router.param('username', verifyLoggedInUser)
// Add Expense
router.post(
    '/:username/expenses',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('currentAmount').isDecimal().withMessage('Current amount must be a number'),
        body('usedValue').isDecimal().withMessage('Used value must be a number'),
        body('expiryOrRenewal').optional().isISO8601().withMessage('Invalid date format'),
        body('modeOfPayment').isIn(['Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Others'])
            .withMessage('Invalid mode of payment').custom(modeOfPaymentValidator),
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

        const { name, currentAmount, usedValue, expiryOrRenewal, modeOfPayment } = req.body;

        const transaction = await createNewTransaction("Initial Transaction", currentAmount);


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
                { $push: { expenseTrackers: expense._id } }
            );
            res.status(201).json({ message: 'Expense added successfully', expense });
        } catch (error) {
            res.status(500).json({ message: 'Error adding expense', "error": error.message });
        }
    }
);

// Get All Expenses for User
router.get('/:username/expenses', async (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": [],
        "apiKeyAuth": []
        }] */
    const { username } = req.params;

    try {
        let user = await User.findOne({ username }, "expenseTrackers").populate({
            path: "expenseTrackers",
            select: '-_id -__v',
        });

        if (!user || !user.expenseTrackers) {
            return res.status(404).json({ message: 'User or expense trackers not found' });
        }

        let expenseTrackers = user.expenseTrackers;

        // Clean up the data to remove unnecessary fields
        for (let exp of expenseTrackers) {
            exp.populate({
                "path": "transactions", 
                "select": "-_id -__v"
            });
        }
        res.status(200).json(expenseTrackers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense trackers', error });
    }
});


// Get Specific Expense
router.get('/:username/expenses/:indexcount', async (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": [],
        "apiKeyAuth": []
        }] */
    const { username, indexcount } = req.params;

    try {
        let user = await User.findOne({ "username": username }, "expenseTrackers").populate({
            path: "expenseTrackers",
            select: '-_id -__v',
        });

        console.log(user);
        if (!user || !user.expenseTrackers) {
            return res.status(404).json({ message: 'User or expense trackers not found' });
        }

        // Convert indexcount to a number
        const index = parseInt(indexcount);

        // Get the expense tracker by index
        const expense = user.expenseTrackers[index-1];
        if (isNaN(index) || index < 1 || index >= user.expenseTrackers.length+1) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        expense.populate({
                "path": "transactions", 
                "select": "-_id -__v"
        })

        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense', error });
    }
});




// Update Expense
router.put('/:username/expenses/:indexcount', async (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": [],
        "apiKeyAuth": []
        }] */
    const { username, indexcount } = req.params;
    const updatedData = req.body;

    try {
        let user = await User.findOne({ "username": username }, "expenseTrackers").populate({
            path: "expenseTrackers",
            select: '-_id -__v',
        });

        if (!user || !user.expenseTrackers) {
            return res.status(404).json({ message: 'User or expense trackers not found' });
        }

        // Convert indexcount to a number
        const index = parseInt(indexcount);
        if (isNaN(index) || index < 1 || index >= user.expenseTrackers.length+1) {
            return res.status(400).json({ message: 'Invalid index count' });
        }

        // Update the expense tracker at the specified index
        user.expenseTrackers[index+1] = { ...user.expenseTrackers[index], ...updatedData };

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
    /* #swagger.security = [{
        "bearerAuth": [],
        "apiKeyAuth": []
        }] */
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
