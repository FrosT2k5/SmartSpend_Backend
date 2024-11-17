INVESTMENT_OPTIONS = ['RD', 'FD', 'MF', 'Gold', 'Real Estate']

const investmentValidator = async (value) => {
    if (!INVESTMENT_OPTIONS.includes(value)) {
        throw new Error("Invalid Investment Option")
    }
} 

const PAYMENT_OPTIONS = ['Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Others'];

const modeOfPaymentValidator = async (value) => {
    if(!PAYMENT_OPTIONS.includes(value)) {
        throw new Error("Invalid Payment Method");
    }
};

module.exports = { investmentValidator, modeOfPaymentValidator };
