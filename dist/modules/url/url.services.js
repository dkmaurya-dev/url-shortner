"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlService = void 0;
const url_repository_1 = require("./url.repository");
const nanoid_1 = require("../../utils/nanoid");
const redis_1 = require("../../config/redis");
const logger_1 = require("../../utils/logger");
class UrlService {
    constructor() {
        this.repo = new url_repository_1.UrlRepository();
    }
    async createShortUrl(longUrl, customAlias) {
        const shortCode = customAlias || (0, nanoid_1.generateShortCode)();
        return this.repo.create({
            shortCode,
            longUrl
        });
    }
    async getAllUrls() {
        return this.repo.findMany();
    }
    async incrementClicks(shortCode) {
        await this.repo.incrementClickCount(shortCode);
    }
    async getLongUrl(shortCode) {
        logger_1.logger.info(`🔍 Looking for ${shortCode}`);
        // 1️⃣ Check cache
        const cachedUrl = await redis_1.redis.get(shortCode);
        if (cachedUrl) {
            return { longUrl: cachedUrl, fromCache: true };
        }
        // 2️⃣ DB fallback
        const record = await this.repo.findByShortCode(shortCode);
        if (!record)
            return null;
        // 3️⃣ Save to cache
        await redis_1.redis.set(shortCode, record.longUrl, "EX", 60 * 60);
        return { longUrl: record.longUrl, fromCache: false };
    }
}
exports.UrlService = UrlService;
