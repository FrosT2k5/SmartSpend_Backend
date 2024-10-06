const jwt = require('jsonwebtoken');

// Middleware to JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.decryptedUsername = decoded.username;
        next();
    });
};

// Middleware to verify if logged in user is current user
const verifyLoggedInUser = (req, res, next, username) => {
    if (!(req.decryptedUsername === username)) {
        return res.status(401).json({
            "message": "Not Authorized",
        });
    }
    next();
}

module.exports = { verifyToken, verifyLoggedInUser };
