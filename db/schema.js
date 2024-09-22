const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
// Schema Definitions

// Create a schema for transactions
const transactionSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
});


// Create a schema for expense tracker
const expenseTrackerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    currentAmount: {
        type: Number,
        required: true,
    },
    usedValue: {
        type: Number,
        required: true,
        default: 0,
    },
    expiryOrRenewal: {
        type: Date,
        required: false,
    },
    transactions: [transactionSchema],
    modeOfPayment: {
        type: String,
        enum: ['Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Others'],
        required: true,
        default: 'Cash',
    }
}, { timestamps: true });


// Create a schema for user account
const userAccountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    monthlyIncome: [{
        amount: {
            type: Number,
            required: true,
        },
        source: {
            type: String,
        },
    }],
    transactions: [transactionSchema],
    currentBalance: {
        type: Number,
        required: true,
        default: 0,
    },
    rateOfInterest: {
        type: Number,
        required: true,
        default: 0,
    },
    expenseTrackers: [expenseTrackerSchema],
}, { timestamps: true });


// Create a schema for investment options
const investmentSchema = new mongoose.Schema({
    investmentId: {
        type: Number,
        unique: true,
    },
    type: {
        type: String,
        enum: ['RD', 'FD', 'MF', 'Gold', 'Real Estate'],
        required: true,
    },
    rateOfInterest: {
        type: Number,
        required: true,
    },
    baseValue: {
        type: Number,
        required: true,
    },
    currentValue: {
        type: Number,
        required: true,
    },
    transactions: [transactionSchema],
}, { timestamps: true });

investmentSchema.plugin(AutoIncrement, { inc_field: 'investmentId' });


// Export models
module.exports = { userAccountSchema, investmentSchema, expenseTrackerSchema };
