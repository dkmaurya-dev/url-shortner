import { Request, Response, NextFunction } from "express";
import {redis} from "../config/redis";

export const rateLimiter = (
  keyPrefix: string,
  limit: number,
  windowSeconds: number
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || "unknown";
      const key = `rate:${ip}:${keyPrefix}`;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (count > limit) {
        return res.status(429).json({
          message: "Too many requests. Please try again later."
        });
      }

      next();
    } catch (err) {
      // Fail open (IMPORTANT)
      next();
    }
  };
};
