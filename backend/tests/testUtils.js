const jwt = require("jsonwebtoken");
const activeApiKeys = require("../activeApiKeys");
const { JWT_SECRET } = require("../config");

// Signs a token the same way routerUsers does and registers it as active,
// so protected routes accept it in tests.
function issueApiKey(user = { id: 1, email: "user@example.com" }) {
    const apiKey = jwt.sign(user, JWT_SECRET, { expiresIn: "12h" });
    activeApiKeys.push(apiKey);
    return apiKey;
}

module.exports = { issueApiKey };
