"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const redis_1 = require("../config/redis");
const rateLimiter = (keyPrefix, limit, windowSeconds) => {
    return async (req, res, next) => {
        try {
            const ip = req.ip || "unknown";
            const key = `rate:${ip}:${keyPrefix}`;
            const count = await redis_1.redis.incr(key);
            if (count === 1) {
                await redis_1.redis.expire(key, windowSeconds);
            }
            if (count > limit) {
                return res.status(429).json({
                    message: "Too many requests. Please try again later."
                });
            }
            next();
        }
        catch (err) {
            // Fail open (IMPORTANT)
            next();
        }
    };
};
exports.rateLimiter = rateLimiter;
