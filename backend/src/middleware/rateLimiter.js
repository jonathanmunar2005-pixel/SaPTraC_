const { limiter } = require("../config/upstash.js");

const rateLimiter = async (req, res, next) => {
    try {
        const { success } = await limiter.limit("My-rate-limit");
        if (!success) {
            return res.status(429).json({ error: "Rate limit exceeded" });
        }
        next();
    } catch (error) {
        console.error("Error in rate limiter:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = rateLimiter;