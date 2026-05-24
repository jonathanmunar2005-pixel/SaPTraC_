const { Ratelimit } = require('@upstash/ratelimit');
const { Redis } = require('@upstash/redis');
const dotenv = require("dotenv");   
dotenv.config();    

const redis = Redis.fromEnv();

const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
    analytics: true,
});

module.exports = { redis, limiter };