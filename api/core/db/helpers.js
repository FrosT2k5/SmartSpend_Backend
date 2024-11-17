
const { Transaction } = require("./models");

const createNewTransaction = async (description, amount) => {
    const transaction = await Transaction.create({
        "description": description,
        "amount": amount,
    });
    return transaction;
}

module.exports = { createNewTransaction };