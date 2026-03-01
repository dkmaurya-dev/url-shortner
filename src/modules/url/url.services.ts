import { UrlRepository } from "./url.repository";
import { encodeBase62 } from "../../utils/base62";
import { redis } from "../../config/redis";
import { logger } from "../../utils/logger";
import { AnalyticsService } from "../analytics/analytics.service";

export class UrlService {
  private repo = new UrlRepository();
  private analytics = new AnalyticsService();

  async createShortUrl(longUrl: string, customAlias?: string) {
    // 1. If custom alias provided, check uniqueness
    if (customAlias) {
      const existing = await this.repo.findByShortCode(customAlias);
      if (existing) throw new Error("Custom alias already in use");
    }

    // 2. Create record (use a placeholder shortCode if not custom)
    const url = await this.repo.create({
      longUrl,
      shortCode: customAlias || `tmp_${Date.now()}`,
      customAlias
    });

    // 3. If no custom alias, generate Base62 from ID and update
    if (!customAlias) {
      const shortCode = encodeBase62(url.id);
      await this.repo.updateShortCode(url.id, shortCode);
      url.shortCode = shortCode;
    }

    // 4. Cache it
    await redis.set(url.shortCode, longUrl, "EX", 60 * 60 * 24);

    return url;
  }

  async getAllUrls() {
    return this.repo.findMany();
  }

  async getLongUrl(shortCode: string, trackingData?: { ip: string; ua: string; referer: string }) {
    // 1️⃣ Check cache
    const cachedUrl = await redis.get(shortCode);

    let record;
    if (cachedUrl) {
      record = { id: 0n, longUrl: cachedUrl }; // ID unknown from cache, need it for tracking?
      // Actually tracking needs urlId. Let's see.
    }

    // 2️⃣ DB lookup if needed for tracking or cache miss
    // For tracking, we always need the URL ID.
    const fullRecord = await this.repo.findByShortCode(shortCode);
    if (!fullRecord) return null;

    // 3️⃣ Save to cache if miss
    if (!cachedUrl) {
      await redis.set(shortCode, fullRecord.longUrl, "EX", 60 * 60 * 24);
    }

    // 4️⃣ Async track click
    if (trackingData) {
      this.analytics.trackClick(
        fullRecord.id,
        trackingData.ip,
        trackingData.ua,
        trackingData.referer
      ).catch(err => logger.error("Analytics tracking failed", err));
    }

    return fullRecord;
  }
}
