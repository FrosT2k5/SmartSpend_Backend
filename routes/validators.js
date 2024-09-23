INVESTMENT_OPTIONS = ['RD', 'FD', 'MF', 'Gold', 'Real Estate']
const { User } = require("../db/models");

const investmentValidator = async (value) => {
    if (!INVESTMENT_OPTIONS.includes(value)) {
        throw new Error("Invalid Investment Option")
    }
} 

module.exports = { investmentValidator }