const express = require('express');
const { Investment } = require('../db/models'); // Importing the Investment model

const router = express.Router();

// Add Investment
router.post('/:username/investments', async (req, res) => {
    const { username } = req.params;
    const investmentData = req.body;

    const investment = new Investment({ ...investmentData, username }); 
    try {
        await investment.save();
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
