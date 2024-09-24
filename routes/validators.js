INVESTMENT_OPTIONS = ['RD', 'FD', 'MF', 'Gold', 'Real Estate']
const { User } = require("../db/models");

const investmentValidator = async (value) => {
    if (!INVESTMENT_OPTIONS.includes(value)) {
        throw new Error("Invalid Investment Option")
    }
} 

module.exports = { investmentValidator }

const EXPENSE_OPTIONS = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Others'];

const expenseValidator = async (value) => {
    if (!EXPENSE_OPTIONS.includes(value)) {
        throw new Error("Invalid Expense Category");
    }
};

module.exports = { expenseValidator };
