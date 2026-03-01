"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlService = void 0;
const url_repository_1 = require("./url.repository");
const base62_1 = require("../../utils/base62");
const redis_1 = require("../../config/redis");
const logger_1 = require("../../utils/logger");
const analytics_service_1 = require("../analytics/analytics.service");
class UrlService {
    constructor() {
        this.repo = new url_repository_1.UrlRepository();
        this.analytics = new analytics_service_1.AnalyticsService();
    }
    async createShortUrl(longUrl, customAlias) {
        // 1. If custom alias provided, check uniqueness
        if (customAlias) {
            const existing = await this.repo.findByShortCode(customAlias);
            if (existing)
                throw new Error("Custom alias already in use");
        }
        // 2. Create record (use a placeholder shortCode if not custom)
        const url = await this.repo.create({
            longUrl,
            shortCode: customAlias || `tmp_${Date.now()}`,
            customAlias
        });
        // 3. If no custom alias, generate Base62 from ID and update
        if (!customAlias) {
            const shortCode = (0, base62_1.encodeBase62)(url.id);
            await this.repo.updateShortCode(url.id, shortCode);
            url.shortCode = shortCode;
        }
        // 4. Cache it
        await redis_1.redis.set(url.shortCode, longUrl, "EX", 60 * 60 * 24);
        return url;
    }
    async getAllUrls() {
        return this.repo.findMany();
    }
    async getLongUrl(shortCode, trackingData) {
        // 1️⃣ Check cache
        const cachedUrl = await redis_1.redis.get(shortCode);
        let record;
        if (cachedUrl) {
            record = { id: 0n, longUrl: cachedUrl }; // ID unknown from cache, need it for tracking?
            // Actually tracking needs urlId. Let's see.
        }
        // 2️⃣ DB lookup if needed for tracking or cache miss
        // For tracking, we always need the URL ID.
        const fullRecord = await this.repo.findByShortCode(shortCode);
        if (!fullRecord)
            return null;
        // 3️⃣ Save to cache if miss
        if (!cachedUrl) {
            await redis_1.redis.set(shortCode, fullRecord.longUrl, "EX", 60 * 60 * 24);
        }
        // 4️⃣ Async track click
        if (trackingData) {
            this.analytics.trackClick(fullRecord.id, trackingData.ip, trackingData.ua, trackingData.referer).catch(err => logger_1.logger.error("Analytics tracking failed", err));
        }
        return fullRecord;
    }
}
exports.UrlService = UrlService;
