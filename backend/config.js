const crypto = require('crypto');

let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
    }
    // Dev-only fallback so `npm start` still works without a .env file.
    // Tokens won't survive a restart, which is fine outside production.
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('JWT_SECRET not set - using a random development secret. Set JWT_SECRET in your .env for stable sessions and production use.');
}

module.exports = {
    JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
};
